"""
User Profile Endpoints (Scoped to Authenticated User)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user
from app.models.user import AuthenticatedUser, UserProfile, UserProfileUpdate
from app.db.repository import DatabaseRepository, get_repository

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/profile", response_model=UserProfile)
async def get_user_profile(
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Retrieves profile of the authenticated user. Enforced via auth.uid()."""
    profile = await repo.get_profile(current_user.id, email=current_user.email)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")
    return profile


@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    data: UserProfileUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Updates profile of the authenticated user. Enforced via auth.uid()."""
    return await repo.update_profile(current_user.id, data)
