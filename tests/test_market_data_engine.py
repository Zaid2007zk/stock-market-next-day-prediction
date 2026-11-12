"""
tests/test_market_data_engine.py

Automated Test Suite for Milestone 3: Market Data Engine & Deterministic Math
1. MockMarketDataProvider contract and reproducibility test.
2. AuthorizedCSVDataProvider verification on historical data/ CSVs.
3. Deterministic mathematical accuracy tests (SMA, EMA, RSI, MACD, Bollinger Bands).
4. Deterministic factor scorecard computation.
5. Missing/unverified market data governance badge assertion.
6. Token-bucket rate limiting enforcement (20 req/min threshold -> HTTP 429 with Retry-After).
7. L1 in-process RAM caching verification.
"""

import sys
import time
import asyncio
from pathlib import Path
import pytest
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

from app.main import app
from app.providers.market_data.mock import MockMarketDataProvider
from app.providers.market_data.csv_provider import AuthorizedCSVDataProvider
from app.analytics.indicators import (
    calculate_sma,
    calculate_ema,
    calculate_rsi,
    calculate_macd,
    calculate_bollinger_bands,
    compute_all_indicators,
)
from app.analytics.factors import compute_factor_scorecard
from app.core.rate_limiter import rate_limiter
from app.core.cache import cache_manager

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_rate_limit_and_cache():
    """Reset rate limiter buckets and L1 cache between tests."""
    rate_limiter.reset()
    cache_manager.clear()


def test_mock_market_data_provider():
    """Validates MockMarketDataProvider generates valid OHLCV bars and quotes."""
    provider = MockMarketDataProvider()
    symbol = "RELIANCE.NS"

    quote = asyncio.run(provider.get_quote(symbol))
    assert quote is not None
    assert quote.symbol == symbol
    assert quote.price > 0
    assert quote.high >= quote.low
    assert "Mock" in quote.source

    bars = asyncio.run(provider.get_historical_ohlcv(symbol, lookback_days=60))
    assert len(bars) > 30
    for b in bars:
        assert b.low <= b.open <= b.high
        assert b.low <= b.close <= b.high
        assert b.volume >= 0

    search_res = asyncio.run(provider.search_symbols("AAPL"))
    assert len(search_res) >= 1
    assert search_res[0].symbol == "AAPL"


def test_authorized_csv_market_data_provider():
    """Validates AuthorizedCSVDataProvider reads historical data from data/ directory."""
    provider = AuthorizedCSVDataProvider()
    # Use symbol that exists in data/ (e.g. ADANIENT or ADANIPORTS)
    symbol = "ADANIENT.NS"

    quote = asyncio.run(provider.get_quote(symbol))
    assert quote is not None, "Failed to read ADANIENT from data/*.csv"
    assert quote.price > 0
    assert quote.exchange == "NSE"
    assert "CSV" in quote.source

    bars = asyncio.run(provider.get_historical_ohlcv(symbol, lookback_days=100))
    assert len(bars) > 0
    assert bars[-1].close == quote.price

    search_res = asyncio.run(provider.search_symbols("ADANI"))
    assert len(search_res) >= 1



def test_deterministic_technical_indicators_math():
    """Validates exact mathematical correctness of indicator formulas."""
    # 1. Simple Moving Average (SMA)
    series = pd.Series([10.0, 20.0, 30.0, 40.0, 50.0])
    sma = calculate_sma(series, window=5)
    assert pytest.approx(sma.iloc[-1], rel=1e-5) == 30.0

    # 2. Exponential Moving Average (EMA)
    # EMA_t = alpha * P_t + (1 - alpha) * EMA_{t-1}, alpha = 2 / (span + 1)
    ema = calculate_ema(series, span=3)
    alpha = 2.0 / (3.0 + 1.0)  # 0.5
    # step 0: 10.0
    # step 1: 0.5 * 20 + 0.5 * 10 = 15.0
    # step 2: 0.5 * 30 + 0.5 * 15 = 22.5
    # step 3: 0.5 * 40 + 0.5 * 22.5 = 31.25
    # step 4: 0.5 * 50 + 0.5 * 31.25 = 40.625
    assert pytest.approx(ema.iloc[-1], rel=1e-5) == 40.625

    # 3. Relative Strength Index (RSI)
    # Monotonically increasing series -> RSI must approach 100
    increasing = pd.Series([float(i) for i in range(1, 30)])
    rsi_inc = calculate_rsi(increasing, period=14)
    assert rsi_inc.iloc[-1] == 100.0

    # Monotonically decreasing series -> RSI must approach 0
    decreasing = pd.Series([float(100 - i) for i in range(1, 30)])
    rsi_dec = calculate_rsi(decreasing, period=14)
    assert pytest.approx(rsi_dec.iloc[-1], abs=1e-2) == 0.0

    # 4. Bollinger Bands
    bb = calculate_bollinger_bands(series, window=5, num_std=2.0)
    middle = bb["bollinger_middle"].iloc[-1]
    upper = bb["bollinger_upper"].iloc[-1]
    lower = bb["bollinger_lower"].iloc[-1]
    assert pytest.approx(upper - middle, rel=1e-5) == pytest.approx(middle - lower, rel=1e-5)

    # 5. MACD
    macd = calculate_macd(pd.Series([float(i * 2) for i in range(50)]))
    assert "macd_line" in macd.columns
    assert "macd_signal" in macd.columns
    assert "macd_histogram" in macd.columns
    # histogram == macd_line - macd_signal
    diff = macd["macd_line"] - macd["macd_signal"]
    np.testing.assert_allclose(macd["macd_histogram"].values, diff.values, rtol=1e-5)


