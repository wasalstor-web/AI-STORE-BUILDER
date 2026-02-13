"""
Email Service — Send transactional emails.

Supports multiple providers:
  1. Resend API (recommended for production)
  2. SMTP (Gmail, Outlook, etc.)
  3. Console (development fallback — prints to console)
"""

import logging
from typing import Literal

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


# ═══════════════════════════════════════════════════════════
#  Arabic RTL Email Templates
# ═══════════════════════════════════════════════════════════

_BASE_STYLE = """
<style>
    body { margin: 0; padding: 0; background: #0a0b10; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
    .container { max-width: 560px; margin: 40px auto; background: #13141b; border-radius: 16px; border: 1px solid rgba(124, 58, 237, 0.2); overflow: hidden; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%); padding: 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 22px; margin: 0; }
    .body { padding: 32px; color: #e2e8f0; line-height: 1.8; direction: rtl; text-align: right; }
    .body p { margin: 0 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #3b82f6); color: #fff !important; text-decoration: none; padding: 14px 40px; border-radius: 10px; font-weight: 700; font-size: 16px; margin: 24px 0; }
    .code-box { background: #1e1f2e; border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0; }
    .code { font-size: 32px; font-weight: 800; color: #a78bfa; letter-spacing: 8px; font-family: 'Courier New', monospace; }
    .footer { padding: 20px 32px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.05); }
    .footer a { color: #7c3aed; text-decoration: none; }
</style>
"""


def _wrap_template(content: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">{_BASE_STYLE}</head>
<body>
<div class="container">
    <div class="header"><h1>⚡ ويب فلو</h1></div>
    <div class="body">{content}</div>
    <div class="footer">
        &copy; 2026 ويب فلو — منشئ المتاجر بالذكاء الاصطناعي<br>
        <a href="https://webflow.sa">webflow.sa</a>
    </div>
</div>
</body>
</html>"""


def _verification_email(full_name: str, code: str) -> tuple[str, str]:
    """Return (subject, html_body) for email verification."""
    subject = "تأكيد بريدك الإلكتروني — ويب فلو"
    html = _wrap_template(f"""
        <p>مرحباً {full_name}! 👋</p>
        <p>شكراً لتسجيلك في <strong>ويب فلو</strong>. استخدم الرمز التالي لتأكيد بريدك الإلكتروني:</p>
        <div class="code-box">
            <div class="code">{code}</div>
        </div>
        <p>الرمز صالح لمدة <strong>24 ساعة</strong>.</p>
        <p style="color: #94a3b8; font-size: 13px;">إذا لم تقم بإنشاء حساب، تجاهل هذا البريد.</p>
    """)
    return subject, html


def _password_reset_email(full_name: str, code: str) -> tuple[str, str]:
    """Return (subject, html_body) for password reset."""
    subject = "إعادة تعيين كلمة المرور — ويب فلو"
    html = _wrap_template(f"""
        <p>مرحباً {full_name}،</p>
        <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. استخدم الرمز التالي:</p>
        <div class="code-box">
            <div class="code">{code}</div>
        </div>
        <p>الرمز صالح لمدة <strong>ساعة واحدة</strong> فقط.</p>
        <p style="color: #94a3b8; font-size: 13px;">إذا لم تطلب إعادة التعيين، تجاهل هذا البريد وكلمة المرور لن تتغير.</p>
    """)
    return subject, html


def _welcome_email(full_name: str) -> tuple[str, str]:
    """Return (subject, html_body) for welcome after verification."""
    subject = "مرحباً بك في ويب فلو! 🎉"
    html = _wrap_template(f"""
        <p>مرحباً {full_name}! 🎉</p>
        <p>تم تأكيد حسابك بنجاح! أنت الآن جاهز لبناء متجرك الإلكتروني بالذكاء الاصطناعي.</p>
        <p><strong>ماذا يمكنك فعله الآن؟</strong></p>
        <ul style="padding-right: 20px;">
            <li>🏪 أنشئ متجرك الأول بضغطة زر</li>
            <li>🤖 استخدم الذكاء الاصطناعي لتصميم متجرك</li>
            <li>📦 أضف منتجاتك وابدأ البيع</li>
        </ul>
        <p style="text-align: center;">
            <a href="{settings.FRONTEND_URL}/dashboard" class="btn">ابدأ الآن ←</a>
        </p>
    """)
    return subject, html


# ═══════════════════════════════════════════════════════════
#  Email Sending (Multi-Provider)
# ═══════════════════════════════════════════════════════════

async def _send_via_resend(to: str, subject: str, html: str) -> bool:
    """Send email via Resend API."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM_ADDRESS}>",
                    "to": [to],
                    "subject": subject,
                    "html": html,
                },
            )
            if resp.status_code in (200, 201):
                logger.info(f"[EMAIL] Sent to {to} via Resend: {subject}")
                return True
            logger.error(f"[EMAIL] Resend error {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        logger.error(f"[EMAIL] Resend exception: {e}")
        return False


async def _send_via_smtp(to: str, subject: str, html: str) -> bool:
    """Send email via SMTP (aiosmtplib)."""
    try:
        import aiosmtplib
        from email.mime.multipart import MIMEMultipart
        from email.mime.text import MIMEText

        msg = MIMEMultipart("alternative")
        msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM_ADDRESS}>"
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(html, "html", "utf-8"))

        await aiosmtplib.send(
            msg,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=settings.SMTP_PORT == 465,
            start_tls=settings.SMTP_PORT == 587,
        )
        logger.info(f"[EMAIL] Sent to {to} via SMTP: {subject}")
        return True
    except Exception as e:
        logger.error(f"[EMAIL] SMTP exception: {e}")
        return False


async def _send_via_console(to: str, subject: str, html: str) -> bool:
    """Development fallback — log email to console."""
    print(f"\n{'='*60}")
    print(f"📧 EMAIL (console mode)")
    print(f"   To:      {to}")
    print(f"   Subject: {subject}")
    print(f"   Length:  {len(html)} chars")
    print(f"{'='*60}\n")
    logger.info(f"[EMAIL] Console: {to} — {subject}")
    return True


async def send_email(to: str, subject: str, html: str) -> bool:
    """Send email using the configured provider."""
    provider = settings.EMAIL_PROVIDER

    if provider == "resend" and settings.RESEND_API_KEY:
        return await _send_via_resend(to, subject, html)
    elif provider == "smtp" and settings.SMTP_HOST:
        return await _send_via_smtp(to, subject, html)
    else:
        return await _send_via_console(to, subject, html)


# ═══════════════════════════════════════════════════════════
#  Public API — High-Level Functions
# ═══════════════════════════════════════════════════════════

async def send_verification_email(email: str, full_name: str, code: str) -> bool:
    """Send the 6-digit verification code email."""
    subject, html = _verification_email(full_name, code)
    return await send_email(email, subject, html)


async def send_password_reset_email(email: str, full_name: str, code: str) -> bool:
    """Send the 6-digit password reset code email."""
    subject, html = _password_reset_email(full_name, code)
    return await send_email(email, subject, html)


async def send_welcome_email(email: str, full_name: str) -> bool:
    """Send welcome email after verification."""
    subject, html = _welcome_email(full_name)
    return await send_email(email, subject, html)
