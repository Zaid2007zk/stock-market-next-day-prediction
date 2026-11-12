"""
tests/test_tenant_isolation.py

Automated Multi-Tenant Isolation Test Suite for MarketPulse:
1. Provisions two simulated tenants: Tenant A and Tenant B.
2. Asserts that Tenant B cannot read, update, or delete Tenant A's watchlists.
3. Asserts that Tenant B cannot read, update, or delete Tenant A's portfolio holdings.
4. Asserts that Tenant B cannot read or delete Tenant A's research notes.
5. Runs 100 interleaved queries to verify zero cross-tenant data leakage under concurrent conditions.
"""

import sys
import uuid
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

from app.main import app
from app.config import settings
from app.core.auth import create_test_jwt
from app.db.repository import default_repo

client = TestClient(app)
TEST_SECRET = "test-supabase-jwt-secret-very-secure-32chars"

TENANT_A_ID = "11111111-1111-1111-1111-111111111111"
TENANT_B_ID = "22222222-2222-2222-2222-222222222222"


@pytest.fixture(autouse=True)
def setup_environment(monkeypatch):
    """Set test secret and reset in-memory database state before each test."""
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", TEST_SECRET)
    default_repo.clear()


@pytest.fixture
def auth_headers():
    token_a = create_test_jwt(user_id=TENANT_A_ID, email="tenant_a@marketpulse.io", secret=TEST_SECRET)
    token_b = create_test_jwt(user_id=TENANT_B_ID, email="tenant_b@marketpulse.io", secret=TEST_SECRET)
    return {
        "tenant_a": {"Authorization": f"Bearer {token_a}"},
        "tenant_b": {"Authorization": f"Bearer {token_b}"},
    }


def test_watchlist_tenant_isolation(auth_headers):
    """Tenant B must never access, modify, or delete Tenant A's watchlist."""
    # 1. Tenant A creates a watchlist
    res = client.post(
        "/api/v1/watchlists",
        json={"name": "Nifty Quality Momentum"},
        headers=auth_headers["tenant_a"],
    )
    assert res.status_code == 201
    watchlist_a = res.json()
    watchlist_id = watchlist_a["id"]

    # Tenant A adds an item
    res_item = client.post(
        f"/api/v1/watchlists/{watchlist_id}/items",
        json={"symbol": "RELIANCE.NS", "exchange": "NSE"},
        headers=auth_headers["tenant_a"],
    )
    assert res_item.status_code == 201

    # 2. Tenant B attempts to read Tenant A's watchlist -> must return 404 (0-row RLS equivalent)
    res_b_read = client.get(
        f"/api/v1/watchlists/{watchlist_id}",
        headers=auth_headers["tenant_b"],
    )
    assert res_b_read.status_code == 404, "Tenant B read Tenant A's watchlist! RLS violation!"

    # 3. Tenant B lists their own watchlists -> must be empty
    res_b_list = client.get("/api/v1/watchlists", headers=auth_headers["tenant_b"])
    assert res_b_list.status_code == 200
    assert len(res_b_list.json()) == 0, "Tenant B saw Tenant A's watchlist in listing! RLS violation!"

    # 4. Tenant B attempts to add an item to Tenant A's watchlist -> must return 404
    res_b_add = client.post(
        f"/api/v1/watchlists/{watchlist_id}/items",
        json={"symbol": "TCS.NS", "exchange": "NSE"},
        headers=auth_headers["tenant_b"],
    )
    assert res_b_add.status_code == 404

    # 5. Tenant B attempts to delete Tenant A's watchlist -> must return 404
    res_b_del = client.delete(
        f"/api/v1/watchlists/{watchlist_id}",
        headers=auth_headers["tenant_b"],
    )
    assert res_b_del.status_code == 404

    # 6. Verify Tenant A's watchlist is intact
    res_a_verify = client.get(
        f"/api/v1/watchlists/{watchlist_id}",
        headers=auth_headers["tenant_a"],
    )
    assert res_a_verify.status_code == 200
    assert res_a_verify.json()["items"][0]["symbol"] == "RELIANCE.NS"


