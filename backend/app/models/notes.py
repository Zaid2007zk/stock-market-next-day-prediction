"""
Research Notes Models and Schemas
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ResearchNote(BaseModel):
    id: str = Field(..., description="Note UUID")
    user_id: str = Field(..., description="Owner User UUID")
    symbol: str = Field(..., description="Stock symbol, e.g., TCS.NS")
    title: str = Field(..., description="Note title")
    content: str = Field(..., description="Markdown or text content")
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: Optional[str] = None


class ResearchNoteCreate(BaseModel):
    symbol: str = Field(..., description="Stock symbol")
    title: str = Field(..., min_length=1, max_length=200, description="Note title")
    content: str = Field(..., description="Note content")


class ResearchNoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = None
