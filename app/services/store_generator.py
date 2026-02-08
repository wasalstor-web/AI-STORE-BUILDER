"""
Store Generator Service — AI-powered store generation.
Uses OpenAI GPT for generating store structure, content, and layout.
Falls back to template-based generation when no API key is configured.
"""

import asyncio
import json
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.store import Store
from app.models.job import Job
from app.models.base import generate_uuid7
from app.config import get_settings
from slugify import slugify


async def create_store_and_job(
    db: AsyncSession,
    tenant_id,
    request_data: dict,
) -> tuple[Store, Job]:
    """Create a store (pending) + a job (queued), return both."""
    # Generate unique slug
    base_slug = slugify(request_data["name"])
    slug = base_slug
    counter = 1
    while True:
        from sqlalchemy import select as sa_select
        existing = await db.execute(
            sa_select(Store.id).where(Store.slug == slug, Store.tenant_id == tenant_id)
        )
        if not existing.scalar_one_or_none():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1

    store = Store(
        id=generate_uuid7(),
        tenant_id=tenant_id,
        name=request_data["name"],
        slug=slug,
        store_type=request_data["store_type"],
        language=request_data.get("language", "ar"),
        config={
            "branding": request_data.get("branding", {}),
            "payment": request_data.get("payment", {}),
            "shipping": request_data.get("shipping", {}),
            "features": request_data.get("features", []),
        },
        status="pending",
    )
    db.add(store)
    await db.flush()

    job = Job(
        id=generate_uuid7(),
        tenant_id=tenant_id,
        store_id=store.id,
        type="store_generation",
        status="queued",
        progress=0,
    )
    db.add(job)
    await db.flush()

    return store, job


# ─── AI Content Generation ───────────────────────────────────────

STORE_TYPE_LABELS = {
    "fashion": "أزياء وملابس",
    "electronics": "إلكترونيات وأجهزة",
    "beauty": "عطور وتجميل",
    "food": "أغذية ومشروبات",
    "general": "متجر عام",
}

SYSTEM_PROMPT = """أنت خبير في بناء المتاجر الإلكترونية. مهمتك إنشاء محتوى كامل لمتجر إلكتروني.
أجب بصيغة JSON فقط بدون أي نص إضافي. التزم بالهيكل المطلوب بالضبط."""


def _build_generation_prompt(config: dict, store_name: str, store_type: str, language: str) -> str:
    """Build the prompt for the AI model."""
    type_label = STORE_TYPE_LABELS.get(store_type, store_type)
    lang_label = "العربية" if language == "ar" else "الإنجليزية" if language == "en" else "العربية والإنجليزية"
    style = config.get("branding", {}).get("style", "modern")

    return f"""أنشئ محتوى متجر إلكتروني بالتفاصيل التالية:
- اسم المتجر: {store_name}
- نوع المتجر: {type_label}  
- اللغة: {lang_label}
- أسلوب التصميم: {style}

أجب بـ JSON يحتوي على:
{{
  "hero": {{
    "title": "عنوان البانر الرئيسي",
    "subtitle": "وصف قصير جذاب",
    "cta_text": "نص زر الدعوة للعمل"
  }},
  "categories": [
    {{"name": "اسم القسم", "description": "وصف مختصر", "icon": "رمز إيموجي مناسب"}}
  ],
  "featured_products": [
    {{"name": "اسم المنتج", "description": "وصف المنتج", "price": 99.99, "currency": "SAR"}}
  ],
  "about": {{
    "title": "عنوان صفحة من نحن",
    "content": "نص تعريفي عن المتجر (3-4 جمل)"
  }},
  "seo": {{
    "title": "عنوان SEO",
    "description": "وصف SEO (160 حرف)",
    "keywords": ["كلمة1", "كلمة2"]
  }},
  "features": [
    {{"icon": "🚚", "title": "ميزة", "description": "وصف الميزة"}}
  ],
  "faq": [
    {{"question": "سؤال شائع؟", "answer": "الإجابة"}}
  ]
}}

أنشئ 4-6 تصنيفات، 6-8 منتجات نموذجية، 3-4 مميزات، و4-6 أسئلة شائعة.
تأكد أن المحتوى متناسب مع نوع المتجر ({type_label})."""


async def _generate_with_openai(prompt: str, api_key: str) -> dict:
    """Call OpenAI API to generate store content."""
    try:
        import httpx

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.7,
                    "max_tokens": 2000,
                    "response_format": {"type": "json_object"},
                },
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return json.loads(content)
    except Exception as e:
        print(f"⚠️ OpenAI API error: {e}")
        return {}


