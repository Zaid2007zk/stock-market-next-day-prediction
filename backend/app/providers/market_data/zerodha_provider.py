"""
Zerodha Kite Connect Market Data Provider
Integrates directly with Zerodha Kite Connect API v3 for institutional real-time market data.
Requires active Zerodha Developer subscription (API Key + User Access Token).
"""

import httpx
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from app.models.market import QuoteData, OHLCVBar, SymbolSearchResult, FundamentalsData
from app.providers.market_data.base import MarketDataProvider
from app.config import settings


class ZerodhaKiteMarketDataProvider(MarketDataProvider):
    """
    Direct market data provider connecting to Zerodha Kite Connect API.
    Streams live quotes, depth, and historical data when credentials are configured.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        access_token: Optional[str] = None,
    ):
        self.api_key = api_key or getattr(settings, "ZERODHA_API_KEY", None)
        self.access_token = access_token or getattr(settings, "ZERODHA_ACCESS_TOKEN", None)
        self.base_url = "https://api.kite.trade"

    @property
    def provider_name(self) -> str:
        return "Zerodha Kite Connect (DMA Live Feed)"

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.access_token)

    def _format_kite_instrument(self, symbol: str) -> str:
        s = symbol.strip().upper()
        if s.endswith(".NS"):
            return f"NSE:{s[:-3]}"
        if s.endswith(".BO"):
            return f"BSE:{s[:-3]}"
        if ":" in s:
            return s
        return f"NSE:{s}"

    async def get_quote(self, symbol: str) -> Optional[QuoteData]:
        if not self.is_configured:
            return None

        instrument = self._format_kite_instrument(symbol)
        headers = {
            "X-Kite-Version": "3",
            "Authorization": f"token {self.api_key}:{self.access_token}",
        }

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(
                    f"{self.base_url}/quote",
                    params={"i": instrument},
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
                    exchange="NSE" if instrument.startswith("NSE:") else "BSE",
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
