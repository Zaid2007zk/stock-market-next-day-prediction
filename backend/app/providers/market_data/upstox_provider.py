"""
Upstox v2 Market Data Provider
Integrates directly with Upstox API v2 for real-time equity market data.
Requires active Upstox Developer API subscription (API Key + Access Token).
"""

import httpx
from typing import List, Optional
from datetime import datetime, timezone
from app.models.market import QuoteData, OHLCVBar, SymbolSearchResult, FundamentalsData
from app.providers.market_data.base import MarketDataProvider
from app.config import settings


class UpstoxMarketDataProvider(MarketDataProvider):
    """
    Direct market data provider connecting to Upstox API v2.
    Streams live quotes and market feeds when credentials are configured.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        access_token: Optional[str] = None,
    ):
        self.api_key = api_key or getattr(settings, "UPSTOX_API_KEY", None)
        self.access_token = access_token or getattr(settings, "UPSTOX_ACCESS_TOKEN", None)
        self.base_url = "https://api.upstox.com/v2"

    @property
    def provider_name(self) -> str:
        return "Upstox Pro (Direct Broker Feed)"

    @property
    def is_configured(self) -> bool:
        return bool(self.access_token)

    def _format_upstox_instrument(self, symbol: str) -> str:
        s = symbol.strip().upper()
        if s.endswith(".NS"):
            return f"NSE_EQ|{s[:-3]}"
        if s.endswith(".BO"):
            return f"BSE_EQ|{s[:-3]}"
        return f"NSE_EQ|{s}"

    async def get_quote(self, symbol: str) -> Optional[QuoteData]:
        if not self.is_configured:
            return None

        instrument = self._format_upstox_instrument(symbol)
        headers = {
            "Accept": "application/json",
            "Authorization": f"Bearer {self.access_token}",
        }

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(
                    f"{self.base_url}/market-quote/quotes",
                    params={"instrument_key": instrument},
                    headers=headers,
                )
                if res.status_code != 200:
                    return None

                data = res.json().get("data", {}).get(instrument)
                if not data:
                    return None

                price = float(data.get("last_price", 0.0))
                ohlc = data.get("ohlc", {})
                prev_close = float(ohlc.get("close", price))
                change = round(price - prev_close, 2)
                change_pct = round((change / prev_close) * 100.0, 2) if prev_close > 0 else 0.0

                return QuoteData(
                    symbol=symbol,
                    exchange="NSE" if "NSE" in instrument else "BSE",
                    price=price,
                    change=change,
                    change_percent=change_pct,
                    open=float(ohlc.get("open", price)),
                    high=float(ohlc.get("high", price)),
                    low=float(ohlc.get("low", price)),
                    previous_close=prev_close,
                    volume=float(data.get("volume", 0.0)),
                    timestamp=datetime.now(timezone.utc).isoformat(),
                    is_delayed=False,
                    is_stale=False,
                    source=self.provider_name,
                )
        except Exception:
            return None

    async def get_historical_ohlcv(
        self,
        symbol: str,
        timeframe: str = "1D",
        lookback_days: int = 365,
    ) -> List[OHLCVBar]:
        return []

    async def search_symbols(self, query: str) -> List[SymbolSearchResult]:
        return []

    async def get_fundamentals(self, symbol: str) -> Optional[FundamentalsData]:
        return None
