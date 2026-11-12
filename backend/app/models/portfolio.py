"""
Portfolio Models and Schemas
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class PortfolioHolding(BaseModel):
    id: str = Field(..., description="Holding UUID")
    user_id: str = Field(..., description="Owner User UUID")
    symbol: str = Field(..., description="Stock symbol, e.g., INFY.NS")
    exchange: str = Field(..., description="Exchange identifier")
    quantity: float = Field(..., gt=0, description="Number of shares held")
    average_buy_price: float = Field(..., gt=0, description="Average purchase price")
    currency: str = Field(default="INR", description="Currency code (INR, USD)")
    purchase_date: Optional[str] = Field(None, description="Purchase date (YYYY-MM-DD)")
    notes: Optional[str] = Field(None, description="User notes on position")
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class PortfolioHoldingCreate(BaseModel):
    symbol: str = Field(..., description="Stock symbol")
    exchange: str = Field(default="NSE", description="Exchange code")
    quantity: float = Field(..., gt=0, description="Quantity")
    average_buy_price: float = Field(..., gt=0, description="Average cost per share")
    currency: str = Field(default="INR", description="Currency code")
    purchase_date: Optional[str] = None
    notes: Optional[str] = None


class PortfolioHoldingUpdate(BaseModel):
    quantity: Optional[float] = Field(None, gt=0)
    average_buy_price: Optional[float] = Field(None, gt=0)
    notes: Optional[str] = None
