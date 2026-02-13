"""Auth endpoints — register, login, refresh, me, email verification, password reset."""

import secrets
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.middleware.auth import CurrentUser
from app.middleware.rate_limit import limiter
from app.models.user import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshRequest,
    RegisterRequest,
    ResendVerificationRequest,
    ResetPasswordRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserResponse,
    VerifyEmailRequest,
)
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_user_by_id,
    register_user,
)
from app.services.email_service import (
    send_password_reset_email,
    send_verification_email,
    send_welcome_email,
)

router = APIRouter()
settings = get_settings()


def _generate_code() -> str:
    """Generate a 6-digit verification code."""
    return f"{secrets.randbelow(900000) + 100000}"


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="تسجيل حساب جديد",
)
@limiter.limit("3/minute")
async def register(
    request: Request,
    body: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # Check if email exists
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="البريد الإلكتروني مسجل مسبقاً",
        )

    user, tenant = await register_user(
        db=db,
        email=body.email,
        password=body.password,
        full_name=body.full_name,
        tenant_name=body.tenant_name,
    )

    # Generate verification code
    code = _generate_code()
    user.verification_token = code
    user.verification_token_expires = datetime.now(UTC) + timedelta(hours=24)

    await db.commit()

    # Send verification email (non-blocking — don't fail registration if email fails)
    try:
        await send_verification_email(body.email, body.full_name, code)
    except Exception:
        pass  # Email failure shouldn't block registration

    token_data = {"sub": str(user.id), "tenant_id": str(tenant.id), "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/login", response_model=TokenResponse, summary="تسجيل الدخول")
@limiter.limit("5/minute")
async def login(
    request: Request,
    body: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user = await authenticate_user(db, body.email, body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="البريد الإلكتروني أو كلمة المرور غير صحيحة",
        )

    token_data = {"sub": str(user.id), "tenant_id": str(user.tenant_id), "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse, summary="تجديد الرمز")
async def refresh(
    body: RefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="رمز التجديد غير صالح أو منتهي",
        )

    user = await get_user_by_id(db, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="المستخدم غير موجود")

    token_data = {"sub": str(user.id), "tenant_id": str(user.tenant_id), "role": user.role}
    access_token = create_access_token(token_data)
    new_refresh = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=UserResponse, summary="بيانات المستخدم الحالي")
async def me(current_user: CurrentUser):
    return current_user


@router.patch("/me", response_model=UserResponse, summary="تحديث الملف الشخصي")
async def update_profile(
    body: UpdateProfileRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    from app.services.auth_service import hash_password, verify_password

    user = await get_user_by_id(db, str(current_user.id))
    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")

    if body.full_name is not None:
        user.full_name = body.full_name

    if body.new_password:
        if not body.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="يجب إدخال كلمة المرور الحالية",
            )
        if not verify_password(body.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="كلمة المرور الحالية غير صحيحة",
            )
        user.hashed_password = hash_password(body.new_password)

    await db.commit()
    await db.refresh(user)
    return user


# ══════════════════════════════════════════════════════════
#  Email Verification
# ══════════════════════════════════════════════════════════


@router.post("/verify-email", response_model=MessageResponse, summary="تأكيد البريد الإلكتروني")
@limiter.limit("10/minute")
async def verify_email(
    request: Request,
    body: VerifyEmailRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="المستخدم غير موجود")

    if user.email_verified:
        return MessageResponse(message="البريد الإلكتروني مؤكد مسبقاً")

    if not user.verification_token or user.verification_token != body.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="رمز التحقق غير صحيح",
        )

    if user.verification_token_expires and user.verification_token_expires < datetime.now(UTC):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="رمز التحقق منتهي الصلاحية. أعد إرسال رمز جديد.",
        )

    user.email_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    await db.commit()

    # Send welcome email
    try:
        await send_welcome_email(user.email, user.full_name)
    except Exception:
        pass

    return MessageResponse(message="تم تأكيد البريد الإلكتروني بنجاح! 🎉")


@router.post("/resend-verification", response_model=MessageResponse, summary="إعادة إرسال رمز التحقق")
@limiter.limit("3/minute")
async def resend_verification(
    request: Request,
    body: ResendVerificationRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user:
        # Don't reveal if email exists
        return MessageResponse(message="إذا كان البريد مسجلاً، سيتم إرسال رمز التحقق")

    if user.email_verified:
        return MessageResponse(message="البريد الإلكتروني مؤكد مسبقاً")

    code = _generate_code()
    user.verification_token = code
    user.verification_token_expires = datetime.now(UTC) + timedelta(hours=24)
    await db.commit()

    await send_verification_email(user.email, user.full_name, code)

    return MessageResponse(message="تم إرسال رمز التحقق إلى بريدك الإلكتروني")


# ══════════════════════════════════════════════════════════
#  Password Reset
# ══════════════════════════════════════════════════════════


@router.post("/forgot-password", response_model=MessageResponse, summary="نسيت كلمة المرور")
@limiter.limit("3/minute")
async def forgot_password(
    request: Request,
    body: ForgotPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(User).where(User.email == body.email, User.is_active.is_(True)))
    user = result.scalar_one_or_none()

    if not user:
        # Don't reveal if email exists — always return success
        return MessageResponse(message="إذا كان البريد مسجلاً، سيتم إرسال رمز إعادة التعيين")

    code = _generate_code()
    user.reset_token = code
    user.reset_token_expires = datetime.now(UTC) + timedelta(hours=1)
    await db.commit()

    await send_password_reset_email(user.email, user.full_name, code)

    return MessageResponse(message="تم إرسال رمز إعادة التعيين إلى بريدك الإلكتروني")


@router.post("/reset-password", response_model=MessageResponse, summary="إعادة تعيين كلمة المرور")
@limiter.limit("5/minute")
async def reset_password(
    request: Request,
    body: ResetPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    from app.services.auth_service import hash_password

    result = await db.execute(select(User).where(User.email == body.email, User.is_active.is_(True)))
    user = result.scalar_one_or_none()

    if not user or not user.reset_token or user.reset_token != body.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="رمز إعادة التعيين غير صحيح",
        )

    if user.reset_token_expires and user.reset_token_expires < datetime.now(UTC):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="رمز إعادة التعيين منتهي الصلاحية",
        )

    user.hashed_password = hash_password(body.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    await db.commit()

    return MessageResponse(message="تم تغيير كلمة المرور بنجاح! يمكنك تسجيل الدخول الآن.")
