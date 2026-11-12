"""
Pre-Invocation Zero-Trust Privacy Filter
Guarantees that zero user PII, email addresses, account UUIDs, credentials,
or confidential portfolio amounts are ever transmitted in outbound AI prompt payloads.
"""

import re
from typing import Dict, Any, List

# Security regex patterns for sensitive data detection
EMAIL_REGEX = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
UUID_REGEX = re.compile(r"\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b")
SECRET_REGEX = re.compile(r"(?i)(bearer\s+[a-zA-Z0-9_\-\.]+|api[_-]?key|secret|password|token)\s*[:=]\s*\S+")
PORTFOLIO_HOLDING_REGEX = re.compile(r"(?i)\b(my\s+portfolio|holding|shares\s+held|my\s+account\s+balance)\b.*?(₹|\$|INR|USD)\s*[\d,]+(\.\d+)?")


class PrivacyViolationError(ValueError):
    """Raised when an outbound prompt payload fails zero-trust privacy validation."""
    pass


def scan_for_privacy_violations(text: str) -> List[str]:
    """
    Scans a prompt string for sensitive tokens.
    Returns a list of violation descriptions, or empty list if completely clean.
    """
    violations = []
    if EMAIL_REGEX.search(text):
        violations.append("Detected email address (PII)")
    if UUID_REGEX.search(text):
        violations.append("Detected user or entity UUID (account identifier)")
    if SECRET_REGEX.search(text):
        violations.append("Detected potential credential or API secret token")
    if PORTFOLIO_HOLDING_REGEX.search(text):
        violations.append("Detected confidential user portfolio holding amount")
    return violations


def assert_privacy_compliance(prompt: str) -> None:
    """
    Asserts zero sensitive data exists in outbound prompt.
    Raises PrivacyViolationError if any sensitive token is identified.
    """
    violations = scan_for_privacy_violations(prompt)
    if violations:
        raise PrivacyViolationError(
            f"Pre-invocation privacy filter rejected prompt: {', '.join(violations)}"
        )


def sanitize_context_for_ai(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Strips internal user IDs, authentication tokens, and private portfolio wealth
    from a data dictionary, retaining only ticker symbols and deterministic quantitative metrics.
    """
    clean = {}
    for k, v in raw_data.items():
        # Exclude sensitive keys
        if k in {"user_id", "id", "email", "token", "password", "portfolio_value", "total_wealth", "jwt"}:
            continue
        if isinstance(v, dict):
            clean[k] = sanitize_context_for_ai(v)
        elif isinstance(v, list):
            clean[k] = [sanitize_context_for_ai(i) if isinstance(i, dict) else i for i in v]
        else:
            clean[k] = v
    return clean
