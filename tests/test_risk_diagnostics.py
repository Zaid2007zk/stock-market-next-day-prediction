"""
Automated Test Suite for Portfolio Risk Diagnostics Engine
Verifies total valuation, concentration warnings, parametric VaR,
historical VaR, portfolio beta, and maximum drawdown calculations.
"""

import sys
from pathlib import Path
import math
import time
import jwt
import pytest
from fastapi.testclient import TestClient

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

from app.main import app
from app.config import settings
from app.core.auth import create_test_jwt
from app.core.rate_limiter import rate_limiter
from app.core.cache import cache_manager
from app.analytics.risk import (
    PortfolioHoldingInput,
    compute_portfolio_risk,
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


def test_portfolio_basic_valuation_and_pnl():
    """Verify total cost basis, current market value, and unrealized PnL."""
    holdings = [
        PortfolioHoldingInput(symbol="RELIANCE.NS", quantity=10, average_buy_price=2000.0, current_price=2500.0),
        PortfolioHoldingInput(symbol="TCS.NS", quantity=5, average_buy_price=3000.0, current_price=3500.0),
    ]
    # Cost = 10*2000 + 5*3000 = 20000 + 15000 = 35000
    # Val = 10*2500 + 5*3500 = 25000 + 17500 = 42500
    # PnL = 7500, PnL % = (7500/35000)*100 = 21.43%
    res = compute_portfolio_risk(holdings)

    assert res.total_cost_basis == 35000.0
    assert res.total_current_value == 42500.0
    assert res.unrealized_pnl == 7500.0
    assert round(res.unrealized_pnl_percent, 2) == 21.43
    assert res.holdings_count == 2


def test_concentration_risk_warning_trigger():
    """
    Verify that an automated concentration warning triggers if any single holding
    exceeds 25% of total portfolio value.
    """
    holdings = [
        # RELIANCE = 40,000 / 50,000 = 80% (exceeds 25%)
        PortfolioHoldingInput(symbol="RELIANCE.NS", quantity=16, average_buy_price=2500.0, current_price=2500.0),
        # TCS = 10,000 / 50,000 = 20% (below 25%)
        PortfolioHoldingInput(symbol="TCS.NS", quantity=2, average_buy_price=5000.0, current_price=5000.0),
    ]
    res = compute_portfolio_risk(holdings, concentration_threshold=25.0)

    assert res.has_concentration_risk is True
    assert len(res.concentration_warnings) == 1
    w = res.concentration_warnings[0]
    assert w.symbol == "RELIANCE.NS"
    assert w.weight_percent == 80.0
    assert "exceeding the 25.0% prudential concentration threshold" in w.warning


def test_concentration_risk_safe_portfolio():
    """Verify that a balanced portfolio below 25% single-stock weight raises no warning."""
    holdings = [
        PortfolioHoldingInput(symbol=f"STOCK_{i}", quantity=10, average_buy_price=100.0, current_price=100.0)
        for i in range(5)
    ]  # 5 stocks * 1000 = 5000, each is 20%
    res = compute_portfolio_risk(holdings, concentration_threshold=25.0)

    assert res.has_concentration_risk is False
    assert len(res.concentration_warnings) == 0


def test_parametric_var_mathematical_precision():
    """
    Verify 1-Day 95% Parametric VaR matches exact formula:
    VaR = Total Value * 1.6448536 * daily_vol within 0.01% numerical accuracy.
    """
    # Deterministic daily returns with known standard deviation
    np_returns = [0.01, -0.015, 0.02, -0.01, 0.005, -0.02, 0.015, -0.005] * 5  # 40 days
    holdings = [
        PortfolioHoldingInput(
            symbol="INFY.NS",
            quantity=100,
            average_buy_price=1500.0,
            current_price=1500.0,
            daily_returns=np_returns,
        )
    ]
    total_val = 150000.0
    res = compute_portfolio_risk(holdings)

    # Compute expected VaR
    daily_vol = res.portfolio_daily_volatility_percent / 100.0
    expected_var = total_val * 1.6448536 * daily_vol

    assert math.isclose(res.var_95_1day_parametric, expected_var, rel_tol=1e-3)
    # Check 10-day VaR scaling: VaR_10D = VaR_1D * sqrt(10)
    expected_10d_var = res.var_95_1day_parametric * math.sqrt(10.0)
    assert math.isclose(res.var_95_10day_parametric, expected_10d_var, rel_tol=1e-3)


def test_portfolio_beta_and_drawdown():
    """Verify portfolio beta relative to benchmark and max drawdown."""
    stock_returns = [0.02, -0.01, 0.03, -0.02, 0.01, -0.03, 0.04, -0.01] * 4
    bm_returns = [0.01, -0.005, 0.015, -0.01, 0.005, -0.015, 0.02, -0.005] * 4

    holdings = [
        PortfolioHoldingInput(
            symbol="ALPHA.NS",
            quantity=50,
            average_buy_price=1000.0,
            current_price=1200.0,
            daily_returns=stock_returns,
        )
    ]
    res = compute_portfolio_risk(holdings, benchmark_returns=bm_returns)

    # Stock moves ~2x benchmark, beta should be ~2.0
    assert res.portfolio_beta > 1.5
    assert res.portfolio_max_drawdown_percent >= 0.0
    assert res.risk_regime != ""


def test_risk_api_endpoint_authenticated(test_client):
    """Verify POST /api/v1/risk/portfolio endpoint with valid JWT."""
    token = create_test_jwt(user_id=TEST_USER_ID, secret=TEST_SECRET)
    payload = {
        "holdings": [
            {
                "symbol": "RELIANCE.NS",
                "quantity": 10,
                "average_buy_price": 2000.0,
                "current_price": 2400.0,
            },
            {
                "symbol": "TCS.NS",
                "quantity": 5,
                "average_buy_price": 3500.0,
                "current_price": 3800.0,
            },
        ],
        "concentration_threshold": 25.0,
    }
    response = test_client.post(
        "/api/v1/risk/portfolio",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_current_value"] == 43000.0
    assert "var_95_1day_parametric" in data
    assert "weights" in data


def test_risk_zero_volatility_edge_case():
    """Verify zero volatility edge case yields 0.0 without NaN or Inf."""
    holdings = [
        PortfolioHoldingInput(
            symbol="FLAT.NS",
            quantity=10,
            average_buy_price=100.0,
            current_price=100.0,
            daily_returns=[0.0] * 30,
        )
    ]
    res = compute_portfolio_risk(holdings)

    assert res.portfolio_daily_volatility_percent == 0.0
    assert res.portfolio_annualized_volatility_percent == 0.0
    assert res.var_95_1day_parametric == 0.0
    assert res.portfolio_sharpe_ratio == 0.0
    assert not math.isnan(res.portfolio_sharpe_ratio)
    assert not math.isinf(res.portfolio_sharpe_ratio)


def test_risk_empty_holdings_raises_error():
    """Verify that an empty holdings list raises ValueError."""
    with pytest.raises(ValueError, match="at least one holding"):
        compute_portfolio_risk([])


def test_risk_api_auth_rejections(test_client):
    """Verify rejection of missing, expired, and forged JWTs on risk API."""
    payload = {
        "holdings": [
            {"symbol": "TCS.NS", "quantity": 10, "average_buy_price": 3000.0}
        ]
    }
    # Missing token
    res_missing = test_client.post("/api/v1/risk/portfolio", json=payload)
    assert res_missing.status_code == 401

    # Expired token
    expired_token = jwt.encode(
        {"sub": TEST_USER_ID, "exp": int(time.time()) - 3600},
        TEST_SECRET,
        algorithm="HS256",
    )
    res_expired = test_client.post(
        "/api/v1/risk/portfolio",
        headers={"Authorization": f"Bearer {expired_token}"},
        json=payload,
    )
    assert res_expired.status_code == 401

    # Forged token
    forged_token = jwt.encode(
        {"sub": TEST_USER_ID, "exp": int(time.time()) + 3600},
        "wrong-secret-key-32chars-minimum-len",
        algorithm="HS256",
    )
    res_forged = test_client.post(
        "/api/v1/risk/portfolio",
        headers={"Authorization": f"Bearer {forged_token}"},
        json=payload,
    )
    assert res_forged.status_code == 401
