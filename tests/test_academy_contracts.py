"""
tests/test_academy_contracts.py

Automated Test Suite for MarketPulse AI Trading Academy:
1. Curriculum completeness & 8-level structural integrity.
2. Bilingual pedagogy (English & Hinglish) and lesson metadata.
3. Indian statutory transaction friction parity (STT, Brokerage cap, GST, Stamp duty, Slippage).
4. AI Tutor pedagogical response quality, follow-up suggestions, and grounding.
5. Pre-invocation zero-trust privacy enforcement (rejection of PII, emails, API credentials).
6. Frontend static asset and visual component contracts verification.
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

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_limiter_and_cache():
    rate_limiter.reset()
    cache_manager.clear()


def test_academy_curriculum_completeness():
    """Validates that the curriculum endpoint returns all 8 levels and exact friction schedules."""
    res = client.get("/api/v1/academy/curriculum")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()

    assert data["total_levels"] == 8
    assert data["total_lessons"] >= 24
    assert len(data["levels"]) == 8

    # Verify educational simulation disclaimer
    assert "Educational Simulation Only" in data["disclaimer"]
    assert "SEBI" in data["disclaimer"]

    # Verify statutory friction rates
    frictions = data["frictional_rates"]
    assert frictions["stt_delivery_rate"] == 0.001  # 0.1%
    assert frictions["brokerage_flat_cap_inr"] == 20.0
    assert frictions["gst_rate"] == 0.18  # 18%
    assert frictions["stamp_duty_buy_rate"] == 0.00015  # 0.015%
    assert frictions["estimated_slippage_rate"] == 0.0005  # 5 bps


def test_curriculum_bilingual_integrity():
    """Validates that every level and lesson contains English and Hinglish content with valid visual types."""
    res = client.get("/api/v1/academy/curriculum")
    assert res.status_code == 200
    levels = res.json()["levels"]

    valid_visuals = {
        "market_flow",
        "order_book_depth",
        "candlestick_anatomist",
        "indicator_explorer",
        "fundamental_waterfall",
        "risk_calculator",
        "backtest_visualizer",
        "portfolio_health_scorecard",
    }

    for lvl in levels:
        assert lvl["level"] in range(1, 9)
        assert len(lvl["title"]) > 5
        assert len(lvl["title_hinglish"]) > 5
        assert len(lvl["lessons"]) >= 3

        for les in lvl["lessons"]:
            assert les["id"].startswith(f"lvl{lvl['level']}")
            assert len(les["title"]) > 3
            assert len(les["title_hinglish"]) > 3
            assert len(les["summary"]) > 10
            assert len(les["summary_hinglish"]) > 10
            assert les["visual_type"] in valid_visuals


def test_paper_trade_frictions_calculation_inr_buy():
    """Tests exact deterministic calculation of Indian statutory frictions on a BUY order."""
    payload = {
        "symbol": "RELIANCE.NS",
        "action": "BUY",
        "price": 2500.0,
        "quantity": 100,
        "order_type": "MARKET",
        "delivery_type": "DELIVERY",
    }
    res = client.post("/api/v1/academy/paper-trade/calculate-frictions", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()

    assert data["gross_trade_value"] == 250000.0
    assert data["stt"] == 250.0  # 0.1% of 250,000
    assert data["brokerage"] == 20.0  # min(75.0, 20.0) -> capped at 20.0
    assert data["stamp_duty"] == 37.50  # 0.015% of 250,000 on BUY
    assert data["estimated_slippage"] == 125.0  # 0.05% of 250,000

    # Total frictions check
    expected_frictions = round(
        data["stt"]
        + data["brokerage"]
        + data["exchange_turnover"]
        + data["gst"]
        + data["stamp_duty"]
        + data["estimated_slippage"],
        2,
    )
    assert data["total_frictions"] == expected_frictions
    assert data["net_trade_value"] == round(250000.0 + expected_frictions, 2)
    assert data["currency"] == "INR"


def test_paper_trade_frictions_calculation_inr_sell():
    """Tests deterministic calculation of Indian statutory frictions on a SELL order (Zero stamp duty)."""
    payload = {
        "symbol": "TCS.NS",
        "action": "SELL",
        "price": 3800.0,
        "quantity": 50,
        "order_type": "LIMIT",
        "delivery_type": "DELIVERY",
    }
    res = client.post("/api/v1/academy/paper-trade/calculate-frictions", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["gross_trade_value"] == 190000.0
    assert data["stt"] == 190.0
    assert data["brokerage"] == 20.0
    assert data["stamp_duty"] == 0.0  # Zero stamp duty on SELL side
    assert data["net_trade_value"] == round(190000.0 - data["total_frictions"], 2)


def test_paper_trade_frictions_invalid_action():
    """Rejects illegal trading actions."""
    payload = {
        "symbol": "INFY.NS",
        "action": "HOLD_INVALID",
        "price": 1600.0,
        "quantity": 10,
    }
    res = client.post("/api/v1/academy/paper-trade/calculate-frictions", json=payload)
    assert res.status_code == 400


def test_tutor_english_pedagogy():
    """Tests English pedagogical tutor response with concept grounding and follow-ups."""
    payload = {
        "question": "How does the 1% risk rule calculate position size?",
        "level": 6,
        "language": "en",
    }
    res = client.post("/api/v1/academy/tutor", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()

    assert "1%" in data["answer"]
    assert "position sizing" in data["answer"].lower() or "shares" in data["answer"].lower()
    assert len(data["grounded_concepts"]) >= 1
    assert len(data["follow_up_suggestions"]) >= 2
    assert "Educational Simulation Only" in data["disclaimer"]


def test_tutor_hinglish_pedagogy():
    """Tests simple Hinglish pedagogical tutor response."""
    payload = {
        "question": "Demat account kya hota hai aur broker se kaise alag hai?",
        "level": 1,
        "language": "hinglish",
    }
    res = client.post("/api/v1/academy/tutor", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["language"] == "hinglish"
    # Should include conversational Hinglish words
    assert "demat" in data["answer"].lower()
    assert "shares" in data["answer"].lower()
    assert any("cdsl" in c.lower() or "demat" in c.lower() for c in data["grounded_concepts"])
    assert len(data["follow_up_suggestions"]) >= 2


def test_tutor_zero_trust_privacy_filter():
    """Verifies that tutor strictly rejects prompts containing PII or credentials."""
    # 1. Email leak attempt
    res1 = client.post(
        "/api/v1/academy/tutor",
        json={"question": "My email is student@example.com, tell me about RSI", "language": "en"},
    )
    assert res1.status_code == 400
    assert "email address" in res1.text.lower() or "privacy" in res1.text.lower()

    # 2. Credential leak attempt
    res2 = client.post(
        "/api/v1/academy/tutor",
        json={"question": "Here is my api_key: secret_1234567890abcdef", "language": "en"},
    )
    assert res2.status_code == 400
    assert "credential" in res2.text.lower() or "secret" in res2.text.lower() or "privacy" in res2.text.lower()


def test_frontend_academy_files_exist():
    """Asserts that all required frontend Academy curriculum and visual components exist on disk."""
    frontend_dir = REPO_ROOT / "frontend" / "src"

    expected_files = [
        frontend_dir / "data" / "academyCurriculum.ts",
        frontend_dir / "components" / "academy" / "TradingAcademy.tsx",
        frontend_dir / "components" / "academy" / "AITutorChat.tsx",
        frontend_dir / "components" / "academy" / "PaperTradingSandbox.tsx",
        frontend_dir / "components" / "academy" / "GlossaryModal.tsx",
        frontend_dir / "components" / "academy" / "VisualTeachingCanvas.tsx",
        frontend_dir / "components" / "academy" / "visuals" / "MarketFlowVisualizer.tsx",
        frontend_dir / "components" / "academy" / "visuals" / "OrderBookVisualizer.tsx",
        frontend_dir / "components" / "academy" / "visuals" / "CandlestickAnatomist.tsx",
        frontend_dir / "components" / "academy" / "visuals" / "IndicatorExplorer.tsx",
        frontend_dir / "components" / "academy" / "visuals" / "FundamentalWaterfall.tsx",
        frontend_dir / "components" / "academy" / "visuals" / "RiskCalculatorVisualizer.tsx",
        frontend_dir / "components" / "academy" / "visuals" / "BacktestVisualizer.tsx",
        frontend_dir / "components" / "academy" / "visuals" / "PortfolioHealthVisualizer.tsx",
    ]

    for f in expected_files:
        assert f.exists(), f"Expected academy file does not exist: {f}"
        assert f.stat().st_size > 100, f"File appears too small or empty: {f}"


def test_tutor_beginner_how_to_invest_structured_flow():
    """Validates the 8-step structured pedagogical flow for beginner 'how to invest' query."""
    queries = [
        ("explain me how i invest in stock", "en"),
        ("how do i start investing in stocks?", "en"),
        ("stock market me invest kaise shuru karein?", "hinglish"),
    ]

    for q, lang in queries:
        res = client.post("/api/v1/academy/tutor", json={"question": q, "language": lang})
        assert res.status_code == 200, res.text
        data = res.json()
        ans = data["answer"]

        # 1. Learner profile identified
        assert "Learner Profile" in ans
        assert "Level 1" in ans or "Beginner" in ans

        # 2. Simple definition
        assert "DEFINITION" in ans

        # 3. Actionable steps
        assert "STEPS" in ans or "Step 1" in ans

        # 4. Plain vocabulary (Demat, Broker, Exchange)
        assert "Demat" in ans
        assert "Broker" in ans

        # 5. Hypothetical worked example
        assert "HYPOTHETICAL" in ans or "Hypothetical" in ans

        # 6. Visual explanation
        assert "VISUAL" in ans or "Visualizer" in ans

        # 7. Knowledge check
        assert "KNOWLEDGE CHECK" in ans or "Sawal" in ans

        # 8. Grounded concepts & followups
        assert len(data["grounded_concepts"]) >= 3
        assert len(data["follow_up_suggestions"]) >= 2
        assert "Demo AI Mode" in data["disclaimer"]

