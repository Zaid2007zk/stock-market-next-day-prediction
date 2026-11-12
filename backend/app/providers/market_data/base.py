"""
Abstract Market Data Provider Interface
Completely isolates the MarketPulse application from specific vendor APIs.
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from app.models.market import QuoteData, OHLCVBar, SymbolSearchResult, FundamentalsData


class MarketDataProvider(ABC):
    """
    Abstract protocol defining the required contracts for any market data provider.
    Enables pluggable switching between Mock, Authorized CSV, and future licensed live feeds.
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the market data provider for source attribution."""
        pass

    @abstractmethod
    async def get_quote(self, symbol: str) -> Optional[QuoteData]:
        """Fetch the latest available quote for a given symbol."""
        pass

    @abstractmethod
    async def get_historical_ohlcv(
        self,
        symbol: str,
        timeframe: str = "1D",
        lookback_days: int = 365,
    ) -> List[OHLCVBar]:
        """Fetch historical candlestick OHLCV bars."""
        pass

    @abstractmethod
    async def search_symbols(self, query: str) -> List[SymbolSearchResult]:
        """Search symbol directory by ticker or company name."""
        pass

    @abstractmethod
    async def get_fundamentals(self, symbol: str) -> Optional[FundamentalsData]:
        """Fetch fundamental valuation and financial ratios for a given symbol."""
        pass
