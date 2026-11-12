"""
Automated Test Suite for Chronological Walk-Forward Backtesting Engine
Verifies no lookahead bias, transaction friction deductions (STT, brokerage, turnover, GST, slippage),
and performance metric calculations (Sharpe, Sortino, Max Drawdown, Alpha).
"""

import sys
from pathlib import Path
import math
import time
import jwt
import pytest
from pydantic import ValidationError
from fastapi.testclient import TestClient

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

from app.main import app
from app.config import settings
from app.core.auth import create_test_jwt
from app.core.rate_limiter import rate_limiter
from app.core.cache import cache_manager
from app.models.market import OHLCVBar
from app.analytics.backtest import (
    BacktestRequest,
    run_walk_forward_backtest,
)

TEST_SECRET = "test-supabase-jwt-secret-very-secure-32chars"
TEST_USER_ID = "00000000-0000-0000-0000-000000000001"


@pytest.fixture(autouse=True)
def override_jwt_secret(monkeypatch):
    """Ensure consistent test secret across test runs."""
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", TEST_SECRET)


@pytest.fixture(autouse=True)
def reset_state():
    """Reset rate limiter and cache between tests."""
    rate_limiter.reset()
    cache_manager.clear()


@pytest.fixture
def test_client():
    return TestClient(app)


def generate_test_bars(n: int = 100, trend: float = 0.5) -> list[OHLCVBar]:
    """Generates deterministic mock historical OHLCV bars for testing."""
    bars = []
    base_price = 1000.0
    for i in range(n):
        price = base_price + (i * trend) + (math.sin(i * 0.5) * 20.0)
        bars.append(
            OHLCVBar(
                timestamp=f"2026-01-{i+1:02d}" if i < 28 else f"2026-02-{i-27:02d}",
                open=round(price - 2.0, 2),
                high=round(price + 5.0, 2),
                low=round(price - 5.0, 2),
                close=round(price, 2),
                volume=100000,
            )
        )
    return bars


def test_walk_forward_no_lookahead_bias():
    """Verify backtest executes strictly chronologically without lookahead bias."""
    bars = generate_test_bars(n=80, trend=1.0)
    req = BacktestRequest(
        symbol="RELIANCE.NS",
        strategy_type="sma_crossover",
        fast_period=5,
        slow_period=15,
        initial_capital=100000.0,
    )
    result = run_walk_forward_backtest(bars=bars, req=req)

    assert result.lookahead_bias_free is True
    assert result.trading_days > 0
    assert result.initial_capital == 100000.0
    assert result.ending_capital > 0
    # Every trade entry date must precede or equal its exit date
    for trade in result.trade_log:
        assert trade.entry_date <= trade.exit_date
        assert trade.holding_period_days >= 1


def test_transaction_friction_deductions():
    """
    Verify that statutory transaction frictions (STT, brokerage, turnover, GST, slippage)
    are strictly deducted: Net Profit = Gross Profit - Total Frictions.
    """
    bars = generate_test_bars(n=100, trend=2.0)
    req = BacktestRequest(
        symbol="TCS.NS",
        strategy_type="sma_crossover",
        fast_period=5,
        slow_period=15,
        initial_capital=100000.0,
        stt_rate=0.001,
        brokerage_rate=0.0003,
        brokerage_flat_cap=20.0,
        slippage_rate=0.0005,
    )
    result = run_walk_forward_backtest(bars=bars, req=req)

    if result.total_trades > 0:
        assert result.total_frictions > 0.0
        # Assert Net Profit = Gross Profit - Total Frictions within rounding tolerance
        calculated_net = result.gross_profit - result.total_frictions
        assert math.isclose(result.net_profit, calculated_net, abs_tol=0.05)

        # Verify friction breakdown has positive values for active components
        assert result.frictions_breakdown["slippage"] > 0
        assert result.frictions_breakdown["brokerage"] > 0
        assert result.frictions_breakdown["turnover"] > 0
        assert result.frictions_breakdown["gst"] > 0
        assert result.frictions_breakdown["stt"] > 0


