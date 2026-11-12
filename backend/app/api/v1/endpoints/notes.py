"""
Research Notes Endpoints with Strict Multi-Tenant Isolation
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import get_current_user
from app.models.user import AuthenticatedUser
from app.models.notes import ResearchNote, ResearchNoteCreate
from app.db.repository import DatabaseRepository, get_repository

router = APIRouter(prefix="/research/notes", tags=["Research Notes"])


@router.get("", response_model=List[ResearchNote])
async def list_notes(
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Lists all research notes owned by the authenticated user."""
    return await repo.list_notes(current_user.id)


@router.post("", response_model=ResearchNote, status_code=status.HTTP_201_CREATED)
async def create_note(
    data: ResearchNoteCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Creates a new research note owned by the authenticated user."""
    return await repo.create_note(current_user.id, data)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: DatabaseRepository = Depends(get_repository),
):
    """Deletes a research note. Enforces RLS: returns 404 if not owned by user."""
    deleted = await repo.delete_note(current_user.id, note_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found or access denied.",
        )
    return None
