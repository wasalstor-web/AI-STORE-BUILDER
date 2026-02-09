"""
AI Chat API — Real-time AI-powered store building via chat.
Enhanced with advanced AI capabilities.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.middleware.auth import CurrentUser
from app.middleware.rate_limit import limiter

router = APIRouter()
settings = get_settings()


class AIChatRequest(BaseModel):
    message: str
    current_html: str
    store_name: str = "متجري"
    store_type: str = "general"


class AIChatResponse(BaseModel):
    html: str
    message: str


CHAT_SYSTEM_PROMPT = """أنت AI Store Builder Pro - وكيل ذكي متخصص في تصميم المتاجر الإلكترونية الاحترافية.

🎯 دورك الأساسي:
- فهم رغبات المستخدم بعمق وتحليل طلباته بذكاء
- تقديم اقتراحات إبداعية لتحسين المتجر
- تطبيق أفضل ممارسات UX/UI التجارية
- إنشاء تجربة تسوق استثنائية تزيد التحويلات

💡 مهاراتك المتقدمة:
1. **فهم السياق**: تحلل نوع المتجر والجمهور المستهدف وتصمم بناءً عليه
2. **التصميم الذكي**: تختار الألوان والأيقونات وتدرجات الألوان بشكل احترافي
3. **التفاعلية**: تضيف hover effects وانيميشن CSS سلسة
4. **التحسين**: تحسن SEO والأداء والوصولية
5. **الإبداع**: تقترح badges، countdown timers، reviews، تقييمات

⚡ قدرات خاصة:
- أقسام ديناميكية: testimonials، تقييمات، معرض صور، مدونة
- badges احترافية: "جديد"، "الأكثر مبيعاً"، "خصم 30%"، "نفذت الكمية"
- gradients وألوان متناسقة حسب علم النفس اللوني
- مبادئ التسويق: scarcity، urgency، social proof
- الوضع الداكن الفاخر مع تباينات مثالية

🎨 معايير التصميم:
- نظام ألوان احترافي (primary، secondary، accent)
- spacing متناسق (8px grid system)
- shadows وdepth للعناصر المهمة
- typography hierarchy واضح
- كل عنصر يخدم هدف تجاري

📱 Responsive Design:
- Mobile-first approach
- Breakpoints: 480px، 768px، 1024px
- Touch-friendly buttons (min 44px)
- Optimized images وperformance

🔒 قواعد إلزامية:
- أرجع HTML كامل فقط (من <!DOCTYPE html> إلى </html>)
- بدون markdown أو شرح أو ```
- RTL والعربية دائماً
- خط Tajawal من Google Fonts
- CSS inline في <style> داخل <head>
- لا JavaScript خارجي
- حافظ على البنية وحسّنها بذكاء

🚀 كن مبدعاً ومحترفاً ودائماً اقترح تحسينات غير متوقعة!"""


async def _call_anthropic_chat(current_html: str, user_message: str, api_key: str) -> str:
    """Call Anthropic Claude to modify the store HTML based on the user's message."""
    import anthropic

    client = anthropic.AsyncAnthropic(api_key=api_key)
    message = await client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8000,
        system=CHAT_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"الكود الحالي:\n{current_html}\n\nطلب المستخدم: {user_message}\n\nأرجع HTML الكامل المعدّل:",
            },
        ],
    )
    content = message.content[0].text

    # Clean up — remove markdown wrapping if present
    if content.startswith("```"):
        lines = content.split("\n")
        lines = [line for line in lines if not line.strip().startswith("```")]
        content = "\n".join(lines)

    return content.strip()


async def _call_openai_chat(current_html: str, user_message: str, api_key: str) -> str:
    """Call OpenAI to modify the store HTML based on the user's message (fallback)."""
    import httpx

    async with httpx.AsyncClient(timeout=90.0) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": CHAT_SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": f"الكود الحالي:\n{current_html}\n\nطلب المستخدم: {user_message}\n\nأرجع HTML الكامل المعدّل:",
                    },
                ],
                "temperature": 0.5,
                "max_tokens": 8000,
            },
        )
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"]

        # Clean up — remove markdown wrapping if present
        if content.startswith("```"):
            lines = content.split("\n")
            lines = [line for line in lines if not line.strip().startswith("```")]
            content = "\n".join(lines)

        return content.strip()


