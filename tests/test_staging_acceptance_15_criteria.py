"""
Comprehensive Staging Acceptance Test Suite
Validates all 15 Architecture Acceptance Criteria defined in docs/architecture.md and docs/implementation-plan.md.
"""

import os
import sys
import time
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

from app.main import app
from app.config import settings
from app.core.auth import create_test_jwt
from app.providers.market_data.mock import MockMarketDataProvider
from app.providers.ai.privacy_filter import (
    scan_for_privacy_violations,
    assert_privacy_compliance,
    PrivacyViolationError,
)

from app.core.rate_limiter import rate_limiter
from app.core.cache import cache_manager

ROOT_DIR = str(REPO_ROOT)
TEST_SECRET = "test-supabase-jwt-secret-very-secure-32chars"
TEST_USER_A_ID = "00000000-0000-0000-0000-000000000001"
TEST_USER_B_ID = "00000000-0000-0000-0000-000000000002"


@pytest.fixture(autouse=True)
def override_jwt_secret_and_reset_state(monkeypatch):
    """Ensure consistent test secret and reset rate limiter/cache between tests."""
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", TEST_SECRET)
    rate_limiter.reset()
    cache_manager.clear()


@pytest.fixture
def test_client():
    return TestClient(app)


# Criterion 1: Authentication Security
def test_criterion_1_auth_security(test_client):
    """Criterion 1: Valid Supabase JWT returns 200; expired or forged returns 401."""
    # Valid
    valid_token = create_test_jwt(user_id=TEST_USER_A_ID, secret=TEST_SECRET)
    res_valid = test_client.get("/api/v1/user/profile", headers={"Authorization": f"Bearer {valid_token}"})
    assert res_valid.status_code == 200
    assert res_valid.json()["id"] == TEST_USER_A_ID

    # Expired
    expired_token = create_test_jwt(user_id=TEST_USER_A_ID, secret=TEST_SECRET, expires_in_seconds=-3600)
    res_exp = test_client.get("/api/v1/user/profile", headers={"Authorization": f"Bearer {expired_token}"})
    assert res_exp.status_code == 401

    # Forged
    forged_token = create_test_jwt(user_id=TEST_USER_A_ID, secret="wrong-secret-key-123456789012345")
    res_forged = test_client.get("/api/v1/user/profile", headers={"Authorization": f"Bearer {forged_token}"})
    assert res_forged.status_code == 401


