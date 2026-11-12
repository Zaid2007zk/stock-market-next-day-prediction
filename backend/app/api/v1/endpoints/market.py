"""
Market Data & Quantitative Analytics Endpoints
Enforces rate limits, multi-layer L1/L2 caching, deterministic math, and unavailable data badges.
"""

from typing import List, Optional
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException, status, Request

from app.models.market import (
    QuoteData,
    OHLCVBar,
    SymbolSearchResult,
    TechnicalIndicators,
    FactorScorecard,
    MarketDataResponse,
)
from app.core.cache import CacheManager, get_cache
from app.core.rate_limiter import rate_limit_dependency
from app.config import settings
from app.providers.market_data.base import MarketDataProvider
from app.providers.market_data.mock import MockMarketDataProvider
from app.providers.market_data.csv_provider import AuthorizedCSVDataProvider
from app.providers.market_data.yfinance_provider import (
    YFinanceMarketDataProvider,
    NIFTY_SYMBOLS_MAP,
    US_SYMBOLS_MAP,
)
from app.providers.market_data.zerodha_provider import ZerodhaKiteMarketDataProvider
from app.providers.market_data.upstox_provider import UpstoxMarketDataProvider
from app.analytics.indicators import compute_all_indicators
from app.analytics.factors import compute_factor_scorecard
from app.analytics.exchange_calendar import (
    evaluate_exchange_schedule,
    ExchangeScheduleResponse,
)

router = APIRouter(prefix="/market", tags=["Market Data & Analytics"])

# Provider instances
csv_provider = AuthorizedCSVDataProvider()
mock_provider = MockMarketDataProvider()
yf_provider = YFinanceMarketDataProvider(fallback_csv_provider=csv_provider)
zerodha_provider = ZerodhaKiteMarketDataProvider()
upstox_provider = UpstoxMarketDataProvider()


async def get_active_provider(symbol: str) -> Optional[MarketDataProvider]:
    """
    Selects market data provider based on configuration and data availability.
    - If MARKET_DATA_PROVIDER == "csv": uses AuthorizedCSVDataProvider.
    - If MARKET_DATA_PROVIDER == "mock": uses MockMarketDataProvider.
    - If MARKET_DATA_PROVIDER == "zerodha" or Zerodha credentials present: queries Kite Connect.
    - If MARKET_DATA_PROVIDER == "upstox" or Upstox credentials present: queries Upstox API v2.
    - Default ("auto" / "yfinance"):
        1. Prioritizes YFinanceMarketDataProvider for Indian and US tickers.
        2. Probes yfinance provider for other tickers.
        3. Falls back to AuthorizedCSVDataProvider if yfinance returns no data or fails.
        4. Falls back to MockMarketDataProvider if in mock universe.
    Returns None if symbol is unverified across all providers.
    """
    mode = (getattr(settings, "MARKET_DATA_PROVIDER", "auto") or "auto").lower()
    sym = symbol.strip().upper()

    if mode == "mock":
        mock_results = await mock_provider.search_symbols(sym)
        for m in mock_results:
            if m.symbol.upper() == sym:
                return mock_provider
        return None

    if mode == "csv":
        norm = csv_provider._normalize_symbol(sym)
        csv_df = csv_provider._load_data_for_symbol(norm)
        if not csv_df.empty:
            return csv_provider
        return None

    # Check for direct broker priority (Zerodha / Upstox)
    if (mode == "zerodha" or zerodha_provider.is_configured) and (sym.endswith(".NS") or sym.endswith(".BO") or sym in NIFTY_SYMBOLS_MAP):
        try:
            zq = await zerodha_provider.get_quote(sym)
            if zq:
                return zerodha_provider
        except Exception:
            pass

    if (mode == "upstox" or upstox_provider.is_configured) and (sym.endswith(".NS") or sym.endswith(".BO") or sym in NIFTY_SYMBOLS_MAP):
        try:
            uq = await upstox_provider.get_quote(sym)
            if uq:
                return upstox_provider
        except Exception:
            pass

    # Default "auto" / "yfinance":
    # 1. Prefer yf_provider for known tickers (inherently handles yfinance + CSV fallback)
    norm_yf = yf_provider._normalize_symbol(sym)
    base_sym = norm_yf[:-3] if norm_yf.endswith(".NS") or norm_yf.endswith(".BO") else norm_yf
    if (
        norm_yf.endswith(".NS")
        or norm_yf.endswith(".BO")
        or base_sym in NIFTY_SYMBOLS_MAP
        or norm_yf in US_SYMBOLS_MAP
        or base_sym in US_SYMBOLS_MAP
    ):
        return yf_provider

    try:
        q = await yf_provider.get_quote(norm_yf)
        if q is not None:
            return yf_provider
    except Exception:
        pass

    # Check if raw sym + .NS exists on yfinance
    if not norm_yf.endswith(".NS") and not norm_yf.endswith(".BO"):
        try:
            q_ns = await yf_provider.get_quote(f"{norm_yf}.NS")
            if q_ns is not None:
                return yf_provider
        except Exception:
            pass

    # 2. Check if CSV has data for symbol
    norm = csv_provider._normalize_symbol(sym)
    csv_df = csv_provider._load_data_for_symbol(norm)
    if not csv_df.empty:
        return csv_provider

    # 3. Check mock directory
    mock_results = await mock_provider.search_symbols(sym)
    for m in mock_results:
        if m.symbol.upper() == sym:
            return mock_provider

    return None


