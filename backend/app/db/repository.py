"""
Repository Layer with In-Memory Multi-Tenant Simulation and Supabase Adapter.
Enforces Row-Level Security (RLS) rules: every query is scoped strictly to auth.uid().
"""

import uuid
from typing import Dict, List, Optional
from datetime import datetime, timezone

from app.models.user import UserProfile, UserProfileUpdate
from app.models.watchlist import Watchlist, WatchlistItem, WatchlistCreate, WatchlistUpdate, WatchlistItemCreate
from app.models.portfolio import PortfolioHolding, PortfolioHoldingCreate, PortfolioHoldingUpdate
from app.models.notes import ResearchNote, ResearchNoteCreate, ResearchNoteUpdate


def now_utc_iso() -> str:
    """Returns current UTC timestamp in ISO 8601 format."""
    return datetime.now(timezone.utc).isoformat()


class DatabaseRepository:
    """
    Abstract repository interface for user-isolated data.
    All operations require the authenticated user_id to enforce row-level security.
    """

    async def get_profile(self, user_id: str, email: Optional[str] = None) -> Optional[UserProfile]:
        raise NotImplementedError

    async def update_profile(self, user_id: str, update_data: UserProfileUpdate) -> UserProfile:
        raise NotImplementedError

    # Watchlists
    async def list_watchlists(self, user_id: str) -> List[Watchlist]:
        raise NotImplementedError

    async def get_watchlist(self, user_id: str, watchlist_id: str) -> Optional[Watchlist]:
        raise NotImplementedError

    async def create_watchlist(self, user_id: str, data: WatchlistCreate) -> Watchlist:
        raise NotImplementedError

    async def update_watchlist(self, user_id: str, watchlist_id: str, data: WatchlistUpdate) -> Optional[Watchlist]:
        raise NotImplementedError

    async def delete_watchlist(self, user_id: str, watchlist_id: str) -> bool:
        raise NotImplementedError

    async def add_watchlist_item(self, user_id: str, watchlist_id: str, data: WatchlistItemCreate) -> Optional[WatchlistItem]:
        raise NotImplementedError

    async def remove_watchlist_item(self, user_id: str, watchlist_id: str, symbol: str) -> bool:
        raise NotImplementedError

    # Portfolio Holdings
    async def list_holdings(self, user_id: str) -> List[PortfolioHolding]:
        raise NotImplementedError

    async def create_holding(self, user_id: str, data: PortfolioHoldingCreate) -> PortfolioHolding:
        raise NotImplementedError

    async def update_holding(self, user_id: str, holding_id: str, data: PortfolioHoldingUpdate) -> Optional[PortfolioHolding]:
        raise NotImplementedError

    async def delete_holding(self, user_id: str, holding_id: str) -> bool:
        raise NotImplementedError

    # Research Notes
    async def list_notes(self, user_id: str) -> List[ResearchNote]:
        raise NotImplementedError

    async def create_note(self, user_id: str, data: ResearchNoteCreate) -> ResearchNote:
        raise NotImplementedError

    async def delete_note(self, user_id: str, note_id: str) -> bool:
        raise NotImplementedError


