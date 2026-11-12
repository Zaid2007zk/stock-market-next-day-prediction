"""
Portfolio Holdings Endpoints with Strict Multi-Tenant Isolation
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user
from app.models.user import AuthenticatedUser
from app.models.portfolio import (
    PortfolioHolding,
    PortfolioHoldingCreate,
    PortfolioHoldingUpdate,
)
from app.db.repository import DatabaseRepository, get_repository

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("/holdings", response_model=List[PortfolioHolding])
async def list_holdings(
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Lists all portfolio holdings owned by the authenticated user."""
    return await repo.list_holdings(current_user.id)


@router.post("/holdings", response_model=PortfolioHolding, status_code=status.HTTP_201_CREATED)
async def create_holding(
    data: PortfolioHoldingCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Creates a new portfolio holding owned by the authenticated user."""
    return await repo.create_holding(current_user.id, data)


@router.put("/holdings/{holding_id}", response_model=PortfolioHolding)
async def update_holding(
    holding_id: str,
    data: PortfolioHoldingUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Updates a holding. Enforces RLS: returns 404 if holding not owned by user."""
    holding = await repo.update_holding(current_user.id, holding_id, data)
    if not holding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holding not found or access denied.",
        )
    return holding


@router.delete("/holdings/{holding_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_holding(
    holding_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Deletes a holding. Enforces RLS: returns 404 if holding not owned by user."""
    deleted = await repo.delete_holding(current_user.id, holding_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Holding not found or access denied.",
        )
    return None
