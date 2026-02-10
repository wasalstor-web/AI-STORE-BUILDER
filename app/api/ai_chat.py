"""
AI Chat API — Unified AI-powered store building via chat.

Multi-provider AI chain:
  1. Anthropic Claude (primary)
  2. OpenAI GPT (fallback)
  3. Google Gemini (second fallback)
  4. Local modifications (offline fallback)

With Supabase integration for conversation storage.
"""

from typing import Annotated, Optional
import time
import logging

import httpx

from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.middleware.auth import CurrentUser
from app.middleware.rate_limit import limiter
from app.schemas.ai_chat import (
    AIChatRequest,
    AIChatResponse,
    AIConversationRequest,
    AIConversationResponse,
)

router = APIRouter()
settings = get_settings()
logger = logging.getLogger(__name__)


# ══════════════════════════════════════════════════════════
# Supabase Helper for Saving Conversations
# ══════════════════════════════════════════════════════════

async def _save_conversation_to_supabase(
    user_id: str,
    store_id: Optional[str],
    message: str,
    response: str,
    html_before: Optional[str] = None,
    html_after: Optional[str] = None,
    execution_time: Optional[float] = None,
):
    """Save AI conversation to Supabase for learning and analytics."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return  # Skip if Supabase not configured
    
    try:
        headers = {
            "apikey": settings.SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        }
        
        data = {
            "user_id": user_id,
            "messages": [
                {"role": "user", "content": message},
                {"role": "assistant", "content": response},
            ],
        }
        
        if store_id:
            data["project_id"] = store_id
        
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(
                f"{settings.SUPABASE_URL}/rest/v1/chat_history",
                headers=headers,
                json=data,
            )
    except Exception as e:
        # Non-blocking - just log the error
        print(f"⚠️ Supabase save error (non-critical): {e}")


CONVERSATION_SYSTEM_PROMPT = """أنت مساعد ذكي متخصص في بناء المتاجر الإلكترونية العربية. اسمك "مساعد المتجر الذكي".

## شخصيتك
- ودود، محترف، ومتحمس لمساعدة المستخدم
- تتحدث بالعربية بشكل طبيعي ومفهوم
- تستخدم إيموجي بشكل معتدل 😊
- ردودك مختصرة ومفيدة (2-4 جمل عادةً)

## مهمتك
1. تساعد المستخدم في تحديد رؤيته لمتجره الإلكتروني
2. تسأله عن تفضيلاته: الألوان، الستايل، نوع المنتجات، الفئة المستهدفة
3. تقترح أفكار وتحسينات
4. تشرح ما يمكنك فعله

## قواعد مهمة
- لا تولّد أي كود HTML أو CSS — فقط محادثة نصية
- عندما يكون المستخدم جاهزاً للتنفيذ، اقترح عليه يقول "نفّذ" أو "ابدأ البناء"
- لا تكتب ردود طويلة جداً — كن مختصراً ومركزاً
- إذا سأل سؤال تقني عن المتجر أجب بشكل واضح
- يمكنك اقتراح أقسام: هيرو، منتجات، عروض، تقييمات، فوتر، قسم عنّا، أسئلة شائعة

## معلومات المتجر
- اسم المتجر: {store_name}
- نوع المتجر: {store_type}

## أنواع المتاجر
- general: متجر عام
- fashion: أزياء وموضة
- electronics: إلكترونيات
- food: مأكولات ومطاعم
- beauty: تجميل وعناية
- home: أثاث ومنزل
- books: كتب ومكتبات
- sports: رياضة ولياقة"""


CHAT_SYSTEM_PROMPT = """أنت AI Store Builder Pro - عبقري تصميم المتاجر الإلكترونية العربية!

## مهمتك الأساسية
تحويل طلبات المستخدم إلى كود HTML/CSS كامل ومذهل لمتاجر إلكترونية احترافية.

## قواعد الإخراج الصارمة
1. أرجع HTML كامل فقط — من <!DOCTYPE html> إلى </html>
2. لا تضف أي شرح أو markdown — فقط كود HTML
3. ضع كل CSS داخل <style> في <head> — لا CSS خارجي
4. استخدم font-family: 'Tajawal', sans-serif للعربية 
5. أضف link لخط Tajawal من Google Fonts في <head>
6. كل التصميم يكون RTL (dir="rtl" lang="ar")
7. جميع الأقسام يجب أن تكون responsive (mobile-first)

## معايير التصميم
- استخدم CSS Variables للألوان: --primary, --secondary, --bg, --text
- استخدم gradients احترافية في Hero sections
- أضف hover effects وtransitions سلسة (transition: all 0.3s ease)
- استخدم box-shadow للبطاقات والعناصر المرفوعة
- تأكد من contrast جيد للقراءة (WCAG AA)
- استخدم emoji 🛍️ بطريقة عصرية للأيقونات