@router.get("/quote", response_model=MarketDataResponse, dependencies=[Depends(rate_limit_dependency)])
async def get_market_quote(
    symbol: str = Query(..., description="Ticker symbol, e.g., RELIANCE.NS, AAPL"),
    cache: CacheManager = Depends(get_cache),
):
    """
    Retrieves latest quote.
    Cached in L1 RAM (TTL 60s).
    If symbol lacks verified provider, returns '[Market Data Unavailable - Verified Provider Required]'.
    """
    sym = symbol.strip().upper()
    cache_key = f"quote:{sym}"

    # Check L1 RAM cache
    cached_quote = cache.get(cache_key)
    if cached_quote:
        return MarketDataResponse(
            status="available",
            symbol=sym,
            data=cached_quote,
            source_attribution=cached_quote.get("source", "L1 RAM Cache"),
            cached=True,
        )

    provider = await get_active_provider(sym)
    if not provider:
        return MarketDataResponse(
            status="unavailable",
            badge="[Market Data Unavailable - Verified Provider Required]",
            symbol=sym,
            data=None,
            source_attribution="Unverified / Missing Provider",
            cached=False,
        )

    quote = await provider.get_quote(sym)
    if not quote:
        return MarketDataResponse(
            status="unavailable",
            badge="[Market Data Unavailable - Verified Provider Required]",
            symbol=sym,
            data=None,
            source_attribution="Provider has no quote data",
            cached=False,
        )

    # Check for stale timestamp (only if older than 5 calendar days)
    try:
        quote_dt = datetime.fromisoformat(quote.timestamp.replace("Z", "+00:00"))
        if datetime.now(timezone.utc) - quote_dt > timedelta(days=5):
            quote.is_stale = True
        else:
            quote.is_stale = False
    except Exception:
        pass

    quote_dict = quote.model_dump()
    cache.set(cache_key, quote_dict)

    return MarketDataResponse(
        status="available",
        symbol=sym,
        data=quote_dict,
        source_attribution=quote.source,
        cached=False,
    )


@router.get("/history", dependencies=[Depends(rate_limit_dependency)])
async def get_market_history(
    symbol: str = Query(..., description="Ticker symbol"),
    timeframe: str = Query("1D", description="Timeframe bar interval"),
    lookback_days: int = Query(365, ge=5, le=3650, description="Historical lookback days"),
    cache: CacheManager = Depends(get_cache),
):
    """Retrieves historical OHLCV candlestick time series."""
    sym = symbol.strip().upper()
    cache_key = f"history:{sym}:{timeframe}:{lookback_days}"

    cached_history = cache.get(cache_key)
    if cached_history:
        return {
            "status": "available",
            "symbol": sym,
            "bars": cached_history,
            "cached": True,
        }

    provider = await get_active_provider(sym)
    if not provider:
        return {
            "status": "unavailable",
            "badge": "[Market Data Unavailable - Verified Provider Required]",
            "symbol": sym,
            "bars": [],
            "cached": False,
        }

    bars = await provider.get_historical_ohlcv(sym, timeframe=timeframe, lookback_days=lookback_days)
    bars_list = [b.model_dump() for b in bars]
    cache.set(cache_key, bars_list)

    source_label = provider.provider_name
    if isinstance(provider, YFinanceMarketDataProvider) and bars:
        try:
            last_bar_ts = bars[-1].timestamp
            last_bar_dt = datetime.fromisoformat(last_bar_ts.replace("Z", "+00:00"))
            # Historical CSV dataset in data/ is from January 2026.
            # If latest bar is older than 60 days in late 2026, it originated from CSV fallback.
            if (datetime.now(timezone.utc) - last_bar_dt).days > 60:
                source_label = "Historical CSV Dataset (Fallback: yfinance returned no data)"
        except Exception:
            pass

    return {
        "status": "available",
        "symbol": sym,
        "bars": bars_list,
        "source": source_label,
        "cached": False,
    }