def test_factor_scorecard_calculation():
    """Validates multi-factor scorecard returns valid scores and ratings."""
    provider = MockMarketDataProvider()
    bars = asyncio.run(provider.get_historical_ohlcv("RELIANCE.NS", lookback_days=100))
    fundamentals = asyncio.run(provider.get_fundamentals("RELIANCE.NS"))

    scorecard = compute_factor_scorecard("RELIANCE.NS", bars, fundamentals)
    assert 0.0 <= scorecard.composite_score <= 100.0
    assert 0.0 <= scorecard.momentum_score <= 100.0
    assert 0.0 <= scorecard.value_score <= 100.0
    assert 0.0 <= scorecard.quality_score <= 100.0
    assert 0.0 <= scorecard.volatility_score <= 100.0
    assert scorecard.rating in ["Strong Buy", "Buy", "Neutral", "Underperform", "Avoid"]
    assert "RELIANCE.NS" in scorecard.summary



def test_unavailable_market_data_badge():
    """Querying an unverified ticker must return structured badge without error."""
    response = client.get("/api/v1/market/quote?symbol=UNVERIFIED_XYZ_999")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "unavailable"
    assert data["badge"] == "[Market Data Unavailable - Verified Provider Required]"
    assert data["data"] is None


def test_token_bucket_rate_limiter_enforcement():
    """
    Rapid requests above 20 req/min must return HTTP 429 Too Many Requests
    with Retry-After header.
    """
    client_ip_headers = {"X-Forwarded-For": "198.51.100.25"}

    # First 20 requests must succeed (HTTP 200)
    for i in range(20):
        res = client.get("/api/v1/market/quote?symbol=RELIANCE.NS", headers=client_ip_headers)
        assert res.status_code == 200, f"Request {i+1} failed with status {res.status_code}"

    # Requests 21 through 25 must be rate limited (HTTP 429)
    for i in range(21, 26):
        res = client.get("/api/v1/market/quote?symbol=RELIANCE.NS", headers=client_ip_headers)
        assert res.status_code == 429, f"Request {i} was not rate limited! Got {res.status_code}"
        assert "Retry-After" in res.headers
        assert "Rate limit exceeded" in res.json()["detail"]


def test_l1_in_process_cache_hit_and_resilience():
    """Subsequent quote query within TTL must be served from L1 RAM cache."""
    # First request: cache miss, cached
    res1 = client.get("/api/v1/market/quote?symbol=TCS.NS")
    assert res1.status_code == 200
    assert res1.json()["cached"] is False

    # Second request: served from L1 memory cache
    res2 = client.get("/api/v1/market/quote?symbol=TCS.NS")
    assert res2.status_code == 200
    assert res2.json()["cached"] is True
    assert res2.json()["data"]["symbol"] == "TCS.NS"


def test_yfinance_market_data_provider():
    """Validates YFinanceMarketDataProvider contracts, ticker normalization, and non-live labeling."""
    from app.providers.market_data.yfinance_provider import YFinanceMarketDataProvider
    provider = YFinanceMarketDataProvider()
    symbol = "RELIANCE"

    quote = asyncio.run(provider.get_quote(symbol))
    assert quote is not None
    assert quote.symbol == "RELIANCE.NS"
    assert quote.price > 0
    assert quote.exchange == "NSE"
    assert "yfinance" in quote.source
    assert quote.is_delayed is True
    # Crucial compliance: must never label as live exchange quote
    assert "Live" not in quote.source

    bars = asyncio.run(provider.get_historical_ohlcv(symbol, lookback_days=30))
    assert len(bars) > 0
    for b in bars:
        assert b.low <= b.open <= b.high
        assert b.low <= b.close <= b.high

    search_res = asyncio.run(provider.search_symbols("RELIANCE"))
    assert any(r.symbol == "RELIANCE.NS" for r in search_res)
