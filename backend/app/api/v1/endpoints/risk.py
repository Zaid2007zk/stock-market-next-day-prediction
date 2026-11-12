"""
Portfolio Risk Diagnostics API Endpoint
Exposes portfolio valuation, concentration alerts, and parametric/historical VaR calculations.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.analytics.risk import (
    PortfolioHoldingInput,
    PortfolioRiskResponse,
    compute_portfolio_risk,
)
from app.core.auth import get_current_user
from app.models.user import AuthenticatedUser

router = APIRouter(prefix="/risk", tags=["Risk Diagnostics"])


class PortfolioRiskRequest(BaseModel):
    holdings: List[PortfolioHoldingInput]
    benchmark_returns: Optional[List[float]] = None
    risk_free_rate: float = 0.0675
    concentration_threshold: float = 25.0


@router.post("/portfolio", response_model=PortfolioRiskResponse)
async def analyze_portfolio_risk(
    req: PortfolioRiskRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Computes portfolio risk diagnostics, concentration risk warnings,
    and 95% Parametric & Historical Value-at-Risk (VaR).
    Requires authenticated user token.
    """
    try:
        res = compute_portfolio_risk(
            holdings=req.holdings,
            benchmark_returns=req.benchmark_returns,
            risk_free_rate=req.risk_free_rate,
            concentration_threshold=req.concentration_threshold,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk calculation failed: {str(e)}")
