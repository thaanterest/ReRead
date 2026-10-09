"""
Auth endpoints: register, login, logout, change-password.
"""

import re
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.core.google_auth import verify_google_id_token
from app.core.security import create_access_token, verify_password
from app.crud.user import (
    create_user,
    get_user_by_email,
    get_user_by_username,
    update_password,
    update_user,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import StandardResponse
from app.schemas.user import (
    ChangePasswordRequest,
    GoogleLoginRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)

router = APIRouter(tags=["Authentication"])



# --------------------------------------------------------------------------
# POST /register
# --------------------------------------------------------------------------

@router.post(
    "/register",
    response_model=StandardResponse[UserResponse],
    status_code=status.HTTP_201_CREATED,
)
async def register(
    body: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[UserResponse]:
    # Check duplicate username
    if await get_user_by_username(db, body.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This username is already taken",
        )

    # Check duplicate email
    if await get_user_by_email(db, body.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email is already registered",
        )

    user = await create_user(
        db,
        username=body.username,
        email=body.email,
        password=body.password,
        display_name=body.display_name,
    )

    return StandardResponse(
        success=True,
        data=UserResponse.model_validate(user),
        message="Registration successful",
    )


# --------------------------------------------------------------------------
# POST /login
# --------------------------------------------------------------------------

@router.post(
    "/login",
    response_model=StandardResponse[TokenResponse],
)
async def login(
    body: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[TokenResponse]:
    user = await get_user_by_username(db, body.username)

    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    token = create_access_token(subject=str(user.id))

    return StandardResponse(
        success=True,
        data=TokenResponse(access_token=token),
        message="Login successful",
    )


# --------------------------------------------------------------------------
# POST /auth/google & POST /google
# --------------------------------------------------------------------------

async def _generate_unique_username(db: AsyncSession, email: str, display_name: str) -> str:
    """Generate a clean, unique username from an email address or display name."""
    base = email.split("@")[0]
    cleaned = re.sub(r"[^A-Za-z0-9_]", "", base)
    if len(cleaned) < 3:
        cleaned = f"user_{cleaned}" if cleaned else "reader"
    cleaned = cleaned[:35]

    candidate = cleaned
    counter = 1
    while await get_user_by_username(db, candidate):
        suffix = secrets.token_hex(2)
        candidate = f"{cleaned[:30]}_{suffix}"
        counter += 1
        if counter > 20:
            candidate = f"user_{secrets.token_hex(4)}"
            break
    return candidate


@router.post(
    "/auth/google",
    response_model=StandardResponse[TokenResponse],
)
@router.post(
    "/google",
    response_model=StandardResponse[TokenResponse],
    include_in_schema=False,
)
async def google_login(
    body: GoogleLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[TokenResponse]:
    """
    Authenticate a user using Google Identity Services ID Token (JWT).
    
    1. Verifies the ID token against Google's public certificates.
    2. Checks if a user with this Google-verified email exists in PostgreSQL.
    3. If found, returns an application JWT.
    4. If not found, automatically creates a new User and returns an application JWT.
    """
    try:
        raw_token = body.get_token()
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    try:
        user_info = await verify_google_id_token(raw_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {e}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to authenticate with Google",
        )

    # 1. Lookup user by email in PostgreSQL
    user = await get_user_by_email(db, user_info["email"])

    if user is None:
        # 2. Auto-provision new user
        username = await _generate_unique_username(
            db, user_info["email"], user_info["display_name"]
        )
        # Random secure password fulfilling schema constraints
        random_password = f"{secrets.token_urlsafe(24)}!A1"
        user = await create_user(
            db,
            username=username,
            email=user_info["email"],
            password=random_password,
            display_name=user_info["display_name"],
            avatar_url=user_info.get("avatar_url"),
        )
    else:
        # Existing user: update avatar if empty and Google provided one
        if not user.avatar_url and user_info.get("avatar_url"):
            await update_user(db, user, avatar_url=user_info["avatar_url"])

    # 3. Issue application JWT token
    token = create_access_token(subject=str(user.id))

    return StandardResponse(
        success=True,
        data=TokenResponse(access_token=token),
        message="Google login successful",
    )


# --------------------------------------------------------------------------
# POST /logout
# --------------------------------------------------------------------------


@router.post(
    "/logout",
    response_model=StandardResponse[None],
)
async def logout(
    _current_user: User = Depends(get_current_user),
) -> StandardResponse[None]:
    """
    Stateless logout — the server acknowledges the request but does not
    maintain a token blacklist. The frontend is responsible for discarding
    the stored token.

    Rationale: A blacklist would require either a DB table or Redis,
    adding operational complexity that isn't justified at this stage.
    If token revocation becomes critical (e.g., compromised accounts),
    a short token expiry + refresh token rotation is a better approach.
    """
    return StandardResponse(
        success=True,
        data=None,
        message="Logged out successfully. Please discard the token on the client side.",
    )


# --------------------------------------------------------------------------
# POST /change-password
# --------------------------------------------------------------------------

@router.post(
    "/change-password",
    response_model=StandardResponse[None],
)
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[None]:
    # Verify old password
    if not verify_password(body.old_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # Prevent reusing the same password
    if body.old_password == body.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password",
        )

    await update_password(db, current_user, body.new_password)

    return StandardResponse(
        success=True,
        data=None,
        message="Password changed successfully",
    )
