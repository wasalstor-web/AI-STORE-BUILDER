"""Auth schemas — registration, login, tokens."""

import uuid
from pydantic import BaseModel, EmailStr, Field


# ── Request ──
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="كلمة المرور")
    full_name: str = Field(..., min_length=2, max_length=255, description="الاسم الكامل")
    tenant_name: str = Field(..., min_length=2, max_length=255, description="اسم المنظمة/الشركة")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class RefreshRequest(BaseModel):
    refresh_token: str


# ── Response ──
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="ثواني حتى انتهاء الصلاحية")


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: str
    tenant_id: uuid.UUID
    is_active: bool

    model_config = {"from_attributes": True}