def _apply_local_modifications(current_html: str, message: str) -> tuple[str, str]:
    """Apply basic color/text modifications locally when no API key is available."""
    html = current_html
    changes: list[str] = []

    color_map = {
        "أخضر": ("#00b894", "#00a085"),
        "أحمر": ("#e74c3c", "#c0392b"),
        "أزرق": ("#0984e3", "#0652DD"),
        "ذهبي": ("#d4af37", "#b8960c"),
        "برتقالي": ("#e17055", "#d63031"),
        "وردي": ("#fd79a8", "#e84393"),
        "بنفسجي": ("#6c5ce7", "#4834d4"),
        "أسود": ("#2d3436", "#1e272e"),
        "كحلي": ("#2c3e50", "#1a252f"),
    }

    for color_name, (primary, dark) in color_map.items():
        if color_name in message:
            html = html.replace("#6c5ce7", primary).replace("#4834d4", dark)
            changes.append(f"تم تغيير اللون إلى {color_name}")
            break

    if "فاخر" in message or "luxury" in message.lower():
        html = html.replace("background: #fafafa", "background: #0a0a1a")
        html = html.replace("color: #1a1a2e", "color: #f0e6d2")
        html = html.replace("background: white", "background: #1a1a2e")
        html = html.replace("background: #f8f8fc", "background: #0d0d20")
        html = html.replace("#6c5ce7", "#d4af37").replace("#4834d4", "#1a0a2e")
        changes.append("تم تحويل التصميم لستايل فاخر")

    if "داكن" in message or "dark" in message.lower():
        html = html.replace("background: #fafafa", "background: #0f0f23")
        html = html.replace("color: #1a1a2e", "color: #e0e0e0")
        html = html.replace("background: white", "background: #1a1a3e")
        html = html.replace("background: #f8f8fc", "background: #16163a")
        html = html.replace("color: #444", "color: #ccc")
        html = html.replace("color: #666", "color: #999")
        html = html.replace("border-bottom: 1px solid #eee", "border-bottom: 1px solid #333")
        changes.append("تم تفعيل الوضع الداكن")

    if "6 منتجات" in message or "منتجات أكثر" in message or "أضف منتجات" in message:
        extra_products = """
      <div class="product-card"><div class="product-img">🎁</div><div class="info"><div class="name">منتج حصري 5</div><div class="price">299 ر.س</div></div></div>
      <div class="product-card"><div class="product-img">🛍️</div><div class="info"><div class="name">منتج مميز 6</div><div class="price">349 ر.س</div></div></div>"""
        html = html.replace(
            '</div>\n  </div>\n  <div class="features">',
            f'{extra_products}\n    </div>\n  </div>\n  <div class="features">',
        )
        changes.append("تم إضافة منتجات جديدة")

    if "عروض" in message or "تخفيضات" in message:
        offers_section = """
  <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); padding: 40px 24px; text-align: center; color: white;">
    <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 8px;">🔥 عروض حصرية</h2>
    <p style="font-size: 1.1rem; opacity: 0.9; margin-bottom: 16px;">خصومات تصل إلى 50% على منتجات مختارة</p>
    <button style="background: white; color: #e74c3c; border: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; font-family: 'Tajawal', sans-serif;">تسوق العروض</button>
  </div>"""
        html = html.replace(
            '<div class="features">', f'{offers_section}\n  <div class="features">'
        )
        changes.append("تم إضافة قسم العروض")

    if "بانر" in message:
        html = html.replace(
            "padding: 80px 24px",
            "padding: 100px 24px; background-size: cover; background-position: center",
        )
        html = html.replace(
            "font-size: 2.5rem", "font-size: 3rem; text-shadow: 2px 2px 8px rgba(0,0,0,0.3)"
        )
        changes.append("تم تحسين البانر الرئيسي")

    if not changes:
        changes.append("تم تطبيق التعديلات")

    return html, " — ".join(changes)


@router.post("/chat", response_model=AIChatResponse)
@limiter.limit("10/minute")
async def ai_chat(
    request: Request,
    body: AIChatRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Process an AI chat message and return updated store HTML."""
    anthropic_key = settings.ANTHROPIC_API_KEY
    openai_key = settings.OPENAI_API_KEY

    # Priority 1: Anthropic Claude (primary)
    if anthropic_key:
        try:
            new_html = await _call_anthropic_chat(
                body.current_html,
                body.message,
                anthropic_key,
            )
            return AIChatResponse(
                html=new_html,
                message=f"✅ Claude Pro: تم تطبيق '{body.message}' بذكاء",
            )
        except Exception as e:
            print(f"⚠️ Anthropic chat error: {e}")

    # Priority 2: OpenAI (fallback)
    if openai_key:
        try:
            new_html = await _call_openai_chat(
                body.current_html,
                body.message,
                openai_key,
            )
            return AIChatResponse(
                html=new_html,
                message=f"✅ تم تطبيق: {body.message}",
            )
        except Exception as e:
            print(f"⚠️ OpenAI chat error: {e}")

    # Priority 3: Local modifications (offline fallback)
    new_html, description = _apply_local_modifications(
        body.current_html,
        body.message,
    )
    return AIChatResponse(
        html=new_html,
        message=f"{description} ✅",
    )