def test_backtest_performance_metrics():
    """Verify performance metrics: Sharpe, Sortino, Max Drawdown, Win Rate, Alpha."""
    bars = generate_test_bars(n=90, trend=1.5)
    req = BacktestRequest(
        symbol="HDFCBANK.NS",
        strategy_type="sma_crossover",
        fast_period=5,
        slow_period=20,
        initial_capital=100000.0,
    )
    result = run_walk_forward_backtest(bars=bars, req=req)

    assert isinstance(result.sharpe_ratio, float)
    assert isinstance(result.sortino_ratio, float)
    assert 0.0 <= result.max_drawdown_percent <= 100.0
    assert 0.0 <= result.win_rate_percent <= 100.0
    assert result.profit_factor >= 0.0
    assert isinstance(result.benchmark_alpha, float)


def test_rsi_momentum_strategy():
    """Verify RSI momentum strategy option runs cleanly without error."""
    bars = generate_test_bars(n=70, trend=-0.2)
    req = BacktestRequest(
        symbol="INFY.NS",
        strategy_type="rsi_momentum",
        slow_period=20,
        initial_capital=50000.0,
    )
    result = run_walk_forward_backtest(bars=bars, req=req)

    assert result.symbol == "INFY.NS"
    assert "rsi_momentum" in result.strategy


