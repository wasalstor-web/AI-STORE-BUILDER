"""
Auth Service — JWT token creation/verification + password hashing.
"""

import uuid
from datetime import UTC, datetime, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext
from slugify import slugify
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.base import generate_uuid7
from app.models.tenant import Tenant
from app.models.user import User

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _truncate_password(password: str) -> str:
    """Bcrypt supports max 72 bytes — truncate safely."""
    return password.encode("utf-8")[:72].decode("utf-8", errors="ignore")


def hash_password(password: str) -> str:
    return pwd_context.hash(_truncate_password(password))


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(_truncate_password(plain), hashed)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + (
        expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


async def register_user(
    db: AsyncSession,
    email: str,
    password: str,
    full_name: str,
    tenant_name: str,
) -> tuple[User, Tenant]:
    """Create a new tenant + owner user. Returns (user, tenant)."""
    # Create tenant
    tenant = Tenant(
        id=generate_uuid7(),
        name=tenant_name,
        slug=slugify(tenant_name),
        plan="free",
    )
    db.add(tenant)
    await db.flush()

    # Create owner user
    user = User(
        id=generate_uuid7(),
        tenant_id=tenant.id,
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
        role="owner",
    )
    db.add(user)
    await db.flush()

    return user, tenant


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    """Verify email/password, return User or None."""
    result = await db.execute(select(User).where(User.email == email, User.is_active.is_(True)))
    user = result.scalar_one_or_none()
    if user and verify_password(password, user.hashed_password):
        return user
    return None


async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    # Convert string UUID from JWT to proper uuid.UUID for SQLAlchemy query
    try:
        uid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
    except (ValueError, AttributeError):
        return None
    result = await db.execute(select(User).where(User.id == uid))
    return result.scalar_one_or_none()
