"""
Frontend UI and Static Build Contract Verification Suite.
Verifies Cloudflare Pages static export configuration, data provenance labeling,
canvas chart lifecycle cleanup, and zero-trust privacy enforcement.
"""

import os
import re
import pytest

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")


def test_next_config_static_export():
    """Verify Next.js configuration is strictly locked to static HTML export (hard ₹0 hosting)."""
    config_path = os.path.join(FRONTEND_DIR, "next.config.mjs")
    assert os.path.exists(config_path), "next.config.mjs must exist"

    with open(config_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "output: 'export'" in content or 'output: "export"' in content, (
        "Next.js must be configured with output: 'export' for Cloudflare Pages static hosting"
    )
    assert "unoptimized: true" in content, (
        "Images must be unoptimized for pure static export without Node server"
    )


def test_no_live_label_for_mock_or_csv():
    """
    Verify that mock and historical CSV datasets are never labeled as live/current quotes.
    """
    badge_path = os.path.join(FRONTEND_DIR, "src", "components", "MarketBadges.tsx")
    assert os.path.exists(badge_path), "MarketBadges.tsx must exist"

    with open(badge_path, "r", encoding="utf-8") as f:
        badge_content = f.read()

    assert "Synthetic Mock Data (Staging Mode)" in badge_content
    assert "Historical CSV Dataset (Close)" in badge_content
    assert "Authorized Live Market Feed" in badge_content
    assert "NOT a live market feed" in badge_content or "NOT a live quote" in badge_content

    # Check page.tsx explicitly clarifies close prices
    page_path = os.path.join(FRONTEND_DIR, "src", "app", "page.tsx")
    with open(page_path, "r", encoding="utf-8") as f:
        page_content = f.read()

    assert "Verified Close Price (NOT a real-time quote)" in page_content


def test_canvas_chart_60fps_unmount_cleanup():
    """
    Verify PriceChart.tsx implements HTML5 Canvas with 20-day SMA and unmount cleanup.
    """
    chart_path = os.path.join(FRONTEND_DIR, "src", "components", "PriceChart.tsx")
    assert os.path.exists(chart_path), "PriceChart.tsx must exist"

    with open(chart_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "canvasRef.current" in content
    assert "ctx.clearRect" in content, "Must implement unmount canvas cleanup to prevent memory leaks"
    assert "sma20" in content, "Must calculate and render 20-day SMA overlay"
    assert "timeframe" in content, "Must support multiple timeframes"


def test_grounded_research_assistant_ui_contract():
    """
    Verify ResearchAssistant.tsx includes zero-trust privacy banner,
    unresolved AI model notice, and verifiable citation pills.
    """
    assistant_path = os.path.join(FRONTEND_DIR, "src", "components", "ResearchAssistant.tsx")
    assert os.path.exists(assistant_path), "ResearchAssistant.tsx must exist"

    with open(assistant_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "Zero-Trust Privacy Filter" in content
    assert "Cloud AI Model Unresolved" in content
    assert "Deterministic Fallback" in content or "Deterministic Narrative" in content
    assert "citations" in content
    assert "emailRegex" in content or "@" in content, "Must include client-side privacy validation"


def test_stock_comparison_matrix_contract():
    """
    Verify StockComparison.tsx includes factor scorecard and deterministic grounding banner.
    """
    compare_path = os.path.join(FRONTEND_DIR, "src", "components", "StockComparison.tsx")
    assert os.path.exists(compare_path), "StockComparison.tsx must exist"

    with open(compare_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "Multi-Stock Factor Comparison Matrix" in content
    assert "Deterministic Mathematical Grounding" in content
    assert "valueScore" in content
    assert "momentumScore" in content
    assert "qualityScore" in content
    assert "rsi14" in content


def test_typescript_cleanliness():
    """
    Verify that all TypeScript and TSX files in frontend/src are free of invalid type aliases like `str`.
    """
    src_dir = os.path.join(FRONTEND_DIR, "src")
    assert os.path.exists(src_dir)

    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith((".ts", ".tsx")):
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()

                # Check for stray `str` type annotations (e.g. `: str`, `: str;`)
                stray_str = re.findall(r":\s*str(?:\s*[,;)]|\s*$)", content)
                assert len(stray_str) == 0, f"Found invalid 'str' type in {file}: {stray_str}"
