"""
MarketPulse FastAPI Backend Gateway
Scaffolding entrypoint for Milestone 1.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from app.api.v1.router import api_v1_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="MarketPulse AI-Powered Financial Intelligence API Gateway",
)

# Configure CORS for Cloudflare Pages static frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Versioned API Router
app.include_router(api_v1_router)


@app.get("/")
async def root():
    """Service metadata and staging milestone status."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "environment": settings.ENVIRONMENT,
        "milestone": "Milestone 2 Backend Foundation & Supabase RLS",
    }


@app.get("/health")
async def health_check():
    """Basic health check endpoint for Render monitoring."""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
    }

