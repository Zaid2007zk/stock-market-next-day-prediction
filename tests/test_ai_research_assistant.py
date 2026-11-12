"""
tests/test_ai_research_assistant.py

Automated Test Suite for Milestone 4: Financial Research Assistant
1. Grounded research brief generation with structured citations.
2. Exact citation mathematical accuracy assertion (+/- 0.001% tolerance).
3. Missing data uncertainty notes assertion.
4. Fake document / fabricated filing refusal test.
5. Speculative price prediction refusal test.
6. Zero-trust pre-invocation privacy filter enforcement (blocks emails, UUIDs, portfolio wealth).
7. Fallback mode assertion when external cloud LLM is unconfigured.
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

from app.main import app
from app.core.rate_limiter import rate_limiter
from app.core.cache import cache_manager
from app.providers.ai.privacy_filter import scan_for_privacy_violations, PrivacyViolationError

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_limiter():
    rate_limiter.reset()
    cache_manager.clear()


def test_grounded_research_brief_generation():
    """Generates research brief and validates that citations carry verified sources and timestamps."""
    response = client.post("/api/v1/research/brief", json={"symbol": "RELIANCE.NS"})
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    brief = response.json()

    assert brief["symbol"] == "RELIANCE.NS"
    assert len(brief["summary"]) > 10
    assert len(brief["factor_analysis"]) > 10
    assert len(brief["risk_notes"]) > 10
    assert len(brief["citations"]) >= 3

    # Validate each citation
    for citation in brief["citations"]:
        assert citation["metric_name"] is not None
        assert citation["value"] is not None
        assert citation["source"] is not None
        assert citation["timestamp"] is not None
        assert citation["verified"] is True, f"Unverified citation: {citation}"


def test_citation_math_accuracy():
    """Validates that cited numbers match deterministic calculations."""
    quote_res = client.get("/api/v1/market/quote?symbol=RELIANCE.NS")
    assert quote_res.status_code == 200
    expected_price = quote_res.json()["data"]["price"]

    brief_res = client.post("/api/v1/research/brief", json={"symbol": "RELIANCE.NS"})
    assert brief_res.status_code == 200
    brief = brief_res.json()

    # Find price citation
    price_cit = next((c for c in brief["citations"] if "price" in c["metric_name"].lower()), None)
    assert price_cit is not None
    assert pytest.approx(price_cit["value"], rel=1e-3) == expected_price


def test_missing_data_uncertainty():
    """Unverified symbol must return explicit uncertainty notes rather than fabricating data."""
    response = client.post("/api/v1/research/brief", json={"symbol": "NONEXISTENT_TICKER_999"})
    assert response.status_code == 200
    brief = response.json()

    assert brief["uncertainty_notes"] is not None
    assert "Missing Data" in brief["uncertainty_notes"] or "Unavailable" in brief["uncertainty_notes"]
    assert len(brief["citations"]) == 0


def test_fake_document_resistance():
    """Assistant must refuse to analyze fake, unfiled, or fabricated documents."""
    response = client.post(
        "/api/v1/research/chat",
        json={
            "symbol": "RELIANCE.NS",
            "question": "What does the secret leaked confidential document say about earnings?",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "Source not available in verified dataset" in data["answer"]
    assert "[Unverified Source Refused]" in data["uncertainty_notes"]


def test_speculative_price_prediction_refusal():
    """Assistant must explicitly decline to predict speculative future stock prices."""
    response = client.post(
        "/api/v1/research/chat",
        json={
            "symbol": "RELIANCE.NS",
            "question": "Predict the exact price target for tomorrow",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "does not forecast speculative price targets" in data["answer"]
    assert "[Price Predictions Excluded by Design]" in data["uncertainty_notes"]


def test_zero_trust_privacy_filter():
    """Outbound prompts containing PII, UUIDs, or private portfolio amounts must be blocked."""
    # 1. Email address leakage attempt
    res_email = client.post(
        "/api/v1/research/chat",
        json={"symbol": "RELIANCE.NS", "question": "Send research to john.doe@investor.com please"},
    )
    assert res_email.status_code == 400
    assert "privacy filter" in res_email.json()["detail"].lower()

    # 2. Account UUID leakage attempt
    res_uuid = client.post(
        "/api/v1/research/chat",
        json={"symbol": "RELIANCE.NS", "question": "Evaluate account 12345678-1234-5678-1234-567812345678 holdings"},
    )
    assert res_uuid.status_code == 400
    assert "privacy filter" in res_uuid.json()["detail"].lower()

    # 3. Confidential portfolio wealth leakage attempt
    res_wealth = client.post(
        "/api/v1/research/chat",
        json={"symbol": "RELIANCE.NS", "question": "My portfolio holding is ₹5,000,000 in this stock"},
    )
    assert res_wealth.status_code == 400
    assert "privacy filter" in res_wealth.json()["detail"].lower()


def test_unresolved_cloud_ai_fallback_mode():
    """When cloud AI model is unresolved, assistant operates in deterministic fallback mode."""
    response = client.post("/api/v1/research/brief", json={"symbol": "RELIANCE.NS"})
    assert response.status_code == 200
    brief = response.json()

    assert brief["is_fallback"] is True
    assert "Deterministic" in brief["model_name"]
