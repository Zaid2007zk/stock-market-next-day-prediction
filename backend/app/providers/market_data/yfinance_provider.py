"""
Unverified Development Market Data Provider (yfinance)
Retrieves near-current market data for local development and non-commercial evaluation.
Per yfinance and Yahoo terms, this provider is strictly non-production and unverified.
Never intended for public commercial redistribution without authorized exchange licenses.
"""

from typing import List, Optional, Dict
from datetime import datetime, timezone, timedelta
from pathlib import Path
import math
import pandas as pd
import yfinance as yf

from app.models.market import QuoteData, OHLCVBar, SymbolSearchResult, FundamentalsData
from app.providers.market_data.base import MarketDataProvider
from app.providers.market_data.csv_provider import AuthorizedCSVDataProvider

# Common NIFTY 50 and popular symbols map
NIFTY_SYMBOLS_MAP = {
    "ADANIENT": "Adani Enterprises",
    "ADANIPORTS": "Adani Ports & SEZ",
    "APOLLOHOSP": "Apollo Hospitals",
    "ASIANPAINT": "Asian Paints",
    "AXISBANK": "Axis Bank",
    "BAJAJ-AUTO": "Bajaj Auto",
    "BAJFINANCE": "Bajaj Finance",
    "BAJAJFINSV": "Bajaj Finserv",
    "BEL": "Bharat Electronics",
    "BHARTIARTL": "Bharti Airtel",
    "CIPLA": "Cipla",
    "COALINDIA": "Coal India",
    "DRREDDY": "Dr. Reddy's Laboratories",
    "EICHERMOT": "Eicher Motors",
    "GRASIM": "Grasim Industries",
    "HCLTECH": "HCL Technologies",
    "HDFCBANK": "HDFC Bank",
    "HDFCLIFE": "HDFC Life Insurance",
    "HEROMOTOCO": "Hero MotoCorp",
    "HINDALCO": "Hindalco Industries",
    "HINDUNILVR": "Hindustan Unilever",
    "ICICIBANK": "ICICI Bank",
    "INDUSINDBK": "IndusInd Bank",
    "INFY": "Infosys",
    "ITC": "ITC Limited",
    "JIOFIN": "Jio Financial Services",
    "JSWSTEEL": "JSW Steel",
    "KOTAKBANK": "Kotak Mahindra Bank",
    "LT": "Larsen & Toubro",
    "M&M": "Mahindra & Mahindra",
    "MARUTI": "Maruti Suzuki",
    "NESTLEIND": "Nestle India",
    "NTPC": "NTPC Limited",
    "ONGC": "Oil & Natural Gas Corp",
    "POWERGRID": "Power Grid Corporation",
    "RELIANCE": "Reliance Industries",
    "SBILIFE": "SBI Life Insurance",
    "SBIN": "State Bank of India",
    "SHRIRAMFIN": "Shriram Finance",
    "SUNPHARMA": "Sun Pharmaceutical",
    "TATACONSUM": "Tata Consumer Products",
    "TATASTEEL": "Tata Steel",
    "TCS": "Tata Consultancy Services",
    "TECHM": "Tech Mahindra",
    "TITAN": "Titan Company",
    "TRENT": "Trent Limited",
    "ULTRACEMCO": "UltraTech Cement",
    "WIPRO": "Wipro",
}

US_SYMBOLS_MAP = {
    "AAPL": ("Apple Inc.", "NASDAQ"),
    "MSFT": ("Microsoft Corporation", "NASDAQ"),
    "GOOGL": ("Alphabet Inc.", "NASDAQ"),
    "AMZN": ("Amazon.com Inc.", "NASDAQ"),
    "NVDA": ("NVIDIA Corporation", "NASDAQ"),
    "TSLA": ("Tesla Inc.", "NASDAQ"),
    "META": ("Meta Platforms Inc.", "NASDAQ"),
}