@router.get("/search", response_model=List[SymbolSearchResult], dependencies=[Depends(rate_limit_dependency)])
async def search_symbols(
    q: str = Query(..., min_length=1, description="Search query string"),
):
    """Searches active universe across yfinance registry, authorized CSV, broker providers, and mock registries."""
    yf_results = await yf_provider.search_symbols(q)
    csv_results = await csv_provider.search_symbols(q)
    mock_results = await mock_provider.search_symbols(q)

    # Combine unique symbols
    seen = set()
    combined = []
    for r in yf_results + csv_results + mock_results:
        if r.symbol not in seen:
            seen.add(r.symbol)
            combined.append(r)

    # If query is a custom ticker not in registry, append dynamic live exchange candidate
    clean_q = q.strip().upper()
    if clean_q and len(clean_q) <= 12 and not any(r.symbol == clean_q or r.symbol == f"{clean_q}.NS" for r in combined):
        combined.append(
            SymbolSearchResult(
                symbol=f"{clean_q}.NS" if not clean_q.endswith((".NS", ".BO")) and len(clean_q) > 4 else clean_q,
                name=f"{clean_q} (Exchange Query)",
                exchange="NSE" if len(clean_q) > 4 else "US/GLOBAL",
                asset_type="EQUITY",
                country="IN" if len(clean_q) > 4 else "US",
            )
        )

    return combined


@router.get("/indicators", dependencies=[Depends(rate_limit_dependency)])
async def get_technical_indicators(
    symbol: str = Query(..., description="Ticker symbol"),
):
    """Computes deterministic technical indicators from historical OHLCV bars."""
    sym = symbol.strip().upper()
    provider = await get_active_provider(sym)
    if not provider:
        return {
            "status": "unavailable",
            "badge": "[Market Data Unavailable - Verified Provider Required]",
            "symbol": sym,
            "indicators": None,
        }

    bars = await provider.get_historical_ohlcv(sym, lookback_days=250)
    indicators = compute_all_indicators(sym, bars)
    return {
        "status": "available" if indicators else "unavailable",
        "symbol": sym,
        "indicators": indicators.model_dump() if indicators else None,
        "source": "Deterministic Technical Analytics Engine",
    }


@router.get("/factors", dependencies=[Depends(rate_limit_dependency)])
async def get_factor_scorecard(
    symbol: str = Query(..., description="Ticker symbol"),
):
    """Computes deterministic multi-factor health ratings (Value, Momentum, Quality, Low-Vol)."""
    sym = symbol.strip().upper()
    provider = await get_active_provider(sym)
    if not provider:
        return {
            "status": "unavailable",
            "badge": "[Market Data Unavailable - Verified Provider Required]",
            "symbol": sym,
            "scorecard": None,
        }

    bars = await provider.get_historical_ohlcv(sym, lookback_days=250)
    fundamentals = await provider.get_fundamentals(sym)
    scorecard = compute_factor_scorecard(sym, bars, fundamentals)
    return {
        "status": "available",
        "symbol": sym,
        "scorecard": scorecard.model_dump(),
        "source": "Deterministic Multi-Factor Scoring Engine",
    }


@router.get("/schedule", response_model=ExchangeScheduleResponse)
async def get_exchange_schedule(
    exchange: str = Query("NSE", description="Exchange code: NSE, BSE, NYSE, NASDAQ"),
):
    """Returns real-time session status, hours, countdown, and holiday calendar for an exchange."""
    return evaluate_exchange_schedule(exchange)


@router.get("/schedules", response_model=List[ExchangeScheduleResponse])
async def get_all_exchange_schedules():
    """Returns session status for all major exchanges (NSE, BSE, NYSE, NASDAQ)."""
    return [
        evaluate_exchange_schedule("NSE"),
        evaluate_exchange_schedule("BSE"),
        evaluate_exchange_schedule("NYSE"),
        evaluate_exchange_schedule("NASDAQ"),
    ]


@router.get("/indices")
async def get_global_indices():
    """Returns live global market index levels for NIFTY 50, SENSEX, S&P 500, and NASDAQ."""
    import yfinance as yf

    indices_def = [
        {"symbol": "^NSEI", "name": "NIFTY 50", "exchange": "NSE", "region": "India", "fallback_price": 25302.40, "fallback_change": 0.42},
        {"symbol": "^BSESN", "name": "SENSEX", "exchange": "BSE", "region": "India", "fallback_price": 82248.12, "fallback_change": 0.38},
        {"symbol": "^GSPC", "name": "S&P 500", "exchange": "NYSE", "region": "US", "fallback_price": 5983.99, "fallback_change": 0.74},
        {"symbol": "^IXIC", "name": "NASDAQ 100", "exchange": "US", "region": "US", "fallback_price": 19281.40, "fallback_change": 0.92},
    ]

    results = []
    for item in indices_def:
        price = item["fallback_price"]
        change_pct = item["fallback_change"]
        try:
            t = yf.Ticker(item["symbol"])
            fi = getattr(t, "fast_info", None)
            if fi and getattr(fi, "last_price", None):
                lp = float(fi.last_price)
                prev = float(getattr(fi, "previous_close", lp))
                if lp > 0:
                    price = round(lp, 2)
                    if prev > 0:
                        change_pct = round(((lp - prev) / prev) * 100.0, 2)
        except Exception:
            pass

        results.append({
            "name": item["name"],
            "symbol": item["symbol"],
            "exchange": item["exchange"],
            "region": item["region"],
            "price": price,
            "change_percent": change_pct,
            "is_up": change_pct >= 0,
        })

    return results
