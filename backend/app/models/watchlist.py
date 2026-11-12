"""
Watchlist Models and Schemas
"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class WatchlistItem(BaseModel):
    id: str = Field(..., description="Unique item UUID")
    watchlist_id: str = Field(..., description="Parent watchlist UUID")
    symbol: str = Field(..., description="Stock symbol, e.g., RELIANCE.NS, AAPL")
    exchange: str = Field(..., description="Exchange identifier, e.g., NSE, BSE, NASDAQ")
    added_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class WatchlistItemCreate(BaseModel):
    symbol: str = Field(..., description="Stock symbol to add")
    exchange: str = Field(default="NSE", description="Exchange identifier")


class Watchlist(BaseModel):
    id: str = Field(..., description="Watchlist UUID")
    user_id: str = Field(..., description="Owner User UUID")
    name: str = Field(..., description="Watchlist name")
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    items: List[WatchlistItem] = Field(default_factory=list)


class WatchlistCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Watchlist name")


class WatchlistUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Updated watchlist name")
