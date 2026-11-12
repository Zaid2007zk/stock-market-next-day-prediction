"""
User Models and Authenticated Identity Schemas
"""

from typing import Optional, List
from pydantic import BaseModel, Field


class AuthenticatedUser(BaseModel):
    """Authenticated user context extracted from validated Supabase JWT."""
    id: str = Field(..., description="Supabase Auth User UUID (sub claim)")
    email: Optional[str] = Field(None, description="User email address")
    role: str = Field("authenticated", description="Supabase user role")
    aud: str = Field("authenticated", description="Token audience")
    app_metadata: dict = Field(default_factory=dict)
    user_metadata: dict = Field(default_factory=dict)


class UserProfile(BaseModel):
    """User profile response model."""
    id: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: Optional[str] = None


class UserProfileUpdate(BaseModel):
    """User profile update request model."""
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
