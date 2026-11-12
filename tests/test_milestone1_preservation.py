"""
tests/test_milestone1_preservation.py

Automated test suite for Milestone 1:
1. Verifies that root Streamlit application and baseline models exist and match recorded hashes.
2. Verifies that backend Dockerignore excludes model artifacts and Streamlit files.
3. Verifies that frontend Next.js configuration is set to static export.
4. Verifies that backend configuration enforces Upstash 500,000 quota and 250 MB storage limits.
"""

import hashlib
from pathlib import Path
import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent

BASELINE_HASHES = {
    "app.py": "4A95923AAA23176D618A7AA017FAF0DD57D294819279CFCA609091C119DFF746",
    "Stock_market.ipynb": "357392DD54186F8C27C1B0A7B7FCA0570FE050F3568C1AA8BEDF53762B74E2CC",
    "final_stock_model.joblib": "D7FEBCF17C9158D02A7672B61E386F7D12E1B5561DCC3A31AE994BC6131FD4F0",
    "final_stock_model_50trees.joblib": "73FD7A41A783E15A6CCB23E809D8A86FB96E45020E9D425BB048BDD3AC0D5DE9",
}

def compute_sha256(filepath: Path) -> str:
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest().upper()


def test_baseline_files_exist_and_hashes_match():
    """Ensure existing live application and both baseline models are 100% unaltered."""
    for filename, expected_hash in BASELINE_HASHES.items():
        file_path = REPO_ROOT / filename
        assert file_path.exists(), f"Baseline file missing: {filename}"
        actual_hash = compute_sha256(file_path)
        assert actual_hash == expected_hash, (
            f"Hash mismatch for {filename}!\n"
            f"Expected: {expected_hash}\n"
            f"Actual:   {actual_hash}"
        )


def test_backend_dockerignore_excludes_heavy_artifacts():
    """Ensure Docker build context excludes root models and Streamlit files."""
    dockerignore_path = REPO_ROOT / "backend" / ".dockerignore"
    assert dockerignore_path.exists(), "backend/.dockerignore is missing"

    content = dockerignore_path.read_text(encoding="utf-8")
    assert "*.joblib" in content, "*.joblib must be excluded in .dockerignore"
    assert "app.py" in content, "app.py must be excluded in .dockerignore"
    assert "Stock_market.ipynb" in content, "Stock_market.ipynb must be excluded in .dockerignore"
    assert "final_stock_model.joblib" in content, "final_stock_model.joblib must be explicitly listed"
    assert "final_stock_model_50trees.joblib" in content, "final_stock_model_50trees.joblib must be explicitly listed"


def test_frontend_static_export_configuration():
    """Ensure Next.js is configured for static export for Cloudflare Pages ₹0 hosting."""
    next_config_path = REPO_ROOT / "frontend" / "next.config.mjs"
    assert next_config_path.exists(), "frontend/next.config.mjs is missing"

    content = next_config_path.read_text(encoding="utf-8")
    assert "output: 'export'" in content or 'output: "export"' in content, (
        "next.config.mjs must specify output: 'export' for Cloudflare Pages static hosting"
    )
    assert "unoptimized: true" in content, "next.config.mjs must specify images: { unoptimized: true }"


def test_backend_config_and_upstash_quotas():
    """Ensure backend config specifies Upstash 500k monthly commands and 250MB storage limit."""
    import sys
    sys.path.insert(0, str(REPO_ROOT / "backend"))
    from app.config import settings

    assert settings.UPSTASH_FREE_COMMANDS_MONTHLY_LIMIT == 500_000, (
        "Upstash quota must be documented as 500,000 commands/month"
    )
    assert settings.UPSTASH_FREE_STORAGE_MB_LIMIT == 250, (
        "Upstash free storage limit must be documented as 250 MB"
    )
    assert settings.UPSTASH_MAX_DATA_SIZE_MB == 256, (
        "Upstash max data size limit must be documented as 256 MB"
    )
    assert settings.ENVIRONMENT == "staging", "Default environment must be staging"
    assert settings.RATE_LIMIT_REQUESTS_PER_MINUTE == 20, "Rate limit should default to 20 req/min"
