"""
Google ID Token Verification module.

Verifies Google ID Tokens (JWT) using Google's public keys via `google-auth`
with an HTTP fallback to Google's tokeninfo endpoint.
"""

import logging
from typing import Any, TypedDict

import httpx
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from app.core.config import settings

logger = logging.getLogger(__name__)


class GoogleUserInfo(TypedDict):
    email: str
    display_name: str
    avatar_url: str | None
    google_id: str


def verify_google_token_with_library(token_str: str) -> dict[str, Any]:
    """
    Verify Google ID Token using the official `google-auth` Python library.
    Checks signature, expiration, and audience (if GOOGLE_CLIENT_ID is configured).
    """
    request = google_requests.Request()
    expected_client_id = settings.GOOGLE_CLIENT_ID.strip() if settings.GOOGLE_CLIENT_ID else None

    # If client_id is not set, verify without checking audience
    payload = id_token.verify_oauth2_token(
        token_str,
        request,
        audience=expected_client_id,
        clock_skew_in_seconds=10,
    )

    # Google token issuer must be accounts.google.com or https://accounts.google.com
    issuer = payload.get("iss", "")
    if issuer not in ("accounts.google.com", "https://accounts.google.com"):
        raise ValueError(f"Invalid token issuer: {issuer}")

    return payload


async def verify_google_token_fallback(token_str: str) -> dict[str, Any]:
    """
    Fallback token verification via Google's tokeninfo REST endpoint.
    Useful when network or certificate environments have quirks.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": token_str},
        )
        if resp.status_code != 200:
            raise ValueError(f"Google tokeninfo rejected token: {resp.text}")

        payload = resp.json()
        expected_client_id = settings.GOOGLE_CLIENT_ID.strip() if settings.GOOGLE_CLIENT_ID else None
        if expected_client_id and payload.get("aud") != expected_client_id:
            raise ValueError("Token audience does not match GOOGLE_CLIENT_ID")

        return payload


async def verify_google_id_token(token_str: str) -> GoogleUserInfo:
    """
    Verify a Google ID Token string and extract user information.
    Tries official library first, falling back to HTTP tokeninfo if needed.
    """
    if not token_str or not isinstance(token_str, str):
        raise ValueError("Google ID token is required")

    payload: dict[str, Any] | None = None
    try:
        payload = verify_google_token_with_library(token_str)
    except Exception as lib_err:
        logger.warning(f"google-auth library verification failed, attempting HTTP fallback: {lib_err}")
        try:
            payload = await verify_google_token_fallback(token_str)
        except Exception as fallback_err:
            raise ValueError(f"Failed to verify Google token: {lib_err}; fallback error: {fallback_err}") from lib_err

    if not payload:
        raise ValueError("Invalid Google token payload")

    email = payload.get("email")
    if not email:
        raise ValueError("Google token payload does not contain an email address")

    # In Google OAuth, email_verified can be boolean or string 'true'
    email_verified = payload.get("email_verified")
    if email_verified is False or str(email_verified).lower() == "false":
        raise ValueError("Google email address is not verified")

    display_name = (
        payload.get("name")
        or payload.get("given_name")
        or email.split("@")[0]
    ).strip()

    avatar_url = payload.get("picture")

    google_id = str(payload.get("sub", ""))

    return {
        "email": email.strip().lower(),
        "display_name": display_name[:100],
        "avatar_url": avatar_url,
        "google_id": google_id,
    }