def _generate_template_content(store_name: str, store_type: str, language: str) -> dict:
    """Fallback: Generate template-based content when no API key is available."""
    type_label = STORE_TYPE_LABELS.get(store_type, "متجر")

    product_templates = {
        "fashion": [
            {"name": "فستان سهرة أنيق", "description": "فستان سهرة فاخر بتصميم عصري", "price": 450, "currency": "SAR"},
            {"name": "بدلة رسمية رجالية", "description": "بدلة كلاسيكية بقصة احترافية", "price": 890, "currency": "SAR"},
            {"name": "حقيبة يد جلدية", "description": "حقيبة يد من الجلد الطبيعي", "price": 320, "currency": "SAR"},
            {"name": "حذاء رياضي", "description": "حذاء مريح للاستخدام اليومي", "price": 280, "currency": "SAR"},
            {"name": "شال حريري", "description": "شال من الحرير الطبيعي", "price": 180, "currency": "SAR"},
            {"name": "ساعة يد كلاسيكية", "description": "ساعة أنيقة بتصميم عصري", "price": 650, "currency": "SAR"},
        ],
        "electronics": [
            {"name": "سماعات بلوتوث", "description": "سماعات لاسلكية بجودة صوت عالية", "price": 350, "currency": "SAR"},
            {"name": "شاحن سريع", "description": "شاحن 65 واط يدعم الشحن السريع", "price": 120, "currency": "SAR"},
            {"name": "ماوس لاسلكي", "description": "ماوس مريح للاستخدام المكتبي", "price": 95, "currency": "SAR"},
            {"name": "حامل لابتوب", "description": "حامل ألمنيوم قابل للتعديل", "price": 180, "currency": "SAR"},
            {"name": "كاميرا ويب HD", "description": "كاميرا 1080p للاجتماعات", "price": 230, "currency": "SAR"},
            {"name": "لوحة مفاتيح ميكانيكية", "description": "كيبورد ميكانيكي RGB", "price": 420, "currency": "SAR"},
        ],
        "beauty": [
            {"name": "عطر فاخر", "description": "عطر شرقي بمكونات طبيعية", "price": 380, "currency": "SAR"},
            {"name": "كريم ترطيب", "description": "كريم مرطب طبيعي للبشرة", "price": 120, "currency": "SAR"},
            {"name": "مجموعة مكياج", "description": "طقم مكياج احترافي 12 قطعة", "price": 550, "currency": "SAR"},
            {"name": "زيت أرغان أصلي", "description": "زيت أرغان مغربي طبيعي", "price": 95, "currency": "SAR"},
            {"name": "عود معطر", "description": "بخور عود كمبودي فاخر", "price": 280, "currency": "SAR"},
            {"name": "لوشن للجسم", "description": "لوشن معطر بالمسك الأبيض", "price": 85, "currency": "SAR"},
        ],
    }

    default_products = [
        {"name": "منتج مميز 1", "description": "منتج عالي الجودة", "price": 199, "currency": "SAR"},
        {"name": "منتج مميز 2", "description": "أفضل قيمة مقابل السعر", "price": 149, "currency": "SAR"},
        {"name": "منتج مميز 3", "description": "الأكثر مبيعاً", "price": 299, "currency": "SAR"},
        {"name": "منتج مميز 4", "description": "جديد في المتجر", "price": 179, "currency": "SAR"},
        {"name": "منتج مميز 5", "description": "عرض خاص محدود", "price": 249, "currency": "SAR"},
        {"name": "منتج مميز 6", "description": "حصري لدينا", "price": 349, "currency": "SAR"},
    ]

    category_templates = {
        "fashion": [
            {"name": "ملابس رجالية", "description": "أحدث صيحات الموضة الرجالية", "icon": "👔"},
            {"name": "ملابس نسائية", "description": "أزياء نسائية أنيقة", "icon": "👗"},
            {"name": "أحذية", "description": "أحذية لكل المناسبات", "icon": "👟"},
            {"name": "إكسسوارات", "description": "إكمال إطلالتك", "icon": "💎"},
        ],
        "electronics": [
            {"name": "هواتف ذكية", "description": "أحدث الهواتف", "icon": "📱"},
            {"name": "أجهزة حاسوب", "description": "لابتوبات وملحقات", "icon": "💻"},
            {"name": "سماعات", "description": "صوت بجودة عالية", "icon": "🎧"},
            {"name": "أجهزة منزلية", "description": "تقنية للمنزل", "icon": "🏠"},
        ],
        "beauty": [
            {"name": "عطور", "description": "عطور فاخرة ومميزة", "icon": "🌸"},
            {"name": "مكياج", "description": "منتجات تجميل احترافية", "icon": "💄"},
            {"name": "عناية بالبشرة", "description": "كريمات ومرطبات", "icon": "✨"},
            {"name": "بخور وعود", "description": "أجود أنواع البخور", "icon": "🕌"},
        ],
    }

    default_categories = [
        {"name": "الأكثر مبيعاً", "description": "المنتجات الأكثر شعبية", "icon": "🔥"},
        {"name": "جديدنا", "description": "أحدث المنتجات", "icon": "✨"},
        {"name": "عروض خاصة", "description": "أفضل العروض والتخفيضات", "icon": "🏷️"},
        {"name": "حصري", "description": "منتجات حصرية لدينا", "icon": "💎"},
    ]

    return {
        "hero": {
            "title": f"مرحباً بكم في {store_name}",
            "subtitle": f"وجهتكم الأولى لأفضل منتجات {type_label}",
            "cta_text": "تسوق الآن",
        },
        "categories": category_templates.get(store_type, default_categories),
        "featured_products": product_templates.get(store_type, default_products),
        "about": {
            "title": f"عن {store_name}",
            "content": f"نحن {store_name}، متجر إلكتروني متخصص في {type_label}. نسعى لتقديم أفضل المنتجات بأعلى جودة وأنسب الأسعار. هدفنا رضا العميل وتوفير تجربة تسوق استثنائية.",
        },
        "seo": {
            "title": f"{store_name} — {type_label} أونلاين",
            "description": f"تسوقوا أفضل منتجات {type_label} من {store_name}. شحن سريع لجميع مناطق المملكة مع خيارات دفع متعددة.",
            "keywords": [store_name, type_label, "تسوق أونلاين", "متجر إلكتروني"],
        },
        "features": [
            {"icon": "🚚", "title": "شحن سريع", "description": "توصيل لجميع المناطق خلال 3-5 أيام"},
            {"icon": "🔒", "title": "دفع آمن", "description": "جميع المعاملات مشفرة ومحمية"},
            {"icon": "↩️", "title": "استرجاع سهل", "description": "سياسة استرجاع مرنة خلال 14 يوم"},
            {"icon": "💬", "title": "دعم متواصل", "description": "فريق دعم متاح على مدار الساعة"},
        ],
        "faq": [
            {"question": "كيف أقوم بالطلب؟", "answer": "اختر المنتج واضفه للسلة ثم أكمل عملية الدفع"},
            {"question": "ما هي طرق الدفع المتاحة؟", "answer": "نقبل مدى، فيزا، ماستركارد، والدفع عند الاستلام"},
            {"question": "كم يستغرق التوصيل؟", "answer": "3-5 أيام عمل لجميع مناطق المملكة"},
            {"question": "هل يمكنني استرجاع المنتج؟", "answer": "نعم، يمكنك الاسترجاع خلال 14 يوم من تاريخ الاستلام"},
            {"question": "هل لديكم فروع؟", "answer": "نحن متجر إلكتروني بالكامل لضمان أفضل الأسعار"},
        ],
    }