## الأقسام المتاحة
- Hero Banner: عنوان + وصف + CTA + gradient
- Products Grid: بطاقات منتجات مع صور وأسعار وbadges
- Categories: أقسام المتجر مع أيقونات
- Features: مزايا المتجر (توصيل، دفع، ضمان)
- Offers/Sales: عروض وتخفيضات مع countdown
- Newsletter: اشتراك بريدي
- Footer: معلومات + روابط + تواصل اجتماعي
- Testimonials: تقييمات العملاء
- FAQ: أسئلة شائعة

## عند تعديل كود موجود
- حافظ على البنية العامة ما لم يطلب المستخدم تغييرها بالكامل
- طبّق التعديل المطلوب فقط مع الحفاظ على باقي المحتوى
- لا تحذف أقسام لم يطلب المستخدم حذفها

## ملاحظات مهمة
- الأسعار بالريال السعودي (ر.س) افتراضياً
- اجعل الأزرار واضحة ومعبرة
- استخدم spacing متناسق (8px grid)"""


async def _call_anthropic_chat(current_html: str, user_message: str, api_key: str) -> str:
    """Call Anthropic Claude to modify the store HTML."""
    import anthropic

    client = anthropic.AsyncAnthropic(api_key=api_key)
    message = await client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=settings.AI_MAX_TOKENS,
        system=CHAT_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"الكود الحالي:\n```html\n{current_html}\n```\n\nطلب المستخدم: {user_message}\n\nأرجع HTML الكامل المعدّل فقط (بدون أي شرح أو markdown):",
            },
        ],
    )
    content = message.content[0].text
    return _clean_ai_response(content)


async def _call_openai_chat(current_html: str, user_message: str, api_key: str) -> str:
    """Call OpenAI GPT to modify the store HTML (first fallback)."""
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=api_key, timeout=90.0)
    response = await client.chat.completions.create(
        model=settings.GPT_MODEL,
        messages=[
            {"role": "system", "content": CHAT_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"الكود الحالي:\n```html\n{current_html}\n```\n\nطلب المستخدم: {user_message}\n\nأرجع HTML الكامل المعدّل فقط (بدون أي شرح أو markdown):",
            },
        ],
        temperature=settings.AI_TEMPERATURE,
        max_tokens=settings.AI_MAX_TOKENS,
    )
    content = response.choices[0].message.content or ""
    return _clean_ai_response(content)


async def _call_gemini_chat(current_html: str, user_message: str, api_key: str) -> str:
    """Call Google Gemini to modify the store HTML (second fallback)."""
    import google.generativeai as genai

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name=settings.GEMINI_MODEL,
        system_instruction=CHAT_SYSTEM_PROMPT,
    )

    prompt = f"الكود الحالي:\n```html\n{current_html}\n```\n\nطلب المستخدم: {user_message}\n\nأرجع HTML الكامل المعدّل فقط (بدون أي شرح أو markdown):"
    
    response = await model.generate_content_async(
        prompt,
        generation_config=genai.GenerationConfig(
            temperature=settings.AI_TEMPERATURE,
            max_output_tokens=settings.AI_MAX_TOKENS,
        ),
    )
    content = response.text or ""
    return _clean_ai_response(content)


def _clean_ai_response(content: str) -> str:
    """Remove markdown code fences from AI responses."""
    content = content.strip()
    if content.startswith("```"):
        lines = content.split("\n")
        # Remove first line (```html or ```)
        lines = lines[1:]
        # Remove last line if it's ```
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
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


# ══════════════════════════════════════════════════════════
# Conversation AI (chat without HTML generation)
# ══════════════════════════════════════════════════════════

async def _call_anthropic_conversation(
    messages: list[dict],
    system_prompt: str,
    api_key: str,
) -> str:
    """Call Anthropic Claude for conversation (no HTML)."""
    import anthropic

    client = anthropic.AsyncAnthropic(api_key=api_key)
    response = await client.messages.create(
        model=settings.CLAUDE_MODEL,
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
    )
    return response.content[0].text


async def _call_openai_conversation(
    messages: list[dict],
    system_prompt: str,
    api_key: str,
) -> str:
    """Call OpenAI for conversation (no HTML)."""
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=api_key, timeout=30.0)
    all_messages = [{"role": "system", "content": system_prompt}] + messages
    response = await client.chat.completions.create(
        model=settings.GPT_MODEL,
        messages=all_messages,
        temperature=0.8,
        max_tokens=1024,
    )
    return response.choices[0].message.content or ""


async def _call_gemini_conversation(
    messages: list[dict],
    system_prompt: str,
    api_key: str,
) -> str:
    """Call Gemini for conversation (no HTML)."""
    import google.generativeai as genai

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name=settings.GEMINI_MODEL,
        system_instruction=system_prompt,
    )

    # Convert messages to Gemini format
    history_text = "\n".join(
        f"{'المستخدم' if m['role'] == 'user' else 'المساعد'}: {m['content']}"
        for m in messages[:-1]
    )
    last_msg = messages[-1]["content"] if messages else ""
    prompt = f"{history_text}\nالمستخدم: {last_msg}" if history_text else last_msg

    response = await model.generate_content_async(
        prompt,
        generation_config=genai.GenerationConfig(temperature=0.8, max_output_tokens=1024),
    )
    return response.text or ""


def _get_conversation_suggestions(message: str, store_type: str) -> list[str]:
    """Return conversation suggestions based on context."""
    suggestions_map = {
        "fashion": [
            "أبي ألوان أنثوية مثل الوردي والذهبي",
            "أضف قسم أحدث الموديلات",
            "أبي قسم عروض مع خصومات",
            "نفّذ التصميم",
        ],
        "electronics": [
            "أبي تصميم تقني حديث بألوان زرقاء",
            "أضف قسم أكثر المنتجات مبيعاً",
            "أبي قسم مقارنة المنتجات",
            "نفّذ التصميم",
        ],
        "food": [
            "أبي ألوان دافئة تشهّي",
            "أضف قسم قائمة الطعام",
            "أبي قسم توصيل مع الأوقات",
            "نفّذ التصميم",
        ],
        "general": [
            "وش نوع المنتجات اللي تبي تبيعها؟",
            "أبي تصميم فاخر وأنيق",
            "أضف قسم عروض وتخفيضات",
            "نفّذ التصميم",
        ],
    }
    base = suggestions_map.get(store_type, suggestions_map["general"])
    msg_lower = message.lower()
    return [s for s in base if not any(word in msg_lower for word in s.split()[:2])][:4]


@router.post("/conversation", response_model=AIConversationResponse)
@limiter.limit("20/minute")
async def ai_conversation(
    request: Request,
    body: AIConversationRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Conversational AI endpoint — chat about the store without generating HTML."""
    start_time = time.time()

    system_prompt = CONVERSATION_SYSTEM_PROMPT.format(
        store_name=body.store_name,
        store_type=body.store_type,
    )

    # Build messages list (keep last 20 messages for context)
    messages = []
    for msg in body.conversation_history[-20:]:
        role = msg.get("role", "user")
        if role == "ai":
            role = "assistant"
        if role in ("user", "assistant"):
            messages.append({"role": role, "content": msg.get("content", "")})
    messages.append({"role": "user", "content": body.message})

    reply = ""
    anthropic_key = settings.ANTHROPIC_API_KEY
    openai_key = settings.OPENAI_API_KEY
    google_key = settings.GOOGLE_API_KEY

    # Try providers in order
    if anthropic_key:
        try:
            reply = await _call_anthropic_conversation(messages, system_prompt, anthropic_key)
        except Exception as e:
            logger.warning(f"Anthropic conversation error: {e}")

    if not reply and openai_key:
        try:
            reply = await _call_openai_conversation(messages, system_prompt, openai_key)
        except Exception as e:
            logger.warning(f"OpenAI conversation error: {e}")

    if not reply and google_key:
        try:
            reply = await _call_gemini_conversation(messages, system_prompt, google_key)
        except Exception as e:
            logger.warning(f"Gemini conversation error: {e}")

    if not reply:
        reply = (
            f"مرحباً! 👋 أنا مساعدك لبناء متجر \"{body.store_name}\".\n\n"
            "أخبرني عن رؤيتك للمتجر — الألوان، الستايل، نوع المنتجات — "
            "وبعدين قول \"نفّذ\" وأنا أبنيه لك! 🚀"
        )

    execution_time = round(time.time() - start_time, 2)

    # Save to Supabase
    try:
        await _save_conversation_to_supabase(
            user_id=str(current_user.id),
            store_id=None,
            message=body.message,
            response=reply,
            execution_time=execution_time,
        )
    except Exception:
        pass

    return AIConversationResponse(
        reply=reply,
        suggestions=_get_conversation_suggestions(body.message, body.store_type),
        should_execute=False,
        execution_time=execution_time,
    )


