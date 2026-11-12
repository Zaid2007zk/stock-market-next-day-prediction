"""
Chronological Walk-Forward Backtesting API Endpoint
Executes trading strategies chronologically without lookahead bias, accounting for real frictions.
"""

from fastapi import APIRouter, HTTPException, Depends

from app.analytics.backtest import (
    BacktestRequest,
    BacktestResult,
    run_walk_forward_backtest,
)
from app.api.v1.endpoints.market import get_active_provider, mock_provider
from app.core.auth import get_current_user
from app.models.user import AuthenticatedUser

router = APIRouter(prefix="/backtest", tags=["Backtesting"])


@router.post("/run", response_model=BacktestResult)
async def run_backtest(
    req: BacktestRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Executes a walk-forward chronological backtest on historical OHLCV bars.
    Deducts statutory Indian market transaction frictions (STT, brokerage, turnover, GST, slippage).
    """
    bars = req.bars
    if not bars or len(bars) < 20:
        # Fetch from active market data provider
        provider = (await get_active_provider(req.symbol)) or mock_provider
        fetched = await provider.get_historical_ohlcv(
            symbol=req.symbol,
            timeframe="1D",
            lookback_days=365,
        )
        if not fetched or len(fetched) < 20:
            raise HTTPException(
                status_code=404,
                detail=f"Insufficient historical data available to backtest symbol {req.symbol}",
            )
        bars = fetched

    try:
        result = run_walk_forward_backtest(bars=bars, req=req)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Backtest execution failed: {str(e)}")
