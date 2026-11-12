"""
Deterministic Technical Indicators Engine
Computes standard financial indicators with exact mathematical formulas using numpy and pandas.
All calculations are deterministic, reproducible, and separate from AI generation.
"""

from typing import List, Optional
import numpy as np
import pandas as pd

from app.models.market import OHLCVBar, TechnicalIndicators


def calculate_sma(series: pd.Series, window: int) -> pd.Series:
    """Computes Simple Moving Average (SMA)."""
    return series.rolling(window=window, min_periods=window).mean()


def calculate_ema(series: pd.Series, span: int) -> pd.Series:
    """Computes Exponential Moving Average (EMA)."""
    return series.ewm(span=span, adjust=False).mean()


def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """
    Computes Relative Strength Index (RSI) using standard exponential smoothing.
    Formula: RSI = 100 - (100 / (1 + RS)) where RS = Avg Gain / Avg Loss.
    """
    delta = series.diff()
    gain = delta.clip(lower=0.0)
    loss = -delta.clip(upper=0.0)

    # Exponential moving average for gains and losses
    avg_gain = gain.ewm(com=period - 1, min_periods=period).mean()
    avg_loss = loss.ewm(com=period - 1, min_periods=period).mean()

    rs = avg_gain / avg_loss.replace(0.0, np.nan)
    rsi = 100.0 - (100.0 / (1.0 + rs))
    # Handle zero loss case (RSI = 100) and zero gain case (RSI = 50)
    fill_vals = pd.Series(np.where(avg_gain > 0, 100.0, 50.0), index=rsi.index)
    rsi = rsi.fillna(fill_vals)
    return rsi


def calculate_macd(
    series: pd.Series,
    fast_period: int = 12,
    slow_period: int = 26,
    signal_period: int = 9,
) -> pd.DataFrame:
    """
    Computes MACD (Moving Average Convergence Divergence).
    MACD Line = Fast EMA - Slow EMA
    Signal Line = 9-period EMA of MACD Line
    Histogram = MACD Line - Signal Line
    """
    fast_ema = calculate_ema(series, span=fast_period)
    slow_ema = calculate_ema(series, span=slow_period)
    macd_line = fast_ema - slow_ema
    signal_line = calculate_ema(macd_line, span=signal_period)
    histogram = macd_line - signal_line

    return pd.DataFrame({
        "macd_line": macd_line,
        "macd_signal": signal_line,
        "macd_histogram": histogram,
    })


def calculate_bollinger_bands(
    series: pd.Series,
    window: int = 20,
    num_std: float = 2.0,
) -> pd.DataFrame:
    """
    Computes Bollinger Bands:
    Middle Band = 20-period SMA
    Upper Band = Middle + (2 * Std Dev)
    Lower Band = Middle - (2 * Std Dev)
    """
    middle = calculate_sma(series, window=window)
    std = series.rolling(window=window, min_periods=window).std()
    upper = middle + (std * num_std)
    lower = middle - (std * num_std)

    return pd.DataFrame({
        "bollinger_upper": upper,
        "bollinger_middle": middle,
        "bollinger_lower": lower,
    })


def calculate_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """
    Computes Average True Range (ATR).
    True Range = max(high - low, abs(high - prev_close), abs(low - prev_close))
    """
    high = df["high"]
    low = df["low"]
    prev_close = df["close"].shift(1)

    tr1 = high - low
    tr2 = (high - prev_close).abs()
    tr3 = (low - prev_close).abs()

    true_range = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    return true_range.rolling(window=period, min_periods=period).mean()


def compute_all_indicators(symbol: str, bars: List[OHLCVBar]) -> Optional[TechnicalIndicators]:
    """
    Takes a chronological list of OHLCV bars and computes the latest technical indicators.
    """
    if len(bars) < 20:
        return None

    df = pd.DataFrame([b.model_dump() for b in bars])
    df = df.sort_values("timestamp").reset_index(drop=True)
    close = df["close"]

    # Compute individual indicators
    sma_20 = calculate_sma(close, 20)
    sma_50 = calculate_sma(close, 50)
    sma_200 = calculate_sma(close, 200) if len(df) >= 200 else pd.Series(dtype=float)

    ema_9 = calculate_ema(close, 9)
    ema_21 = calculate_ema(close, 21)

    rsi = calculate_rsi(close, 14)
    macd_df = calculate_macd(close, 12, 26, 9)
    bb_df = calculate_bollinger_bands(close, 20, 2.0)
    atr = calculate_atr(df, 14)

    latest_idx = len(df) - 1

    def _safe_float(val):
        if pd.isna(val) or np.isnan(val):
            return None
        return round(float(val), 2)

    return TechnicalIndicators(
        symbol=symbol.upper(),
        timestamp=str(df.iloc[-1]["timestamp"]),
        sma_20=_safe_float(sma_20.iloc[latest_idx]),
        sma_50=_safe_float(sma_50.iloc[latest_idx]) if len(df) >= 50 else None,
        sma_200=_safe_float(sma_200.iloc[latest_idx]) if len(df) >= 200 else None,
        ema_9=_safe_float(ema_9.iloc[latest_idx]),
        ema_21=_safe_float(ema_21.iloc[latest_idx]),
        rsi_14=_safe_float(rsi.iloc[latest_idx]),
        macd_line=_safe_float(macd_df["macd_line"].iloc[latest_idx]),
        macd_signal=_safe_float(macd_df["macd_signal"].iloc[latest_idx]),
        macd_histogram=_safe_float(macd_df["macd_histogram"].iloc[latest_idx]),
        bollinger_upper=_safe_float(bb_df["bollinger_upper"].iloc[latest_idx]),
        bollinger_middle=_safe_float(bb_df["bollinger_middle"].iloc[latest_idx]),
        bollinger_lower=_safe_float(bb_df["bollinger_lower"].iloc[latest_idx]),
        atr_14=_safe_float(atr.iloc[latest_idx]),
    )