async def generate_store(job_id: str, store_id: str, config: dict) -> tuple[list, dict]:
    """
    Generate store content using AI (OpenAI) or template fallback.
    Returns (steps, result) tuple.
    """
    settings = get_settings()
    store_name = config.get("name", "متجري")
    store_type = config.get("store_type", "general")
    language = config.get("language", "ar")

    steps = [
        ("تحليل المتطلبات...", 10),
        ("تصميم هيكل المتجر...", 25),
        ("إنشاء المحتوى بالذكاء الاصطناعي...", 40),
        ("تكوين بوابة الدفع...", 55),
        ("إعداد الشحن...", 70),
        ("تطبيق الثيم والتصميم...", 85),
        ("مراجعة نهائية...", 95),
        ("المتجر جاهز! 🎉", 100),
    ]

    # Try AI generation first
    ai_content = {}
    if settings.OPENAI_API_KEY:
        prompt = _build_generation_prompt(config, store_name, store_type, language)
        ai_content = await _generate_with_openai(prompt, settings.OPENAI_API_KEY)

    # Fallback to template if AI returned nothing
    if not ai_content:
        ai_content = _generate_template_content(store_name, store_type, language)

    result = {
        "store_id": store_id,
        "pages_generated": ["home", "products", "cart", "checkout", "about", "contact"],
        "theme": config.get("branding", {}).get("style", "modern"),
        "payment_configured": config.get("payment", {}).get("gateway", "moyasar"),
        "shipping_configured": config.get("shipping", {}).get("provider", "aramex"),
        "language": language,
        "features_enabled": config.get("features", []),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "ai_content": ai_content,
    }

    return steps, result
