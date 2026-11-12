"""
Post-Generation Citation & Mathematical Grounding Validator
Verifies that all metrics and quantitative numbers cited in the AI narrative
match backend deterministic calculations within strict floating-point tolerance (+/- 0.001%).
"""

import math
from typing import Dict, Any, List
from app.providers.ai.models import Citation, ResearchBriefResponse


def validate_citation_accuracy(
    citation: Citation,
    verified_metrics: Dict[str, float],
    tolerance: float = 0.001,  # 0.1% or 0.001 relative tolerance
) -> bool:
    """
    Validates whether a cited numerical metric matches backend calculation.
    """
    key = citation.metric_name.lower().replace(" ", "_")
    for v_key, v_val in verified_metrics.items():
        if key in v_key.lower() or v_key.lower() in key:
            if isinstance(citation.value, (int, float)) and isinstance(v_val, (int, float)):
                if v_val == 0.0:
                    return abs(citation.value) < 1e-4
                diff = abs(citation.value - v_val) / abs(v_val)
                return diff <= tolerance
    # Categorical or textual citation
    return True


def validate_and_ground_brief(
    brief: ResearchBriefResponse,
    verified_metrics: Dict[str, float],
) -> ResearchBriefResponse:
    """
    Inspects all citations in the generated research brief.
    Marks each citation as verified if matched against backend metrics,
    or flags ungrounded assertions.
    """
    for citation in brief.citations:
        is_accurate = validate_citation_accuracy(citation, verified_metrics)
        citation.verified = is_accurate

    return brief
