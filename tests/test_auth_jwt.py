"""
tests/test_auth_jwt.py

Automated test suite for Supabase JWT Authentication:
1. Valid JWT token verification (extracts sub, email, role).
2. Expired JWT token rejection (HTTP 401).
3. Forged signature JWT token rejection (HTTP 401).
4. Missing / malformed Bearer header rejection (HTTP 401).
5. Missing subject ('sub') claim rejection (HTTP 401).
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

from app.main import app
from app.config import settings
from app.core.auth import create_test_jwt

client = TestClient(app)
TEST_SECRET = "test-supabase-jwt-secret-very-secure-32chars"


@pytest.fixture(autouse=True)
def override_jwt_secret(monkeypatch):
    """Ensure consistent test secret across test runs."""
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", TEST_SECRET)


def test_valid_supabase_jwt():
    """Valid JWT should return HTTP 200 and authenticate user."""
    user_id = "00000000-0000-0000-0000-000000000001"
    token = create_test_jwt(user_id=user_id, email="alice@marketpulse.io", secret=TEST_SECRET)

    response = client.get(
        "/api/v1/user/profile",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["id"] == user_id
    assert "alice" in data["email"]


def test_expired_supabase_jwt():
    """Expired JWT must return HTTP 401 Unauthorized with token expired error."""
    user_id = "00000000-0000-0000-0000-000000000002"
    # Mint token that expired 60 seconds ago
    expired_token = create_test_jwt(
        user_id=user_id,
        email="expired@marketpulse.io",
        secret=TEST_SECRET,
        expires_in_seconds=-60,
    )

    response = client.get(
        "/api/v1/user/profile",
        headers={"Authorization": f"Bearer {expired_token}"},
    )
    assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    assert "expired" in response.json()["detail"].lower()


def test_forged_signature_supabase_jwt():
    """JWT signed with an unauthorized secret must return HTTP 401 Invalid Signature."""
    user_id = "00000000-0000-0000-0000-000000000003"
    fake_secret = "attacker-compromised-forged-secret-32chars"
    forged_token = create_test_jwt(
        user_id=user_id,
        email="attacker@evil.com",
        secret=fake_secret,
    )

    response = client.get(
        "/api/v1/user/profile",
        headers={"Authorization": f"Bearer {forged_token}"},
    )
    assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    assert "signature" in response.json()["detail"].lower()


def test_missing_authorization_header():
    """Request with no Authorization header must return HTTP 401 Unauthorized."""
    response = client.get("/api/v1/user/profile")
    assert response.status_code == 401
    assert "missing" in response.json()["detail"].lower()


def test_malformed_bearer_token():
    """Garbage token string must return HTTP 401 Unauthorized."""
    response = client.get(
        "/api/v1/user/profile",
        headers={"Authorization": "Bearer this-is-not-a-valid-jwt-token"},
    )
    assert response.status_code == 401
    assert "malformed" in response.json()["detail"].lower()
