"""
Health Check and System Diagnostics Endpoint
"""

from fastapi import APIRouter
from app.config import settings

router = APIRouter()


@router.get("/health", tags=["System"])
async def api_health():
    """Returns system operational status and staging parameters."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "auth_provider": "Supabase JWT (HS256)",
        "isolation_model": "PostgreSQL Database-Enforced RLS",
        "caching": {
            "l1_memory_active": True,
            "l2_upstash_configured": bool(settings.UPSTASH_REDIS_REST_URL),
            "upstash_quota_limit": settings.UPSTASH_FREE_COMMANDS_MONTHLY_LIMIT,
        },
    }
