"""
Token-Bucket In-Process Rate Limiter
Enforces maximum request thresholds (e.g. 20 requests/minute) per client IP.
Returns HTTP 429 Too Many Requests with Retry-After header upon quota breach.
"""

import time
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from app.config import settings


class TokenBucketRateLimiter:
    """
    Thread-safe in-process token bucket rate limiter.
    Each client has a bucket with maximum capacity that refills continuously over time.
    """

    def __init__(self, requests_per_minute: int = 20):
        self.capacity = float(requests_per_minute)
        # Refill rate in tokens per second
        self.refill_rate = self.capacity / 60.0
        # Storage: client_id -> (tokens, last_updated_time)
        self._buckets: Dict[str, Tuple[float, float]] = {}

    def reset(self):
        """Reset buckets between test runs."""
        self._buckets.clear()

    def check_rate_limit(self, client_id: str) -> bool:
        """
        Consumes one token if available.
        Returns True if allowed, False if rate limited.
        """
        now = time.time()
        tokens, last_updated = self._buckets.get(client_id, (self.capacity, now))

        # Refill tokens based on elapsed time
        elapsed = now - last_updated
        tokens = min(self.capacity, tokens + elapsed * self.refill_rate)

        if tokens >= 1.0:
            tokens -= 1.0
            self._buckets[client_id] = (tokens, now)
            return True
        else:
            self._buckets[client_id] = (tokens, now)
            return False


# Global default rate limiter instance
rate_limiter = TokenBucketRateLimiter(requests_per_minute=settings.RATE_LIMIT_REQUESTS_PER_MINUTE)


async def rate_limit_dependency(request: Request):
    """
    FastAPI dependency applying token-bucket rate limiting to incoming requests.
    Identifies clients by X-Forwarded-For header or request client host IP.
    """
    client_ip = request.headers.get("x-forwarded-for") or (request.client.host if request.client else "127.0.0.1")
    # Take the first IP if multiple are listed in proxy chain
    client_ip = client_ip.split(",")[0].strip()

    if not rate_limiter.check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Maximum {settings.RATE_LIMIT_REQUESTS_PER_MINUTE} requests per minute allowed.",
            headers={"Retry-After": "60"},
        )
