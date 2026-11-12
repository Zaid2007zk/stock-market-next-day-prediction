#!/usr/bin/env python3
"""
scripts/verify_preservation.py

Automated SHA-256 baseline hash verification script for MarketPulse.
Ensures that the existing Streamlit production application (app.py, Stock_market.ipynb)
and historical model baseline files (final_stock_model.joblib, final_stock_model_50trees.joblib)
remain 100% unaltered.
"""

import hashlib
import sys
from pathlib import Path

# Baseline recorded SHA-256 hashes at start of Milestone 1
EXPECTED_HASHES = {
    "app.py": "4A95923AAA23176D618A7AA017FAF0DD57D294819279CFCA609091C119DFF746",
    "Stock_market.ipynb": "357392DD54186F8C27C1B0A7B7FCA0570FE050F3568C1AA8BEDF53762B74E2CC",
    "final_stock_model.joblib": "D7FEBCF17C9158D02A7672B61E386F7D12E1B5561DCC3A31AE994BC6131FD4F0",
    "final_stock_model_50trees.joblib": "73FD7A41A783E15A6CCB23E809D8A86FB96E45020E9D425BB048BDD3AC0D5DE9",
}

def compute_sha256(filepath: Path) -> str:
    """Computes SHA-256 hash in 64KB blocks for memory efficiency."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest().upper()

def verify_all_files(root_dir: Path) -> bool:
    """Verifies that all baseline files exist and their hashes match expectations."""
    all_matched = True
    print("=" * 70)
    print("MarketPulse Baseline Preservation Verification")
    print(f"Target Root Directory: {root_dir}")
    print("=" * 70)

    for filename, expected_hash in EXPECTED_HASHES.items():
        file_path = root_dir / filename
        if not file_path.exists():
            print(f"[FAIL] MISSING: {filename}")
            all_matched = False
            continue

        size_mb = file_path.stat().st_size / (1024 * 1024)
        computed_hash = compute_sha256(file_path)

        if computed_hash == expected_hash:
            print(f"[PASS] {filename} ({size_mb:.2f} MB)")
            print(f"       Hash: {computed_hash}")
        else:
            print(f"[FAIL] HASH MISMATCH: {filename} ({size_mb:.2f} MB)")
            print(f"       Expected: {expected_hash}")
            print(f"       Actual:   {computed_hash}")
            all_matched = False

    print("=" * 70)
    if all_matched:
        print("[SUCCESS] All baseline application and model files are 100% PRESERVED.")
        print("=" * 70)
        return True
    else:
        print("[ERROR] One or more baseline files have been modified or are missing!")
        print("=" * 70)
        return False

if __name__ == "__main__":
    # Locate project root (parent directory of scripts/)
    repo_root = Path(__file__).resolve().parent.parent
    success = verify_all_files(repo_root)
    sys.exit(0 if success else 1)
