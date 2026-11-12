"""
API Version 1 Router Aggregator
Combines health, user profile, watchlist, portfolio, and research notes routers.
"""

from fastapi import APIRouter
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.users import router as users_router
from app.api.v1.endpoints.watchlists import router as watchlists_router
from app.api.v1.endpoints.portfolio import router as portfolio_router
from app.api.v1.endpoints.notes import router as notes_router
from app.api.v1.endpoints.market import router as market_router
from app.api.v1.endpoints.research import router as research_router
from app.api.v1.endpoints.risk import router as risk_router
from app.api.v1.endpoints.backtest import router as backtest_router
from app.api.v1.endpoints.academy import router as academy_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.billing import router as billing_router

api_v1_router = APIRouter(prefix="/api/v1")

# Mount endpoints
api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(billing_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(watchlists_router)
api_v1_router.include_router(portfolio_router)
api_v1_router.include_router(notes_router)
api_v1_router.include_router(market_router)
api_v1_router.include_router(research_router)
api_v1_router.include_router(risk_router)
api_v1_router.include_router(backtest_router)
api_v1_router.include_router(academy_router)


