"""
Deterministic Multi-Factor Scoring Engine
Computes factor health ratings across Value, Momentum, Quality, and Volatility (0-100).
"""

from typing import List, Optional
import numpy as np
import pandas as pd

from app.models.market import OHLCVBar, FundamentalsData, FactorScorecard


def compute_factor_scorecard(
    symbol: str,
    bars: List[OHLCVBar],
    fundamentals: Optional[FundamentalsData] = None,
) -> FactorScorecard:
    """
    Computes a deterministic quantitative factor scorecard on a 0-100 scale.
    """
    sym = symbol.upper()

    # 1. Momentum Score (0-100)
    momentum_score = 50.0
    if len(bars) >= 50:
        closes = pd.Series([b.close for b in bars])
        sma_20 = closes.tail(20).mean()
        sma_50 = closes.tail(50).mean()
        latest = closes.iloc[-1]
        ret_50 = (latest - closes.iloc[-50]) / closes.iloc[-50]

        trend_boost = 15.0 if sma_20 > sma_50 else -15.0
        ret_boost = max(-25.0, min(25.0, ret_50 * 100.0))
        momentum_score = float(np.clip(50.0 + trend_boost + ret_boost, 5.0, 95.0))

    # 2. Volatility Score (0-100, where higher = lower/safer volatility)
    volatility_score = 50.0
    if len(bars) >= 20:
        closes = pd.Series([b.close for b in bars])
        returns = closes.pct_change().dropna()
        annualized_vol = returns.tail(20).std() * np.sqrt(252)
        # 15% vol = 80 score, 35% vol = 40 score
        vol_score = 100.0 - (annualized_vol * 150.0)
        volatility_score = float(np.clip(vol_score, 10.0, 95.0))

    # 3. Value Score (0-100)
    value_score = 50.0
    if fundamentals and fundamentals.pe_ratio:
        pe = fundamentals.pe_ratio
        # PE < 15 is high value (80+), PE > 40 is low value (<30)
        v_score = 100.0 - (pe * 1.8)
        value_score = float(np.clip(v_score, 10.0, 95.0))

    # 4. Quality Score (0-100)
    quality_score = 55.0
    if fundamentals:
        roe = fundamentals.roe or 15.0
        de = fundamentals.debt_to_equity or 0.5
        q_score = (roe * 2.5) - (de * 20.0) + 30.0
        quality_score = float(np.clip(q_score, 10.0, 95.0))

    # 5. Composite Score (Weighted Combination)
    composite = (
        0.30 * momentum_score
        + 0.25 * value_score
        + 0.25 * quality_score
        + 0.20 * volatility_score
    )
    composite = round(float(composite), 1)

    # Rating classification
    if composite >= 75.0:
        rating = "Strong Buy"
    elif composite >= 60.0:
        rating = "Buy"
    elif composite >= 45.0:
        rating = "Neutral"
    elif composite >= 30.0:
        rating = "Underperform"
    else:
        rating = "Avoid"

    summary = (
        f"{sym} exhibits {rating.lower()} characteristics with composite score {composite}/100. "
        f"Momentum: {momentum_score:.1f}, Value: {value_score:.1f}, "
        f"Quality: {quality_score:.1f}, Low-Vol: {volatility_score:.1f}."
    )

    return FactorScorecard(
        symbol=sym,
        composite_score=composite,
        value_score=round(value_score, 1),
        momentum_score=round(momentum_score, 1),
        quality_score=round(quality_score, 1),
        volatility_score=round(volatility_score, 1),
        rating=rating,
        summary=summary,
    )
