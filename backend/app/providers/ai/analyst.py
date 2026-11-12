"""
AI Financial Research Assistant Engine & Provider Abstraction
Implements strictly grounded research brief generation and conversational QA.
Deterministic calculations are computed exclusively by backend Python engines;
the analyst engine only interprets and synthesizes narratives with explicit citations.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone

from app.models.market import QuoteData, TechnicalIndicators, FactorScorecard
from app.providers.ai.models import (
    Citation,
    ResearchBriefResponse,
    ResearchChatRequest,
    ResearchChatResponse,
)
from app.providers.ai.privacy_filter import assert_privacy_compliance
from app.providers.ai.validator import validate_and_ground_brief


class AIAnalystProvider(ABC):
    """
    Abstract interface for the Financial Research Assistant.
    Decouples application logic from specific cloud LLM vendors (Google Gemini, Groq, local Ollama).
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    async def generate_research_brief(
        self,
        symbol: str,
        quote: Optional[QuoteData],
        indicators: Optional[TechnicalIndicators],
        scorecard: Optional[FactorScorecard],
    ) -> ResearchBriefResponse:
        pass

    @abstractmethod
    async def answer_question(
        self,
        symbol: str,
        question: str,
        quote: Optional[QuoteData],
        indicators: Optional[TechnicalIndicators],
        scorecard: Optional[FactorScorecard],
    ) -> ResearchChatResponse:
        pass


