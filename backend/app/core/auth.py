"""
Supabase JWT Authentication Dependency
Validates Supabase-issued JSON Web Tokens, checks cryptographic signatures,
expiration, and extracts user identity for database-enforced row-level security.
"""

from typing import Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import settings
from app.models.user import AuthenticatedUser

# HTTP Bearer scheme with automatic 403/401 handling
security = HTTPBearer(auto_error=False)


def decode_supabase_jwt(token: str, secret: Optional[str] = None) -> Dict[str, Any]:
    """
    Decodes and validates a Supabase JWT.
    Verifies HS256 signature against SUPABASE_JWT_SECRET and asserts expiration.
    """
    jwt_secret = secret or settings.SUPABASE_JWT_SECRET
    if not jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase JWT secret is not configured in backend settings.",
        )

    try:
        # Supabase default tokens use HS256 with aud='authenticated'
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_aud": False,
                "require": ["exp", "sub"],
            },
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please refresh your session.",
            headers={"WWW-Authenticate": "Bearer error=\"invalid_token\", error_description=\"token expired\""},
        )
    except jwt.InvalidSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token signature. Cryptographic verification failed.",
            headers={"WWW-Authenticate": "Bearer error=\"invalid_token\", error_description=\"invalid signature\""},
        )
    except jwt.DecodeError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token. Could not decode JWT claims.",
            headers={"WWW-Authenticate": "Bearer error=\"invalid_token\""},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> AuthenticatedUser:
    """
    FastAPI dependency to extract and authenticate the current user.
    Usage:
        @router.get('/endpoint')
        async def my_endpoint(user: AuthenticatedUser = Depends(get_current_user)):
            ...
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid scheme.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_supabase_jwt(token)

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject claim ('sub').",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return AuthenticatedUser(
        id=user_id,
        email=payload.get("email"),
        role=payload.get("role", "authenticated"),
        aud=payload.get("aud", "authenticated"),
        app_metadata=payload.get("app_metadata", {}),
        user_metadata=payload.get("user_metadata", {}),
    )


def create_test_jwt(
    user_id: str,
    email: Optional[str] = None,
    secret: Optional[str] = None,
    expires_in_seconds: int = 3600,
    role: str = "authenticated",
    aud: str = "authenticated",
) -> str:
    """
    Utility to mint test JWT tokens for unit and integration testing.
    Uses UTC timestamps for strict cryptographic determinism.
    """
    jwt_secret = secret or settings.SUPABASE_JWT_SECRET
    now = datetime.now(timezone.utc)
    exp = now + timedelta(seconds=expires_in_seconds)

    payload = {
        "sub": user_id,
        "email": email or f"user_{user_id[:8]}@example.com",
        "role": role,
        "aud": aud,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
        "app_metadata": {"provider": "email"},
        "user_metadata": {"full_name": f"Test User {user_id[:6]}"},
    }

    return jwt.encode(payload, jwt_secret, algorithm="HS256")
