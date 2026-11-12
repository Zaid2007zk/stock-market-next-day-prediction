"""
Mock Market Data Provider
Generates deterministic synthetic OHLCV time series, quotes, and fundamentals
for testing and staging without external network dependencies.
"""

import math
import hashlib
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from app.models.market import QuoteData, OHLCVBar, SymbolSearchResult, FundamentalsData
from app.providers.market_data.base import MarketDataProvider


# Reference mock universe covering Indian and US equities
MOCK_SYMBOL_DIRECTORY = [
    {"symbol": "RELIANCE.NS", "name": "Reliance Industries Ltd", "exchange": "NSE", "country": "IN", "base_price": 2450.0},
    {"symbol": "TCS.NS", "name": "Tata Consultancy Services Ltd", "exchange": "NSE", "country": "IN", "base_price": 3850.0},
    {"symbol": "HDFCBANK.NS", "name": "HDFC Bank Ltd", "exchange": "NSE", "country": "IN", "base_price": 1480.0},
    {"symbol": "INFY.NS", "name": "Infosys Ltd", "exchange": "NSE", "country": "IN", "base_price": 1520.0},
    {"symbol": "ICICIBANK.NS", "name": "ICICI Bank Ltd", "exchange": "NSE", "country": "IN", "base_price": 1050.0},
    {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ", "country": "US", "base_price": 185.0},
    {"symbol": "MSFT", "name": "Microsoft Corporation", "exchange": "NASDAQ", "country": "US", "base_price": 420.0},
    {"symbol": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ", "country": "US", "base_price": 160.0},
]


def _seed_from_symbol(symbol: str) -> int:
    """Generates an integer seed from ticker symbol for deterministic series."""
    return int(hashlib.mds5(symbol.encode()).hexdigest()[:8], 16) if hasattr(hashlib, 'mds5') else int(hashlib.sha256(symbol.encode()).hexdigest()[:8], 16)


class MockMarketDataProvider(MarketDataProvider):
    """
    Deterministic synthetic market data provider.
    Guarantees reproducible price bars for unit tests and local evaluation.
    """

    @property
    def provider_name(self) -> str:
        return "Mock Market Data Provider (Synthetic Staging)"

    async def get_quote(self, symbol: str) -> Optional[QuoteData]:
        sym = symbol.upper()
        # Find matching item or generate based on hash
        base_item = next((item for item in MOCK_SYMBOL_DIRECTORY if item["symbol"] == sym), None)
        base_price = base_item["base_price"] if base_item else 100.0
        exchange = base_item["exchange"] if base_item else ("NSE" if ".NS" in sym else "NASDAQ")

        # Deterministic day variation based on current date
        now = datetime.now(timezone.utc)
        day_seed = now.year * 10000 + now.month * 100 + now.day + _seed_from_symbol(sym)
        drift = math.sin(day_seed % 360) * 0.02  # +/- 2%

        prev_close = round(base_price, 2)
        price = round(base_price * (1.0 + drift), 2)
        change = round(price - prev_close, 2)
        change_pct = round((change / prev_close) * 100.0, 2)
        high = round(max(price, prev_close) * 1.01, 2)
        low = round(min(price, prev_close) * 0.99, 2)

        return QuoteData(
            symbol=sym,
            exchange=exchange,
            price=price,
            change=change,
            change_percent=change_pct,
            open=round(prev_close * 1.002, 2),
            high=high,
            low=low,
            previous_close=prev_close,
            volume=1500000.0,
            timestamp=now.isoformat(),
            is_delayed=False,
            is_stale=False,
            source=self.provider_name,
        )

    async def get_historical_ohlcv(
        self,
        symbol: str,
        timeframe: str = "1D",
        lookback_days: int = 365,
    ) -> List[OHLCVBar]:
        sym = symbol.upper()
        base_item = next((item for item in MOCK_SYMBOL_DIRECTORY if item["symbol"] == sym), None)
        current_price = base_item["base_price"] if base_item else 100.0

        bars: List[OHLCVBar] = []
        now = datetime.now(timezone.utc)
        seed = _seed_from_symbol(sym)

        # Generate daily bars backward in time, then reverse
        for i in range(lookback_days, 0, -1):
            bar_date = now - timedelta(days=i)
            # Skip weekends (Saturday=5, Sunday=6)
            if bar_date.weekday() >= 5:
                continue

            step = (lookback_days - i) + (seed % 100)
            daily_drift = math.sin(step * 0.1) * 0.015 + math.cos(step * 0.05) * 0.01
            current_price = max(1.0, current_price * (1.0 + daily_drift))

            bar_open = round(current_price * (1.0 - math.sin(step) * 0.005), 2)
            bar_close = round(current_price, 2)
            bar_high = round(max(bar_open, bar_close) * (1.0 + abs(math.cos(step) * 0.008)), 2)
            bar_low = round(min(bar_open, bar_close) * (1.0 - abs(math.sin(step * 2) * 0.008)), 2)
            bar_vol = round(1000000 + math.sin(step) * 400000, 0)

            bars.append(OHLCVBar(
                timestamp=bar_date.strftime("%Y-%m-%d"),
                open=bar_open,
                high=bar_high,
                low=bar_low,
                close=bar_close,
                volume=bar_vol,
            ))

        return bars

    async def search_symbols(self, query: str) -> List[SymbolSearchResult]:
        q = query.strip().upper()
        if not q:
            return []
        results = []
        for item in MOCK_SYMBOL_DIRECTORY:
            if q in item["symbol"].upper() or q in item["name"].upper():
                results.append(SymbolSearchResult(
                    symbol=item["symbol"],
                    name=item["name"],
                    exchange=item["exchange"],
                    asset_type="EQUITY",
                    country=item["country"],
                ))
        return results

    async def get_fundamentals(self, symbol: str) -> Optional[FundamentalsData]:
        sym = symbol.upper()
        base_item = next((item for item in MOCK_SYMBOL_DIRECTORY if item["symbol"] == sym), None)
        base_price = base_item["base_price"] if base_item else 100.0

        return FundamentalsData(
            symbol=sym,
            pe_ratio=24.5,
            pb_ratio=3.2,
            debt_to_equity=0.45,
            roe=16.8,
            market_cap=base_price * 1000000000.0,
            fifty_two_week_high=round(base_price * 1.25, 2),
            fifty_two_week_low=round(base_price * 0.82, 2),
            source=self.provider_name,
        )