class DeterministicGroundedAnalyst(AIAnalystProvider):
    """
    Standard deterministic research assistant engine.
    Produces high-fidelity, grounded research narratives with inline citations,
    source metadata, timestamps, and explicit missing-data handling without external LLM dependencies.
    Serves as the default staging engine and resilient fallback.
    """

    @property
    def provider_name(self) -> str:
        return "Deterministic Grounded Synthesis Engine"

    async def generate_research_brief(
        self,
        symbol: str,
        quote: Optional[QuoteData],
        indicators: Optional[TechnicalIndicators],
        scorecard: Optional[FactorScorecard],
    ) -> ResearchBriefResponse:
        sym = symbol.upper()
        now_ts = datetime.now(timezone.utc).isoformat()

        # Handle missing or unverified data
        if not quote and not indicators and not scorecard:
            return ResearchBriefResponse(
                symbol=sym,
                summary=f"Market data for {sym} is currently unavailable.",
                factor_analysis="Unable to perform factor evaluation due to missing quantitative metrics.",
                risk_notes="Risk parameters could not be evaluated.",
                citations=[],
                uncertainty_notes="[Missing Data - Analysis Unavailable - Verified Provider Required]",
                is_fallback=True,
                model_name=self.provider_name,
            )

        citations: List[Citation] = []
        verified_metrics: Dict[str, float] = {}

        # 1. Quote Citations
        if quote:
            citations.append(Citation(
                metric_name="Last Traded Price",
                value=quote.price,
                source=quote.source,
                timestamp=quote.timestamp,
                verified=True,
            ))
            citations.append(Citation(
                metric_name="Daily Change %",
                value=quote.change_percent,
                source=quote.source,
                timestamp=quote.timestamp,
                verified=True,
            ))
            verified_metrics["price"] = quote.price
            verified_metrics["change_percent"] = quote.change_percent

        # 2. Indicator Citations
        if indicators:
            if indicators.rsi_14 is not None:
                citations.append(Citation(
                    metric_name="RSI (14)",
                    value=indicators.rsi_14,
                    source="Deterministic Technical Indicators Engine",
                    timestamp=indicators.timestamp,
                    verified=True,
                ))
                verified_metrics["rsi_14"] = indicators.rsi_14
            if indicators.sma_20 is not None:
                citations.append(Citation(
                    metric_name="SMA (20)",
                    value=indicators.sma_20,
                    source="Deterministic Technical Indicators Engine",
                    timestamp=indicators.timestamp,
                    verified=True,
                ))
                verified_metrics["sma_20"] = indicators.sma_20
            if indicators.macd_line is not None:
                citations.append(Citation(
                    metric_name="MACD Line",
                    value=indicators.macd_line,
                    source="Deterministic Technical Indicators Engine",
                    timestamp=indicators.timestamp,
                    verified=True,
                ))
                verified_metrics["macd_line"] = indicators.macd_line

        # 3. Factor Citations
        if scorecard:
            citations.append(Citation(
                metric_name="Composite Factor Score",
                value=scorecard.composite_score,
                source="Deterministic Multi-Factor Scoring Engine",
                timestamp=now_ts,
                verified=True,
            ))
            verified_metrics["composite_score"] = scorecard.composite_score

        # Synthesize Grounded Narratives
        # Summary
        p_str = f"trading at {quote.price:.2f} ({quote.change_percent:+.2f}%)" if quote else "with no live quote"
        summary = (
            f"{sym} is currently {p_str}. "
            f"Overall quantitative health is classified as '{scorecard.rating if scorecard else 'Neutral'}' "
            f"with a composite factor score of {scorecard.composite_score if scorecard else 50.0}/100."
        )

        # Factor Analysis
        f_parts = []
        if scorecard:
            f_parts.append(
                f"Value Score: {scorecard.value_score}/100, Momentum Score: {scorecard.momentum_score}/100, "
                f"Quality Score: {scorecard.quality_score}/100, and Low-Volatility Score: {scorecard.volatility_score}/100."
            )
        if indicators and indicators.rsi_14 is not None:
            rsi_interp = "overbought (>70)" if indicators.rsi_14 > 70 else ("oversold (<30)" if indicators.rsi_14 < 30 else "neutral")
            f_parts.append(f"Momentum indicator RSI (14) stands at {indicators.rsi_14:.2f}, indicating {rsi_interp} momentum conditions.")
        factor_analysis = " ".join(f_parts) if f_parts else "Factor evaluation unavailable."

        # Risk Notes
        r_parts = []
        if quote and quote.is_stale:
            r_parts.append("Data Warning: The latest market quote timestamp is older than 15 minutes; consider data delayed.")
        if indicators and indicators.bollinger_upper and indicators.bollinger_lower:
            band_width = indicators.bollinger_upper - indicators.bollinger_lower
            r_parts.append(f"Bollinger Band width is {band_width:.2f}, reflecting prevailing volatility dispersion.")
        r_parts.append("Investment decision-support notice: All ratings represent quantitative factor rankings, not financial guarantees.")
        risk_notes = " ".join(r_parts)

        # Build response
        brief = ResearchBriefResponse(
            symbol=sym,
            summary=summary,
            factor_analysis=factor_analysis,
            risk_notes=risk_notes,
            citations=citations,
            uncertainty_notes=None if quote else "[Market Data Unavailable - Verified Provider Required]",
            is_fallback=True,
            model_name=self.provider_name,
            generated_at=now_ts,
        )

        # Post-generation validation assertion
        return validate_and_ground_brief(brief, verified_metrics)

    async def answer_question(
        self,
        symbol: str,
        question: str,
        quote: Optional[QuoteData],
        indicators: Optional[TechnicalIndicators],
        scorecard: Optional[FactorScorecard],
    ) -> ResearchChatResponse:
        sym = symbol.upper()
        q_lower = question.lower()
        now_ts = datetime.now(timezone.utc).isoformat()

        # Run privacy assertion on incoming question
        assert_privacy_compliance(question)

        # Check for fake document / unverified filing queries
        if any(term in q_lower for term in ["fake", "fabricated", "unfiled", "secret leak", "confidential document"]):
            return ResearchChatResponse(
                symbol=sym,
                answer="Source not available in verified dataset. MarketPulse only analyzes verified regulatory filings and deterministic quantitative feeds.",
                citations=[],
                uncertainty_notes="[Unverified Source Refused]",
                is_fallback=True,
                model_name=self.provider_name,
            )

        # Check for price prediction requests
        if any(term in q_lower for term in ["predict", "price target for tomorrow", "will it go up", "guarantee"]):
            return ResearchChatResponse(
                symbol=sym,
                answer=(
                    f"MarketPulse does not forecast speculative price targets. "
                    f"Based on deterministic technical metrics, {sym}'s RSI (14) is "
                    f"{indicators.rsi_14 if indicators and indicators.rsi_14 else 'N/A'} "
                    f"and composite score is {scorecard.composite_score if scorecard else 'N/A'}/100."
                ),
                citations=[
                    Citation(
                        metric_name="Composite Factor Score",
                        value=scorecard.composite_score if scorecard else 50.0,
                        source="Deterministic Multi-Factor Scoring Engine",
                        timestamp=now_ts,
                        verified=True,
                    )
                ] if scorecard else [],
                uncertainty_notes="[Price Predictions Excluded by Design]",
                is_fallback=True,
                model_name=self.provider_name,
            )

        # Missing data handling
        if not quote and not scorecard:
            return ResearchChatResponse(
                symbol=sym,
                answer=f"Market data for {sym} is unavailable. Verified market provider required.",
                citations=[],
                uncertainty_notes="[Missing Data - Analysis Unavailable]",
                is_fallback=True,
                model_name=self.provider_name,
            )

        citations = []
        if scorecard:
            citations.append(Citation(
                metric_name="Composite Factor Score",
                value=scorecard.composite_score,
                source="Deterministic Multi-Factor Scoring Engine",
                timestamp=now_ts,
                verified=True,
            ))

        # Grounded answering
        if "value" in q_lower:
            ans = f"{sym}'s Value Score is {scorecard.value_score if scorecard else 'N/A'}/100, reflecting valuation multiples."
        elif "momentum" in q_lower or "rsi" in q_lower:
            rsi_val = f"{indicators.rsi_14:.2f}" if indicators and indicators.rsi_14 else "N/A"
            ans = f"{sym}'s Momentum Score is {scorecard.momentum_score if scorecard else 'N/A'}/100 with 14-day RSI at {rsi_val}."
        elif "risk" in q_lower:
            ans = f"{sym}'s Low-Volatility Score is {scorecard.volatility_score if scorecard else 'N/A'}/100. Lower scores indicate higher historical standard deviation."
        else:
            ans = (
                f"{sym} is evaluated with a composite factor rating of '{scorecard.rating if scorecard else 'Neutral'}' "
                f"({scorecard.composite_score if scorecard else 'N/A'}/100) based on deterministic quantitative analysis."
            )

        return ResearchChatResponse(
            symbol=sym,
            answer=ans,
            citations=citations,
            uncertainty_notes=None,
            is_fallback=True,
            model_name=self.provider_name,
        )


# Global default analyst instance
default_analyst = DeterministicGroundedAnalyst()


def get_analyst_provider() -> AIAnalystProvider:
    """FastAPI dependency for AI Research Assistant provider."""
    return default_analyst
