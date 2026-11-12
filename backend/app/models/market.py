"""
Market Data Models and Schemas
Includes quotes, OHLCV time series, technical indicators, factor scorecards, and source attribution.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class OHLCVBar(BaseModel):
    """Single candlestick bar."""
    timestamp: str = Field(..., description="ISO 8601 or YYYY-MM-DD timestamp")
    open: float = Field(..., description="Opening price")
    high: float = Field(..., description="High price")
    low: float = Field(..., description="Low price")
    close: float = Field(..., description="Closing price")
    volume: float = Field(..., description="Trading volume")


class QuoteData(BaseModel):
    """Real-time / latest available price quote."""
    symbol: str = Field(..., description="Ticker symbol, e.g., RELIANCE.NS, AAPL")
    exchange: str = Field(..., description="Exchange identifier, e.g., NSE, BSE, NASDAQ")
    price: float = Field(..., description="Current / last traded price")
    change: float = Field(..., description="Absolute change from previous close")
    change_percent: float = Field(..., description="Percentage change from previous close")
    open: float = Field(..., description="Open price")
    high: float = Field(..., description="Day high")
    low: float = Field(..., description="Day low")
    previous_close: float = Field(..., description="Previous session close")
    volume: float = Field(..., description="Session volume")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    is_delayed: bool = Field(default=False, description="True if feed is delayed")
    is_stale: bool = Field(default=False, description="True if timestamp is older than threshold")
    source: str = Field(..., description="Data provider attribution, e.g., 'Authorized CSV Dataset', 'Mock Data Provider'")


class SymbolSearchResult(BaseModel):
    """Symbol search autocomplete result."""
    symbol: str
    name: str
    exchange: str
    asset_type: str = "EQUITY"
    country: str = "IN"  # "IN" | "US"


class FundamentalsData(BaseModel):
    """Fundamental valuation and financial ratio metrics."""
    symbol: str
    pe_ratio: Optional[float] = Field(None, description="Price to Earnings ratio")
    pb_ratio: Optional[float] = Field(None, description="Price to Book ratio")
    debt_to_equity: Optional[float] = Field(None, description="Debt to Equity ratio")
    roe: Optional[float] = Field(None, description="Return on Equity (%)")
    market_cap: Optional[float] = Field(None, description="Market Capitalization")
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    source: str = "Calculated"


class TechnicalIndicators(BaseModel):
    """Computed technical indicators for a given symbol."""
    symbol: str
    timestamp: str
    sma_20: Optional[float] = None
    sma_50: Optional[float] = None
    sma_200: Optional[float] = None
    ema_9: Optional[float] = None
    ema_21: Optional[float] = None
    rsi_14: Optional[float] = None
    macd_line: Optional[float] = None
    macd_signal: Optional[float] = None
    macd_histogram: Optional[float] = None
    bollinger_upper: Optional[float] = None
    bollinger_middle: Optional[float] = None
    bollinger_lower: Optional[float] = None
    atr_14: Optional[float] = None


class FactorScorecard(BaseModel):
    """Multi-factor quantitative health ratings (scale 0-100)."""
    symbol: str
    composite_score: float = Field(..., description="Overall score 0-100")
    value_score: float = Field(..., description="Value factor score 0-100")
    momentum_score: float = Field(..., description="Momentum factor score 0-100")
    quality_score: float = Field(..., description="Quality factor score 0-100")
    volatility_score: float = Field(..., description="Low volatility score 0-100")
    rating: str = Field(..., description="Strong Buy | Buy | Neutral | Underperform | Avoid")
    summary: str


class MarketDataResponse(BaseModel):
    """Unified response wrapper with unavailable / stale badge governance."""
    status: str = Field(..., description="'available' | 'unavailable'")
    badge: Optional[str] = Field(None, description="e.g. '[Market Data Unavailable - Verified Provider Required]'")
    symbol: str
    data: Optional[Dict[str, Any]] = None
    source_attribution: str
    cached: bool = False
