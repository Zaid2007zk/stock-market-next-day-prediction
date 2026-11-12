"""
Financial Research Assistant API Endpoints
Provides grounded research briefs and conversational QA with citations and zero-trust privacy.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.rate_limiter import rate_limit_dependency
from app.providers.market_data.mock import MockMarketDataProvider
from app.providers.market_data.csv_provider import AuthorizedCSVDataProvider
from app.api.v1.endpoints.market import get_active_provider
from app.analytics.indicators import compute_all_indicators
from app.analytics.factors import compute_factor_scorecard
from app.providers.ai.models import (
    ResearchBriefResponse,
    ResearchChatRequest,
    ResearchChatResponse,
)
from app.providers.ai.analyst import AIAnalystProvider, get_analyst_provider
from app.providers.ai.privacy_filter import PrivacyViolationError

router = APIRouter(prefix="/research", tags=["AI Financial Research Assistant"])


class BriefRequest(BaseModel):
    symbol: str = Field(..., description="Ticker symbol to research")


@router.post("/brief", response_model=ResearchBriefResponse, dependencies=[Depends(rate_limit_dependency)])
async def generate_brief(
    request: BriefRequest,
    analyst: AIAnalystProvider = Depends(get_analyst_provider),
):
    """
    Generates a financial research brief strictly grounded in verified deterministic metrics.
    Cites specific sources and timestamps.
    """
    sym = request.symbol.strip().upper()
    provider = await get_active_provider(sym)

    quote = await provider.get_quote(sym) if provider else None
    bars = await provider.get_historical_ohlcv(sym, lookback_days=250) if provider else []
    fundamentals = await provider.get_fundamentals(sym) if provider else None

    indicators = compute_all_indicators(sym, bars) if bars else None
    scorecard = compute_factor_scorecard(sym, bars, fundamentals) if bars else None

    return await analyst.generate_research_brief(
        symbol=sym,
        quote=quote,
        indicators=indicators,
        scorecard=scorecard,
    )


@router.post("/chat", response_model=ResearchChatResponse, dependencies=[Depends(rate_limit_dependency)])
async def chat_with_analyst(
    request: ResearchChatRequest,
    analyst: AIAnalystProvider = Depends(get_analyst_provider),
):
    """
    Submits a research inquiry to the Financial Research Assistant.
    Enforces pre-invocation zero-trust privacy and grounds responses in verified metrics.
    """
    sym = request.symbol.strip().upper()
    try:
        provider = await get_active_provider(sym)
        quote = await provider.get_quote(sym) if provider else None
        bars = await provider.get_historical_ohlcv(sym, lookback_days=250) if provider else []
        fundamentals = await provider.get_fundamentals(sym) if provider else None

        indicators = compute_all_indicators(sym, bars) if bars else None
        scorecard = compute_factor_scorecard(sym, bars, fundamentals) if bars else None

        return await analyst.answer_question(
            symbol=sym,
            question=request.question,
            quote=quote,
            indicators=indicators,
            scorecard=scorecard,
        )
    except PrivacyViolationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