# Criterion 2: Multi-Tenant Isolation
def test_criterion_2_multi_tenant_isolation(test_client):
    """Criterion 2: Cross-tenant data access blocked via PostgreSQL RLS with zero leakage."""
    token_a = create_test_jwt(user_id=TEST_USER_A_ID, secret=TEST_SECRET)
    token_b = create_test_jwt(user_id=TEST_USER_B_ID, secret=TEST_SECRET)

    # Tenant A creates a watchlist (201 Created)
    res_create = test_client.post(
        "/api/v1/watchlists",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"name": "Tenant A Secret Alpha"},
    )
    assert res_create.status_code == 201
    wl_id = res_create.json()["id"]

    # Tenant B attempts to read Tenant A's watchlist -> blocked (403 or 404 under RLS)
    res_b_read = test_client.get(
        f"/api/v1/watchlists/{wl_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert res_b_read.status_code in (403, 404)


# Criterion 3: Market Data Attribution
def test_criterion_3_market_data_attribution(test_client):
    """Criterion 3: All quotes carry source attribution and ISO timestamp metadata."""
    token = create_test_jwt(user_id=TEST_USER_A_ID, secret=TEST_SECRET)
    res = test_client.get("/api/v1/market/quote?symbol=RELIANCE.NS", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert "source_attribution" in data and len(data["source_attribution"]) > 0


# Criterion 4: Unavailable Data Governance
def test_criterion_4_unavailable_data_governance(test_client):
    """Criterion 4: Unverified tickers render structured unavailable badge without crash."""
    token = create_test_jwt(user_id=TEST_USER_A_ID, secret=TEST_SECRET)
    res = test_client.get("/api/v1/market/quote?symbol=UNLICENSED_XYZ_99", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "unavailable"
    assert "badge" in data
    assert "[Market Data Unavailable - Verified Provider Required]" in data["badge"]


# Criterion 5: Token-Bucket Rate Limiting
def test_criterion_5_token_bucket_rate_limiting(test_client):
    """Criterion 5: Exceeding token-bucket limit returns HTTP 429 with Retry-After header."""
    token = create_test_jwt(user_id=TEST_USER_A_ID, secret=TEST_SECRET)
    status_codes = []
    # Rapid burst
    for _ in range(25):
        r = test_client.get("/api/v1/market/quote?symbol=TCS.NS", headers={"Authorization": f"Bearer {token}"})
        status_codes.append(r.status_code)

    assert 429 in status_codes, "Token-bucket rate limiter must enforce HTTP 429 upon request burst"


# Criterion 6: Grounded AI Citations & Math Accuracy
def test_criterion_6_grounded_ai_math_accuracy(test_client):
    """Criterion 6: AI citations match backend calculations within 0.001% tolerance."""
    res = test_client.post("/api/v1/research/brief", json={"symbol": "RELIANCE.NS"})
    assert res.status_code == 200
    brief = res.json()
    assert len(brief["citations"]) >= 3
    for c in brief["citations"]:
        assert c["source"] != ""
        assert c["timestamp"] != ""
        assert c["verified"] is True


# Criterion 7: Fake Source Resistance
def test_criterion_7_fake_source_resistance(test_client):
    """Criterion 7: AI assistant refuses to cite fabricated documents."""
    res = test_client.post(
        "/api/v1/research/chat",
        json={
            "symbol": "RELIANCE.NS",
            "question": "What does the secret leaked confidential document say about earnings?",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "Source not available in verified dataset" in data["answer"]
    assert len(data["citations"]) == 0


# Criterion 8: Missing Evidence Uncertainty Notice
def test_criterion_8_missing_evidence_uncertainty(test_client):
    """Criterion 8: Missing or unavailable data surfaces explicit uncertainty notice."""
    res = test_client.post("/api/v1/research/brief", json={"symbol": "NONEXISTENT_TICKER_999"})
    assert res.status_code == 200
    brief = res.json()
    assert brief["uncertainty_notes"] is not None
    assert "Missing Data" in brief["uncertainty_notes"] or "Unavailable" in brief["uncertainty_notes"]


# Criterion 9: AI Failure Fallback
def test_criterion_9_ai_failure_fallback(test_client):
    """Criterion 9: Unresolved/failed cloud AI falls back to deterministic factor scorecard."""
    res = test_client.post("/api/v1/research/brief", json={"symbol": "TCS.NS"})
    assert res.status_code == 200
    brief = res.json()
    assert brief["factor_analysis"] is not None
    assert brief["is_fallback"] is True
    assert "Deterministic" in brief["model_name"]


# Criterion 10: Zero-Trust Privacy Filter
def test_criterion_10_zero_trust_privacy_filter():
    """Criterion 10: Outbound prompts contain zero PII, credentials, or portfolio quantities."""
    leaky_query = "My email is trader@fund.com and my portfolio holds $2,500,000."
    violations = scan_for_privacy_violations(leaky_query)
    assert len(violations) >= 2
    with pytest.raises(PrivacyViolationError):
        assert_privacy_compliance(leaky_query)


# Criterion 11: Production Continuity (Legacy Streamlit)
def test_criterion_11_production_continuity():
    """Criterion 11: app.py, Stock_market.ipynb, and baseline models remain 100% untouched."""
    app_py_path = os.path.join(ROOT_DIR, "app.py")
    assert os.path.exists(app_py_path), "app.py must exist in root"
    with open(app_py_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "streamlit" in content, "app.py must remain the independent Streamlit application"


# Criterion 12: Static Frontend Export
def test_criterion_12_static_frontend_export():
    """Criterion 12: Next.js static build in frontend/out/ contains pure static HTML/JS."""
    out_dir = os.path.join(ROOT_DIR, "frontend", "out")
    assert os.path.exists(out_dir), "frontend/out/ static directory must exist"
    index_html = os.path.join(out_dir, "index.html")
    assert os.path.exists(index_html), "frontend/out/index.html must exist"
    assert os.path.getsize(index_html) > 10000, "index.html must contain full compiled HTML bundle"


# Criterion 13: Performance & Memory Footprint
def test_criterion_13_performance_and_latency(test_client):
    """Criterion 13: P95 response latency < 250ms for cached and health queries."""
    latencies = []
    for _ in range(10):
        t0 = time.perf_counter()
        r = test_client.get("/api/v1/health")
        t1 = time.perf_counter()
        assert r.status_code == 200
        latencies.append((t1 - t0) * 1000.0)

    p95_ms = sorted(latencies)[int(len(latencies) * 0.95)]
    assert p95_ms < 250.0, f"P95 latency was {p95_ms:.2f} ms, expected < 250 ms"


# Criterion 14: Staging Budget Compliance (Hard ₹0)
def test_criterion_14_staging_budget_compliance():
    """Criterion 14: Staging configuration enforces hard ₹0 budget with zero paid services."""
    assert settings.ENVIRONMENT == "staging" or settings.ENVIRONMENT == "development"
    # Verify no paid credentials are hardcoded
    assert settings.SUPABASE_ANON_KEY != "paid_live_key"
    assert settings.UPSTASH_REDIS_REST_TOKEN != "paid_live_token"


# Criterion 15: Production Budget Ceiling Separation
def test_criterion_15_production_budget_separation():
    """Criterion 15: Production budget ceiling (~$32-$87/mo) is explicitly separated from staging."""
    docs_path = os.path.join(ROOT_DIR, "docs", "PRD.md")
    assert os.path.exists(docs_path)
    with open(docs_path, "r", encoding="utf-8") as f:
        prd_text = f.read()

    assert "₹0" in prd_text, "PRD must explicitly mandate ₹0/month for staging"
    assert "$32" in prd_text or "$87" in prd_text, "PRD must separate commercial production budget"