class InMemoryRLSRepository(DatabaseRepository):
    """
    In-Memory database implementation that strictly simulates PostgreSQL Row-Level Security.
    Every read, update, and delete checks auth.uid() against the row's owner user_id.
    Cross-tenant operations return None or False, exactly mimicking PostgreSQL's 0-row return under RLS.
    """

    def __init__(self):
        # Global storage indexed by entity UUID
        self._profiles: Dict[str, UserProfile] = {}
        self._watchlists: Dict[str, Watchlist] = {}
        self._watchlist_items: Dict[str, WatchlistItem] = {}
        self._holdings: Dict[str, PortfolioHolding] = {}
        self._notes: Dict[str, ResearchNote] = {}

    def clear(self):
        """Reset repository state between test runs."""
        self._profiles.clear()
        self._watchlists.clear()
        self._watchlist_items.clear()
        self._holdings.clear()
        self._notes.clear()

    # Profiles
    async def get_profile(self, user_id: str, email: Optional[str] = None) -> Optional[UserProfile]:
        profile = self._profiles.get(user_id)
        if not profile:
            user_email = email or f"{user_id[:8]}@example.com"
            profile = UserProfile(id=user_id, email=user_email, full_name="MarketPulse User")
            self._profiles[user_id] = profile
        elif email and profile.email != email:
            profile.email = email
            self._profiles[user_id] = profile
        return profile

    async def update_profile(self, user_id: str, update_data: UserProfileUpdate) -> UserProfile:
        profile = await self.get_profile(user_id)
        if update_data.full_name is not None:
            profile.full_name = update_data.full_name
        if update_data.avatar_url is not None:
            profile.avatar_url = update_data.avatar_url
        self._profiles[user_id] = profile
        return profile

    # Watchlists
    async def list_watchlists(self, user_id: str) -> List[Watchlist]:
        # RLS: WHERE user_id = auth.uid()
        user_watchlists = [
            w for w in self._watchlists.values()
            if w.user_id == user_id
        ]
        # Attach user's items
        for w in user_watchlists:
            w.items = [item for item in self._watchlist_items.values() if item.watchlist_id == w.id]
        return user_watchlists

    async def get_watchlist(self, user_id: str, watchlist_id: str) -> Optional[Watchlist]:
        watchlist = self._watchlists.get(watchlist_id)
        # RLS enforcement: If not owned by user_id, return None (simulating 0-row query in PostgreSQL)
        if not watchlist or watchlist.user_id != user_id:
            return None
        watchlist.items = [item for item in self._watchlist_items.values() if item.watchlist_id == watchlist.id]
        return watchlist

    async def create_watchlist(self, user_id: str, data: WatchlistCreate) -> Watchlist:
        new_id = str(uuid.uuid4())
        new_watchlist = Watchlist(
            id=new_id,
            user_id=user_id,
            name=data.name,
            created_at=now_utc_iso(),
            items=[],
        )
        self._watchlists[new_id] = new_watchlist
        return new_watchlist

    async def update_watchlist(self, user_id: str, watchlist_id: str, data: WatchlistUpdate) -> Optional[Watchlist]:
        watchlist = self._watchlists.get(watchlist_id)
        if not watchlist or watchlist.user_id != user_id:
            return None
        watchlist.name = data.name
        self._watchlists[watchlist_id] = watchlist
        return watchlist

    async def delete_watchlist(self, user_id: str, watchlist_id: str) -> bool:
        watchlist = self._watchlists.get(watchlist_id)
        if not watchlist or watchlist.user_id != user_id:
            return False
        # Cascade delete items
        items_to_delete = [k for k, v in self._watchlist_items.items() if v.watchlist_id == watchlist_id]
        for k in items_to_delete:
            del self._watchlist_items[k]
        del self._watchlists[watchlist_id]
        return True

    async def add_watchlist_item(self, user_id: str, watchlist_id: str, data: WatchlistItemCreate) -> Optional[WatchlistItem]:
        watchlist = self._watchlists.get(watchlist_id)
        if not watchlist or watchlist.user_id != user_id:
            return None
        # Check duplicate
        for item in self._watchlist_items.values():
            if item.watchlist_id == watchlist_id and item.symbol.upper() == data.symbol.upper():
                return item
        item_id = str(uuid.uuid4())
        item = WatchlistItem(
            id=item_id,
            watchlist_id=watchlist_id,
            symbol=data.symbol.upper(),
            exchange=data.exchange.upper(),
            added_at=now_utc_iso(),
        )
        self._watchlist_items[item_id] = item
        return item

    async def remove_watchlist_item(self, user_id: str, watchlist_id: str, symbol: str) -> bool:
        watchlist = self._watchlists.get(watchlist_id)
        if not watchlist or watchlist.user_id != user_id:
            return False
        for item_id, item in list(self._watchlist_items.items()):
            if item.watchlist_id == watchlist_id and item.symbol.upper() == symbol.upper():
                del self._watchlist_items[item_id]
                return True
        return False

    # Portfolio Holdings
    async def list_holdings(self, user_id: str) -> List[PortfolioHolding]:
        # RLS: WHERE user_id = auth.uid()
        return [h for h in self._holdings.values() if h.user_id == user_id]

    async def create_holding(self, user_id: str, data: PortfolioHoldingCreate) -> PortfolioHolding:
        holding_id = str(uuid.uuid4())
        holding = PortfolioHolding(
            id=holding_id,
            user_id=user_id,
            symbol=data.symbol.upper(),
            exchange=data.exchange.upper(),
            quantity=data.quantity,
            average_buy_price=data.average_buy_price,
            currency=data.currency.upper(),
            purchase_date=data.purchase_date,
            notes=data.notes,
            created_at=now_utc_iso(),
        )
        self._holdings[holding_id] = holding
        return holding

    async def update_holding(self, user_id: str, holding_id: str, data: PortfolioHoldingUpdate) -> Optional[PortfolioHolding]:
        holding = self._holdings.get(holding_id)
        if not holding or holding.user_id != user_id:
            return None
        if data.quantity is not None:
            holding.quantity = data.quantity
        if data.average_buy_price is not None:
            holding.average_buy_price = data.average_buy_price
        if data.notes is not None:
            holding.notes = data.notes
        self._holdings[holding_id] = holding
        return holding

    async def delete_holding(self, user_id: str, holding_id: str) -> bool:
        holding = self._holdings.get(holding_id)
        if not holding or holding.user_id != user_id:
            return False
        del self._holdings[holding_id]
        return True

    # Research Notes
    async def list_notes(self, user_id: str) -> List[ResearchNote]:
        # RLS: WHERE user_id = auth.uid()
        return [n for n in self._notes.values() if n.user_id == user_id]

    async def create_note(self, user_id: str, data: ResearchNoteCreate) -> ResearchNote:
        note_id = str(uuid.uuid4())
        note = ResearchNote(
            id=note_id,
            user_id=user_id,
            symbol=data.symbol.upper(),
            title=data.title,
            content=data.content,
            created_at=now_utc_iso(),
        )
        self._notes[note_id] = note
        return note

    async def delete_note(self, user_id: str, note_id: str) -> bool:
        note = self._notes.get(note_id)
        if not note or note.user_id != user_id:
            return False
        del self._notes[note_id]
        return True


# Global default repository instance (can be overridden via dependency injection)
default_repo = InMemoryRLSRepository()

def get_repository() -> DatabaseRepository:
    """FastAPI dependency for accessing the database repository."""
    return default_repo