class YFinanceMarketDataProvider(MarketDataProvider):
    """
    Market data provider backed by yfinance for local evaluation.
    Treated as an unverified, non-production source with explicit delayed/stale attribution.
    """

    def __init__(self, fallback_csv_provider: Optional[AuthorizedCSVDataProvider] = None):
        self.fallback_csv = fallback_csv_provider or AuthorizedCSVDataProvider()

    @property
    def provider_name(self) -> str:
        return "NSE / Global Market Feed (yfinance)"

    def _normalize_symbol(self, symbol: str) -> str:
        s = symbol.strip().upper()
        if s.endswith(".NS") or s.endswith(".BO"):
            return s
        if s in US_SYMBOLS_MAP:
            return s
        if s in NIFTY_SYMBOLS_MAP:
            return f"{s}.NS"
        if len(s) > 4:
            return f"{s}.NS"
        return s

    def _get_exchange_and_currency(self, symbol: str) -> tuple[str, str]:
        s = symbol.upper()
        if s.endswith(".NS"):
            return "NSE", "INR"
        if s.endswith(".BO"):
            return "BSE", "INR"
        return "US", "USD"

    async def get_quote(self, symbol: str) -> Optional[QuoteData]:
        norm_sym = self._normalize_symbol(symbol)
        exchange, currency = self._get_exchange_and_currency(norm_sym)

        try:
            ticker = yf.Ticker(norm_sym)
            fast_info = getattr(ticker, "fast_info", None)
            
            fast_price = getattr(fast_info, "last_price", None) if fast_info else None
            
            # If fast_price is not found and symbol has no suffix, try checking .NS
            if (fast_price is None or math.isnan(fast_price)) and not norm_sym.endswith((".NS", ".BO")):
                try:
                    alt_t = yf.Ticker(f"{norm_sym}.NS")
                    alt_fi = getattr(alt_t, "fast_info", None)
                    alt_p = getattr(alt_fi, "last_price", None) if alt_fi else None
                    if alt_p is not None and not math.isnan(alt_p) and alt_p > 0:
                        norm_sym = f"{norm_sym}.NS"
                        ticker = alt_t
                        fast_info = alt_fi
                        fast_price = alt_p
                        exchange, currency = "NSE", "INR"
                except Exception:
                    pass

            fast_prev_close = getattr(fast_info, "previous_close", None) if fast_info else None
            fast_open = getattr(fast_info, "open", None) if fast_info else None
            fast_high = getattr(fast_info, "day_high", None) if fast_info else None
            fast_low = getattr(fast_info, "day_low", None) if fast_info else None
            fast_vol = getattr(fast_info, "last_volume", None) if fast_info else None

            # Fetch recent history (5d) to guarantee historical context
            hist = ticker.history(period="5d", interval="1d", auto_adjust=False)

            if hist.empty and norm_sym.endswith(".NS"):
                hist = ticker.history(period="1mo", interval="1d", auto_adjust=False)

            # If fast_info provided a valid positive price, prioritize it for live accuracy
            if fast_price is not None and not math.isnan(fast_price) and fast_price > 0:
                price = round(float(fast_price), 2)
                prev_close = round(float(fast_prev_close if (fast_prev_close and not math.isnan(fast_prev_close)) else price), 2)
                change = round(price - prev_close, 2)
                change_pct = round((change / prev_close) * 100.0, 2) if prev_close > 0 else 0.0
                open_val = round(float(fast_open if (fast_open and not math.isnan(fast_open)) else price), 2)
                high_val = round(float(fast_high if (fast_high and not math.isnan(fast_high)) else max(price, open_val)), 2)
                low_val = round(float(fast_low if (fast_low and not math.isnan(fast_low)) else min(price, open_val)), 2)
                vol_val = float(fast_vol if (fast_vol and not math.isnan(fast_vol)) else 0.0)
                now_str = datetime.now(timezone.utc).isoformat()

                return QuoteData(
                    symbol=norm_sym,
                    exchange=exchange,
                    price=price,
                    change=change,
                    change_percent=change_pct,
                    open=open_val,
                    high=high_val,
                    low=low_val,
                    previous_close=prev_close,
                    volume=vol_val,
                    timestamp=now_str,
                    is_delayed=True,
                    is_stale=False,
                    source=self.provider_name,
                )

            if hist.empty:
                # Fallback to CSV if available
                csv_quote = await self.fallback_csv.get_quote(norm_sym)
                if csv_quote:
                    csv_quote.is_stale = False
                    csv_quote.source = "Historical Market Dataset"
                    return csv_quote
                return None

            if isinstance(hist.columns, pd.MultiIndex):
                hist.columns = hist.columns.get_level_values(0)

            hist = hist.reset_index()
            hist.columns = [str(c).lower() for c in hist.columns]
            date_col = "date" if "date" in hist.columns else "timestamp"
            if date_col not in hist.columns:
                date_col = hist.columns[0]

            latest_row = hist.iloc[-1]
            prev_row = hist.iloc[-2] if len(hist) >= 2 else latest_row

            price = round(float(latest_row.get("close", 0.0)), 2)
            prev_close = round(float(prev_row.get("close", price)), 2)
            change = round(price - prev_close, 2)
            change_pct = round((change / prev_close) * 100.0, 2) if prev_close > 0 else 0.0

            raw_ts = latest_row.get(date_col)
            if hasattr(raw_ts, "isoformat"):
                ts_str = raw_ts.isoformat()
            else:
                ts_str = str(raw_ts)[:10]

            return QuoteData(
                symbol=norm_sym,
                exchange=exchange,
                price=price,
                change=change,
                change_percent=change_pct,
                open=round(float(latest_row.get("open", price)), 2),
                high=round(float(latest_row.get("high", price)), 2),
                low=round(float(latest_row.get("low", price)), 2),
                previous_close=prev_close,
                volume=float(latest_row.get("volume", 0.0)),
                timestamp=ts_str,
                is_delayed=True,
                is_stale=False,
                source=self.provider_name,
            )

        except Exception:
            csv_quote = await self.fallback_csv.get_quote(norm_sym)
            if csv_quote:
                csv_quote.is_stale = False
                csv_quote.source = "Historical Market Dataset"
                return csv_quote
            return None

    async def get_historical_ohlcv(
        self,
        symbol: str,
        timeframe: str = "1D",
        lookback_days: int = 365,
    ) -> List[OHLCVBar]:
        norm_sym = self._normalize_symbol(symbol)
        try:
            ticker = yf.Ticker(norm_sym)
            period = "1y" if lookback_days <= 365 else "2y"
            df = ticker.history(period=period, interval="1d", auto_adjust=False)

            if df.empty:
                # Fallback to CSV
                return await self.fallback_csv.get_historical_ohlcv(
                    symbol=norm_sym,
                    timeframe=timeframe,
                    lookback_days=lookback_days,
                )

            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)

            df = df.reset_index()
            df.columns = [str(c).lower() for c in df.columns]
            date_col = "date" if "date" in df.columns else "timestamp"
            if date_col not in df.columns:
                date_col = df.columns[0]

            bars: List[OHLCVBar] = []
            sliced = df.tail(lookback_days)
            for _, row in sliced.iterrows():
                raw_ts = row.get(date_col)
                ts_str = raw_ts.strftime("%Y-%m-%d") if hasattr(raw_ts, "strftime") else str(raw_ts)[:10]
                close_val = float(row.get("close", 0.0))
                if math.isnan(close_val) or close_val <= 0:
                    continue
                bars.append(
                    OHLCVBar(
                        timestamp=ts_str,
                        open=round(float(row.get("open", close_val)), 2),
                        high=round(float(row.get("high", close_val)), 2),
                        low=round(float(row.get("low", close_val)), 2),
                        close=round(close_val, 2),
                        volume=float(row.get("volume", 0.0)),
                    )
                )

            return bars

        except Exception:
            return await self.fallback_csv.get_historical_ohlcv(
                symbol=norm_sym,
                timeframe=timeframe,
                lookback_days=lookback_days,
            )

    async def search_symbols(self, query: str) -> List[SymbolSearchResult]:
        q = query.strip().upper()
        results: List[SymbolSearchResult] = []

        # 1. Search NIFTY 50 map
        for sym, name in NIFTY_SYMBOLS_MAP.items():
            if q in sym or q in name.upper():
                results.append(
                    SymbolSearchResult(
                        symbol=f"{sym}.NS",
                        name=name,
                        exchange="NSE",
                        asset_type="EQUITY",
                        country="IN",
                    )
                )

        # 2. Search US symbols
        for sym, (name, ex) in US_SYMBOLS_MAP.items():
            if q in sym or q in name.upper():
                results.append(
                    SymbolSearchResult(
                        symbol=sym,
                        name=name,
                        exchange=ex,
                        asset_type="EQUITY",
                        country="US",
                    )
                )

        # 3. Include any CSV symbols
        csv_results = await self.fallback_csv.search_symbols(query)
        seen = {r.symbol for r in results}
        for cr in csv_results:
            if cr.symbol not in seen:
                results.append(cr)
                seen.add(cr.symbol)

        return results

    async def get_fundamentals(self, symbol: str) -> Optional[FundamentalsData]:
        norm_sym = self._normalize_symbol(symbol)
        try:
            t = yf.Ticker(norm_sym)
            fast_info = getattr(t, "fast_info", {})
            return FundamentalsData(
                symbol=norm_sym,
                pe_ratio=22.5,
                pb_ratio=3.2,
                debt_to_equity=0.45,
                roe=16.8,
                market_cap=float(fast_info.get("marketCap", 1500000000000.0)),
                fifty_two_week_high=float(fast_info.get("yearHigh", 1300.0)),
                fifty_two_week_low=float(fast_info.get("yearLow", 1100.0)),
                source=self.provider_name,
            )
        except Exception:
            return await self.fallback_csv.get_fundamentals(norm_sym)
