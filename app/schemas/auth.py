"""Auth schemas — registration, login, tokens."""

import uuid

from pydantic import BaseModel, EmailStr, Field, field_validator


# ── Request ──
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128, description="كلمة المرور")
    full_name: str = Field(..., min_length=2, max_length=255, description="الاسم الكامل")
    tenant_name: str = Field(..., min_length=2, max_length=255, description="اسم المنظمة/الشركة")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
        if not any(c.isdigit() for c in v):
            raise ValueError("كلمة المرور يجب أن تحتوي على رقم واحد على الأقل")
        if not any(c.isalpha() for c in v):
            raise ValueError("كلمة المرور يجب أن تحتوي على حرف واحد على الأقل")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class RefreshRequest(BaseModel):
    refresh_token: str


class UpdateProfileRequest(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=255, description="الاسم الكامل")
    current_password: str | None = Field(None, min_length=1, description="كلمة المرور الحالية")
    new_password: str | None = Field(None, min_length=8, max_length=128, description="كلمة المرور الجديدة")


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