@router.post("/chat", response_model=AIChatResponse)
@limiter.limit("10/minute")
async def ai_chat(
    request: Request,
    body: AIChatRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Process an AI chat message and return updated store HTML."""
    start_time = time.time()
    
    anthropic_key = settings.ANTHROPIC_API_KEY
    openai_key = settings.OPENAI_API_KEY
    google_key = settings.GOOGLE_API_KEY
    new_html = ""
    response_message = ""
    provider_used = "local"

    # Priority 1: Anthropic Claude (primary)
    if anthropic_key and not new_html:
        try:
            new_html = await _call_anthropic_chat(
                body.current_html, body.message, anthropic_key,
            )
            response_message = f"✅ Claude: تم تطبيق '{body.message}' بذكاء"
            provider_used = "anthropic"
        except Exception as e:
            logger.warning(f"Anthropic error: {e}")

    # Priority 2: OpenAI GPT (first fallback)
    if not new_html and openai_key:
        try:
            new_html = await _call_openai_chat(
                body.current_html, body.message, openai_key,
            )
            response_message = f"✅ GPT: تم تطبيق '{body.message}'"
            provider_used = "openai"
        except Exception as e:
            logger.warning(f"OpenAI error: {e}")

    # Priority 3: Google Gemini (second fallback)
    if not new_html and google_key:
        try:
            new_html = await _call_gemini_chat(
                body.current_html, body.message, google_key,
            )
            response_message = f"✅ Gemini: تم تطبيق '{body.message}'"
            provider_used = "google"
        except Exception as e:
            logger.warning(f"Gemini error: {e}")

    # Priority 4: Local modifications (offline fallback)
    if not new_html:
        new_html, description = _apply_local_modifications(
            body.current_html, body.message,
        )
        response_message = f"{description} ✅"
        provider_used = "local"
    
    execution_time = round(time.time() - start_time, 2)
    
    # Save conversation to Supabase (async, non-blocking)
    try:
        await _save_conversation_to_supabase(
            user_id=str(current_user.id),
            store_id=body.store_id,
            message=body.message,
            response=response_message,
            html_before=body.current_html[:500] if body.current_html else None,
            html_after=new_html[:500] if new_html else None,
            execution_time=execution_time,
        )
    except Exception as e:
        logger.debug(f"Supabase save skipped: {e}")
    
    return AIChatResponse(
        html=new_html,
        message=response_message,
        suggestions=_get_suggestions(body.message),
        execution_time=execution_time,
    )


def _get_suggestions(last_message: str) -> list[str]:
    """Return context-aware suggestions based on the last message."""
    suggestions = [
        "غيّر الألوان لأخضر",
        "أضف قسم عروض",
        "خلّه وضع داكن",
        "أضف منتجات أكثر",
        "حسّن البانر الرئيسي",
    ]
    # Filter out suggestions similar to what was just asked
    msg_lower = last_message.lower()
    return [s for s in suggestions if not any(word in msg_lower for word in s.split()[:2])][:3]


# ═══════ اختبار AI بدون مصادقة (للتطوير) ═══════
@router.post("/test", response_model=AIChatResponse)
async def ai_chat_test_endpoint(
    request: Request,
    req: AIChatRequest,
) -> AIChatResponse:
    """اختبار AI Chat بدون مصادقة — مفيد للتطوير والاختبار."""
    start_time = time.time()
    
    api_key = settings.ANTHROPIC_API_KEY
    
    if not api_key:
        # Try OpenAI
        if settings.OPENAI_API_KEY:
            try:
                html = await _call_openai_chat(req.current_html, req.message, settings.OPENAI_API_KEY)
                return AIChatResponse(
                    html=html,
                    message="✅ GPT: تم تعديل المتجر",
                    execution_time=round(time.time() - start_time, 2),
                )
            except Exception:
                pass
        
        # Try Gemini
        if settings.GOOGLE_API_KEY:
            try:
                html = await _call_gemini_chat(req.current_html, req.message, settings.GOOGLE_API_KEY)
                return AIChatResponse(
                    html=html,
                    message="✅ Gemini: تم تعديل المتجر",
                    execution_time=round(time.time() - start_time, 2),
                )
            except Exception:
                pass
        
        # Local fallback
        modified_html, message = _apply_local_modifications(req.current_html, req.message)
        return AIChatResponse(
            html=modified_html,
            message=f"✅ تعديلات محلية: {message}",
            execution_time=round(time.time() - start_time, 2),
        )
    
    try:
        enhanced_html = await _call_anthropic_chat(
            current_html=req.current_html,
            user_message=req.message,
            api_key=api_key,
        )
        
        return AIChatResponse(
            html=enhanced_html,
            message="🎨 Claude عدّل متجرك بذكاء! شوف النتيجة 👈",
            execution_time=round(time.time() - start_time, 2),
        )
    except Exception as e:
        logger.error(f"Claude API error in test: {type(e).__name__}: {e}")
        modified_html, message = _apply_local_modifications(req.current_html, req.message)
        return AIChatResponse(
            html=modified_html,
            message=f"⚠️ نظام محلي: {message}",
            execution_time=round(time.time() - start_time, 2),
        )
