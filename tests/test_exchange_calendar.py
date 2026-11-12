"""
Automated Test Suite for Exchange-Aware Market Status & Holiday Calendar Engine
Verifies Indian (NSE, BSE) and US (NYSE, NASDAQ) sessions, weekends, official holidays, and countdowns.
"""

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT / "backend"))

import pytest
from datetime import datetime, date
from zoneinfo import ZoneInfo

from app.analytics.exchange_calendar import (
    evaluate_exchange_schedule,
    get_next_trading_date,
    INDIA_HOLIDAYS_2026,
    US_HOLIDAYS_2026,
)


def test_nse_regular_market_open():
    """Wednesday at 11:30 AM IST must be evaluated as OPEN."""
    tz = ZoneInfo("Asia/Kolkata")
    test_dt = datetime(2026, 6, 10, 11, 30, tzinfo=tz)  # Normal Wednesday
    res = evaluate_exchange_schedule("NSE", as_of=test_dt)

    assert res.exchange == "NSE"
    assert res.is_open is True
    assert res.status == "OPEN"
    assert "Open" in res.status_label
    assert res.remaining_time_to_close is not None


def test_nse_pre_open_session():
    """Wednesday at 09:05 AM IST must be evaluated as PRE_OPEN."""
    tz = ZoneInfo("Asia/Kolkata")
    test_dt = datetime(2026, 6, 10, 9, 5, tzinfo=tz)
    res = evaluate_exchange_schedule("NSE", as_of=test_dt)

    assert res.status == "PRE_OPEN"
    assert res.is_open is True
    assert "Pre-Market" in res.status_label


def test_nse_closing_auction():
    """Wednesday at 15:35 IST must be evaluated as CLOSING_AUCTION."""
    tz = ZoneInfo("Asia/Kolkata")
    test_dt = datetime(2026, 6, 10, 15, 35, tzinfo=tz)
    res = evaluate_exchange_schedule("NSE", as_of=test_dt)

    assert res.status == "CLOSING_AUCTION"
    assert res.is_open is False


def test_nse_weekend_closure():
    """Saturday afternoon must be evaluated as CLOSED due to Weekend."""
    tz = ZoneInfo("Asia/Kolkata")
    test_dt = datetime(2026, 6, 13, 14, 0, tzinfo=tz)  # Saturday
    res = evaluate_exchange_schedule("NSE", as_of=test_dt)

    assert res.status == "CLOSED"
    assert res.is_open is False
    assert res.is_weekend is True
    assert "Weekend" in (res.closure_reason or "")
    assert res.countdown_seconds > 0
    # Next trading date must be Monday
    assert res.next_trading_date == "2026-06-15"


def test_nse_official_holiday():
    """Republic Day (2026-01-26) is a Monday and must be recognized as an Exchange Holiday."""
    tz = ZoneInfo("Asia/Kolkata")
    test_dt = datetime(2026, 1, 26, 11, 0, tzinfo=tz)
    res = evaluate_exchange_schedule("NSE", as_of=test_dt)

    assert res.status == "CLOSED"
    assert res.is_open is False
    assert res.is_holiday is True
    assert "Republic Day" in (res.closure_reason or "")
    assert res.next_trading_date == "2026-01-27"


def test_nyse_regular_open():
    """Wednesday at 11:00 AM EDT must be evaluated as OPEN for NYSE."""
    tz = ZoneInfo("America/New_York")
    test_dt = datetime(2026, 6, 10, 11, 0, tzinfo=tz)
    res = evaluate_exchange_schedule("NYSE", as_of=test_dt)

    assert res.exchange == "NYSE"
    assert res.is_open is True
    assert res.status == "OPEN"
    assert res.timezone == "America/New_York"


def test_nyse_us_holiday_independence_day():
    """Observed Independence Day (2026-07-03 Friday) must be recognized as a US market holiday."""
    tz = ZoneInfo("America/New_York")
    test_dt = datetime(2026, 7, 3, 10, 30, tzinfo=tz)
    res = evaluate_exchange_schedule("NYSE", as_of=test_dt)

    assert res.status == "CLOSED"
    assert res.is_holiday is True
    assert "Independence Day" in (res.closure_reason or "")
    # Friday holiday -> Saturday/Sunday weekend -> Monday 2026-07-06
    assert res.next_trading_date == "2026-07-06"


def test_get_next_trading_date_holiday_chain():
    """If Friday is a holiday, next trading day must skip weekend and land on Monday."""
    holidays = {date(2026, 4, 3): "Good Friday"}
    thursday = date(2026, 4, 2)
    next_d = get_next_trading_date(thursday, holidays)
    assert next_d == date(2026, 4, 6)