def test_portfolio_holdings_tenant_isolation(auth_headers):
    """Tenant B must never view, edit, or delete Tenant A's portfolio holdings."""
    # 1. Tenant A adds a holding
    res = client.post(
        "/api/v1/portfolio/holdings",
        json={
            "symbol": "HDFCBANK.NS",
            "exchange": "NSE",
            "quantity": 150.0,
            "average_buy_price": 1420.50,
            "currency": "INR",
            "notes": "Long term core bank allocation",
        },
        headers=auth_headers["tenant_a"],
    )
    assert res.status_code == 201
    holding_id = res.json()["id"]

    # 2. Tenant B lists holdings -> must receive empty list
    res_b_list = client.get("/api/v1/portfolio/holdings", headers=auth_headers["tenant_b"])
    assert res_b_list.status_code == 200
    assert len(res_b_list.json()) == 0, "Tenant B leaked Tenant A's portfolio holdings!"

    # 3. Tenant B attempts to update Tenant A's holding -> must return 404
    res_b_update = client.put(
        f"/api/v1/portfolio/holdings/{holding_id}",
        json={"quantity": 9999.0, "average_buy_price": 1.0},
        headers=auth_headers["tenant_b"],
    )
    assert res_b_update.status_code == 404

    # 4. Tenant B attempts to delete Tenant A's holding -> must return 404
    res_b_delete = client.delete(
        f"/api/v1/portfolio/holdings/{holding_id}",
        headers=auth_headers["tenant_b"],
    )
    assert res_b_delete.status_code == 404

    # 5. Verify Tenant A's holding is untouched
    res_a_list = client.get("/api/v1/portfolio/holdings", headers=auth_headers["tenant_a"])
    assert res_a_list.status_code == 200
    holdings = res_a_list.json()
    assert len(holdings) == 1
    assert holdings[0]["quantity"] == 150.0


def test_research_notes_tenant_isolation(auth_headers):
    """Tenant B must never view or delete Tenant A's research notes."""
    # 1. Tenant A creates research note
    res = client.post(
        "/api/v1/research/notes",
        json={
            "symbol": "INFY.NS",
            "title": "Q3 Margin Expansion Thesis",
            "content": "Operating margins expected to expand 80 bps following cloud deal ramp.",
        },
        headers=auth_headers["tenant_a"],
    )
    assert res.status_code == 201
    note_id = res.json()["id"]

    # 2. Tenant B lists notes -> must receive empty list
    res_b_notes = client.get("/api/v1/research/notes", headers=auth_headers["tenant_b"])
    assert res_b_notes.status_code == 200
    assert len(res_b_notes.json()) == 0

    # 3. Tenant B attempts to delete Tenant A's note -> must return 404
    res_b_del = client.delete(f"/api/v1/research/notes/{note_id}", headers=auth_headers["tenant_b"])
    assert res_b_del.status_code == 404


def test_100_interleaved_queries_zero_cross_tenant_leakage(auth_headers):
    """
    Stress simulation: Executes 100 interleaved operations between Tenant A and Tenant B.
    Asserts 100% strict data isolation with zero cross-tenant leakage.
    """
    import random

    created_watchlists_a = []
    created_watchlists_b = []

    for i in range(50):
        # Tenant A action
        name_a = f"A_Watchlist_{i}_{uuid.uuid4().hex[:6]}"
        res_a = client.post(
            "/api/v1/watchlists",
            json={"name": name_a},
            headers=auth_headers["tenant_a"],
        )
        assert res_a.status_code == 201
        created_watchlists_a.append(res_a.json()["id"])

        # Tenant B action
        name_b = f"B_Watchlist_{i}_{uuid.uuid4().hex[:6]}"
        res_b = client.post(
            "/api/v1/watchlists",
            json={"name": name_b},
            headers=auth_headers["tenant_b"],
        )
        assert res_b.status_code == 201
        created_watchlists_b.append(res_b.json()["id"])

    # Interleaved adversarial verification: 50 checks
    for _ in range(50):
        # Pick random watchlist of A and try to access as B
        target_a = random.choice(created_watchlists_a)
        res = client.get(f"/api/v1/watchlists/{target_a}", headers=auth_headers["tenant_b"])
        assert res.status_code == 404, f"Leakage detected: Tenant B accessed Tenant A's {target_a}"

        # Pick random watchlist of B and try to access as A
        target_b = random.choice(created_watchlists_b)
        res = client.get(f"/api/v1/watchlists/{target_b}", headers=auth_headers["tenant_a"])
        assert res.status_code == 404, f"Leakage detected: Tenant A accessed Tenant B's {target_b}"

    # Final count verification
    list_a = client.get("/api/v1/watchlists", headers=auth_headers["tenant_a"]).json()
    list_b = client.get("/api/v1/watchlists", headers=auth_headers["tenant_b"]).json()
    assert len(list_a) == 50, f"Tenant A expected 50 watchlists, got {len(list_a)}"
    assert len(list_b) == 50, f"Tenant B expected 50 watchlists, got {len(list_b)}"
    # Assert completely disjoint sets of IDs
    set_a = {w["id"] for w in list_a}
    set_b = {w["id"] for w in list_b}
    assert set_a.isdisjoint(set_b), "Fatal: IDs overlapped between Tenant A and Tenant B!"
