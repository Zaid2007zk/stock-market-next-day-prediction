"""
MarketPulse Backend Configuration Module
Defines runtime settings, cloud provider limits, and environment variables.
"""

from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings for MarketPulse backend.
    Reads from environment variables and defaults to safe staging configuration.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # General Service Settings
    APP_NAME: str = "MarketPulse API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "staging"  # development | staging | production
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    # CORS Whitelist (Cloudflare Pages staging & local dev)
    CORS_ORIGINS: List[str] = [
        "https://staging-marketpulse.pages.dev",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Supabase Configuration (Free Tier: PostgreSQL 15 + Supabase Auth)
    # Multi-tenant isolation is enforced via database-level Row-Level Security (RLS)
    SUPABASE_URL: str = "https://your-project-id.supabase.co"
    SUPABASE_ANON_KEY: str = "your-anon-key"
    SUPABASE_JWT_SECRET: str = "your-jwt-secret"

    # Upstash Serverless Redis Free Tier Configuration
    # Official Quotas verified from upstash.com/pricing:
    # - Free commands: 500,000 commands/month (soft limit with fail/throttle protection)
    # - Free storage: 250 MB free-plan storage
    # - Max data size: 256 MB ceiling
    UPSTASH_REDIS_REST_URL: Optional[str] = None
    UPSTASH_REDIS_REST_TOKEN: Optional[str] = None
    UPSTASH_FREE_COMMANDS_MONTHLY_LIMIT: int = 500_000
    UPSTASH_FREE_STORAGE_MB_LIMIT: int = 250
    UPSTASH_MAX_DATA_SIZE_MB: int = 256

    # L1 In-Process Memory Cache (Local fallback for ₹0 resiliency)
    L1_CACHE_MAX_SIZE: int = 1000
    L1_CACHE_TTL_SECONDS: int = 60

    # Rate Limiting (Token-Bucket per client IP/token)
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = 20

    # AI Provider Settings (Abstracted behind AIAnalystProvider)
    # Concrete choice is unresolved during Milestone 1 scaffolding
    AI_PROVIDER: str = "none"  # "none" | "gemini" | "groq" | "ollama"
    AI_MODEL: str = "unresolved"
    AI_API_KEY: Optional[str] = None

    # Market Data Provider Mode ("auto" | "yfinance" | "zerodha" | "upstox" | "csv" | "mock")
    MARKET_DATA_PROVIDER: str = "auto"

    # Zerodha Kite Connect Settings (Optional Broker API)
    ZERODHA_API_KEY: Optional[str] = None
    ZERODHA_ACCESS_TOKEN: Optional[str] = None

    # Upstox v2 Settings (Optional Broker API)
    UPSTOX_API_KEY: Optional[str] = None
    UPSTOX_ACCESS_TOKEN: Optional[str] = None


# Global singleton settings instance
settings = Settings()
