"""
Watchlist Endpoints with Strict Multi-Tenant Isolation
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user
from app.models.user import AuthenticatedUser
from app.models.watchlist import (
    Watchlist,
    WatchlistCreate,
    WatchlistUpdate,
    WatchlistItem,
    WatchlistItemCreate,
)
from app.db.repository import DatabaseRepository, get_repository

router = APIRouter(prefix="/watchlists", tags=["Watchlists"])


@router.get("", response_model=List[Watchlist])
async def list_watchlists(
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Lists all watchlists belonging to the authenticated user."""
    return await repo.list_watchlists(current_user.id)


@router.post("", response_model=Watchlist, status_code=status.HTTP_201_CREATED)
async def create_watchlist(
    data: WatchlistCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Creates a new watchlist owned by the authenticated user."""
    return await repo.create_watchlist(current_user.id, data)


@router.get("/{watchlist_id}", response_model=Watchlist)
async def get_watchlist(
    watchlist_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Gets a specific watchlist. Enforces RLS: returns 404 if not owned by user."""
    watchlist = await repo.get_watchlist(current_user.id, watchlist_id)
    if not watchlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found or access denied.",
        )
    return watchlist


@router.put("/{watchlist_id}", response_model=Watchlist)
async def update_watchlist(
    watchlist_id: str,
    data: WatchlistUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Updates a watchlist. Enforces RLS: returns 404 if not owned by user."""
    watchlist = await repo.update_watchlist(current_user.id, watchlist_id, data)
    if not watchlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found or access denied.",
        )
    return watchlist


@router.delete("/{watchlist_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_watchlist(
    watchlist_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Deletes a watchlist. Enforces RLS: returns 404 if not owned by user."""
    deleted = await repo.delete_watchlist(current_user.id, watchlist_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist not found or access denied.",
        )
    return None


@router.post("/{watchlist_id}/items", response_model=WatchlistItem, status_code=status.HTTP_201_CREATED)
async def add_watchlist_item(
    watchlist_id: str,
    data: WatchlistItemCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Adds a ticker to a watchlist. Enforces ownership of the parent watchlist."""
    item = await repo.add_watchlist_item(current_user.id, watchlist_id, data)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent watchlist not found or access denied.",
        )
    return item


@router.delete("/{watchlist_id}/items/{symbol}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_watchlist_item(
    watchlist_id: str,
    symbol: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Removes a ticker from a watchlist. Enforces ownership of the parent watchlist."""
    removed = await repo.remove_watchlist_item(current_user.id, watchlist_id, symbol)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item or parent watchlist not found or access denied.",
        )
    return None