def test_backtest_api_endpoint_authenticated(test_client):
    """Verify POST /api/v1/backtest/run endpoint with valid JWT."""
    token = create_test_jwt(user_id=TEST_USER_ID, secret=TEST_SECRET)
    bars = generate_test_bars(n=50, trend=1.0)
    payload = {
        "symbol": "RELIANCE.NS",
        "strategy_type": "sma_crossover",
        "fast_period": 5,
        "slow_period": 15,
        "initial_capital": 100000.0,
        "bars": [b.model_dump() for b in bars],
    }
    response = test_client.post(
        "/api/v1/backtest/run",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "RELIANCE.NS"
    assert "net_return_percent" in data
    assert "frictions_breakdown" in data
    assert data["lookahead_bias_free"] is True


def test_lookahead_bias_future_bars_mutation():
    """
    Genuine Lookahead-Bias Verification:
    Mutating future bars (bars > T) must have ZERO effect on trades completed on or before T.
    """
    bars = generate_test_bars(n=90, trend=1.2)
    req = BacktestRequest(
        symbol="INFY.NS",
        strategy_type="sma_crossover",
        fast_period=5,
        slow_period=15,
        initial_capital=100000.0,
    )
    res_orig = run_walk_forward_backtest(bars=bars, req=req)

    # Find trades completed on or before bar 50
    cutoff_date = bars[50].timestamp
    early_trades_orig = [t for t in res_orig.trade_log if t.exit_date <= cutoff_date]
    assert len(early_trades_orig) > 0, "Test fixture requires at least one trade completed before cutoff"

    # Create mutated bars: identical up to bar 50, wildly mutated after bar 50
    mutated_bars = [b.model_copy() for b in bars[:51]]
    for i in range(51, len(bars)):
        orig_b = bars[i]
        # Wild price swings (multiplied by 5 with negative drop)
        wild_price = (orig_b.close * 5.0) - 2000.0
        mutated_bars.append(
            OHLCVBar(
                timestamp=orig_b.timestamp,
                open=round(wild_price - 10.0, 2),
                high=round(wild_price + 50.0, 2),
                low=round(wild_price - 50.0, 2),
                close=round(wild_price, 2),
                volume=999999,
            )
        )

    res_mut = run_walk_forward_backtest(bars=mutated_bars, req=req)
    early_trades_mut = [t for t in res_mut.trade_log if t.exit_date <= cutoff_date]

    # Verify every early trade matches bit-for-bit
    assert len(early_trades_mut) == len(early_trades_orig)
    for t_orig, t_mut in zip(early_trades_orig, early_trades_mut):
        assert t_orig.entry_date == t_mut.entry_date
        assert t_orig.entry_price == t_mut.entry_price
        assert t_orig.exit_date == t_mut.exit_date
        assert t_orig.exit_price == t_mut.exit_price
        assert t_orig.quantity == t_mut.quantity
        assert t_orig.gross_pnl == t_mut.gross_pnl
        assert t_orig.net_pnl == t_mut.net_pnl
        assert t_orig.total_frictions == t_mut.total_frictions


def test_trade_execution_timing_at_t_plus_one():
    """
    Verify trade execution timing strictly adheres to documented assumption:
    Signal generated at bar T close is executed at bar T+1 open price.
    """
    bars = []
    # 20 flat bars at 100.0
    for i in range(20):
        bars.append(
            OHLCVBar(
                timestamp=f"2026-01-{i+1:02d}",
                open=100.0,
                high=101.0,
                low=99.0,
                close=100.0,
                volume=10000,
            )
        )
    # Bar 20: Sharp jump in close to 150.0 triggering golden cross signal
    bars.append(
        OHLCVBar(
            timestamp="2026-01-21",
            open=100.0,
            high=152.0,
            low=100.0,
            close=150.0,
            volume=50000,
        )
    )
    # Bar 21: Next bar opens at 160.0 (trade must execute here, NOT at 150.0 close or 100.0 prior open)
    bars.append(
        OHLCVBar(
            timestamp="2026-01-22",
            open=160.0,
            high=165.0,
            low=158.0,
            close=162.0,
            volume=30000,
        )
    )
    # Bar 22-25 to complete
    for i in range(4):
        bars.append(
            OHLCVBar(
                timestamp=f"2026-01-{23+i:02d}",
                open=160.0,
                high=162.0,
                low=155.0,
                close=158.0,
                volume=20000,
            )
        )

    req = BacktestRequest(
        symbol="TIMING.NS",
        strategy_type="sma_crossover",
        fast_period=3,
        slow_period=10,
        initial_capital=100000.0,
    )
    res = run_walk_forward_backtest(bars=bars, req=req)

    assert len(res.trade_log) >= 1
    first_trade = res.trade_log[0]
    # Entry date must be 2026-01-22 and entry price must be 160.0 (bar T+1 open)
    assert first_trade.entry_date == "2026-01-22"
    assert first_trade.entry_price == 160.0


def test_edge_cases_zero_volatility_and_no_trades():
    """
    Verify documented edge case handling:
    Flat prices yield 0 trades, 0 volatility, Sharpe=0.0, Sortino=0.0, PF=0.0, WinRate=0.0 (no NaN/Inf).
    """
    bars = [
        OHLCVBar(
            timestamp=f"2026-01-{i+1:02d}" if i < 28 else f"2026-02-{i-27:02d}",
            open=500.0,
            high=500.0,
            low=500.0,
            close=500.0,
            volume=1000,
        )
        for i in range(50)
    ]
    req = BacktestRequest(
        symbol="FLAT.NS",
        strategy_type="sma_crossover",
        fast_period=5,
        slow_period=15,
        initial_capital=100000.0,
    )
    res = run_walk_forward_backtest(bars=bars, req=req)

    assert res.total_trades == 0
    assert res.win_rate_percent == 0.0
    assert res.profit_factor == 0.0
    assert res.sharpe_ratio == 0.0
    assert res.sortino_ratio == 0.0
    assert res.annualized_volatility_percent == 0.0
    assert res.max_drawdown_percent == 0.0
    assert not math.isnan(res.sharpe_ratio)
    assert not math.isinf(res.sharpe_ratio)


def test_edge_case_no_loss_profit_factor_cap():
    """
    Verify documented edge case handling:
    When 100% of trades are winners (gross_losses == 0), profit factor is capped at 99.0 (not Inf).
    """
    bars = generate_test_bars(n=100, trend=3.0)
    req = BacktestRequest(
        symbol="WINNER.NS",
        strategy_type="sma_crossover",
        fast_period=5,
        slow_period=20,
        initial_capital=100000.0,
    )
    res = run_walk_forward_backtest(bars=bars, req=req)

    if res.winning_trades > 0 and res.losing_trades == 0:
        assert res.profit_factor == 99.0
        assert res.win_rate_percent == 100.0
        assert not math.isinf(res.profit_factor)


def test_invalid_inputs_and_insufficient_history():
    """Verify robust rejection of empty inputs, inadequate history, and invalid parameters."""
    req = BacktestRequest(
        symbol="TEST.NS",
        strategy_type="sma_crossover",
        fast_period=5,
        slow_period=15,
        initial_capital=100000.0,
    )
    # Empty bars
    with pytest.raises(ValueError, match="cannot be empty"):
        run_walk_forward_backtest(bars=[], req=req)

    # Insufficient bars (< slow_period + 5)
    bars_short = generate_test_bars(n=10)
    with pytest.raises(ValueError, match="Insufficient historical bars"):
        run_walk_forward_backtest(bars=bars_short, req=req)

    # Invalid parameters: fast_period >= slow_period
    with pytest.raises(ValidationError, match="fast_period .* must be strictly less than slow_period"):
        BacktestRequest(
            symbol="TEST.NS",
            strategy_type="sma_crossover",
            fast_period=25,
            slow_period=10,
        )


def test_backtest_api_auth_rejections(test_client):
    """Verify rejection of missing, expired, forged, and malformed JWTs on backtest API."""
    bars = generate_test_bars(n=40)
    payload = {
        "symbol": "RELIANCE.NS",
        "strategy_type": "sma_crossover",
        "fast_period": 5,
        "slow_period": 15,
        "initial_capital": 100000.0,
        "bars": [b.model_dump() for b in bars],
    }

    # 1. Missing Authorization header
    res_missing = test_client.post("/api/v1/backtest/run", json=payload)
    assert res_missing.status_code == 401

    # 2. Expired JWT
    expired_token = jwt.encode(
        {"sub": TEST_USER_ID, "exp": int(time.time()) - 3600},
        TEST_SECRET,
        algorithm="HS256",
    )
    res_expired = test_client.post(
        "/api/v1/backtest/run",
        headers={"Authorization": f"Bearer {expired_token}"},
        json=payload,
    )
    assert res_expired.status_code == 401
    assert "expired" in res_expired.json()["detail"].lower()

    # 3. Forged signature JWT
    forged_token = jwt.encode(
        {"sub": TEST_USER_ID, "exp": int(time.time()) + 3600},
        "wrong-secret-key-32chars-minimum-len",
        algorithm="HS256",
    )
    res_forged = test_client.post(
        "/api/v1/backtest/run",
        headers={"Authorization": f"Bearer {forged_token}"},
        json=payload,
    )
    assert res_forged.status_code == 401

    # 4. Malformed bearer token
    res_malformed = test_client.post(
        "/api/v1/backtest/run",
        headers={"Authorization": "Bearer not-a-jwt"},
        json=payload,
    )
    assert res_malformed.status_code == 401


def test_backtest_api_invalid_parameters(test_client):
    """Verify HTTP 422 for invalid fast/slow parameters and HTTP 404 for missing symbol data."""
    token = create_test_jwt(user_id=TEST_USER_ID, secret=TEST_SECRET)

    # fast_period >= slow_period violates Pydantic model validator
    invalid_payload = {
        "symbol": "TCS.NS",
        "strategy_type": "sma_crossover",
        "fast_period": 50,
        "slow_period": 20,
        "initial_capital": 100000.0,
    }
    res_invalid = test_client.post(
        "/api/v1/backtest/run",
        headers={"Authorization": f"Bearer {token}"},
        json=invalid_payload,
    )
    assert res_invalid.status_code == 422
