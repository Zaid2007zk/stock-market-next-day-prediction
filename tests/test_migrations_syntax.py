"""
tests/test_migrations_syntax.py

Validates PostgreSQL migration files:
1. Asserts 001_initial_schema_and_rls.sql exists.
2. Verifies that all user tables have Row-Level Security enabled.
3. Verifies that RLS policies explicitly check auth.uid().
"""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
MIGRATION_PATH = REPO_ROOT / "backend" / "migrations" / "001_initial_schema_and_rls.sql"


def test_migration_file_exists():
    assert MIGRATION_PATH.exists(), f"Migration file missing: {MIGRATION_PATH}"


def test_rls_enabled_on_all_user_tables():
    """Every multi-tenant table MUST have ENABLE ROW LEVEL SECURITY."""
    content = MIGRATION_PATH.read_text(encoding="utf-8")
    expected_tables = [
        "profiles",
        "watchlists",
        "watchlist_items",
        "portfolio_holdings",
        "research_notes",
    ]

    for table in expected_tables:
        enable_sql = f"ALTER TABLE public.{table} ENABLE ROW LEVEL SECURITY;"
        assert enable_sql in content, f"Table public.{table} lacks ENABLE ROW LEVEL SECURITY in migration!"


def test_rls_policies_use_auth_uid():
    """RLS policies must enforce row ownership via Supabase auth.uid()."""
    content = MIGRATION_PATH.read_text(encoding="utf-8")
    assert "auth.uid()" in content, "Migration lacks auth.uid() policy check!"
    assert "CREATE POLICY" in content, "Migration lacks CREATE POLICY statements!"
