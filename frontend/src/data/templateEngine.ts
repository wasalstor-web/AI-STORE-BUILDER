// ═══════════════════════════════════════════════════════════════════════════
// Template Engine — generates professional store HTML from theme + sections
// ═══════════════════════════════════════════════════════════════════════════

export interface StoreTheme {
  primary: string;
  primaryDark: string;
  accent: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  heroGradient: string;
  cardBg: string;
  borderColor: string;
  fontFamily: string;
  radius: string;
  style: "luxury" | "modern" | "minimal" | "classic" | "bold" | "playful";
}

export interface SectionConfig {
  id: string;
  type: SectionType;
  props: Record<string, any>;
}

export type SectionType =
  | "navbar"
  | "hero"
  | "hero-split"
  | "hero-video"
  | "categories"
  | "categories-circle"
  | "products"
  | "products-featured"
  | "products-carousel"
  | "features"
  | "features-detailed"
  | "testimonials"
  | "testimonials-large"
  | "newsletter"
  | "banner"
  | "banner-marquee"
  | "stats"
  | "brands"
  | "gallery"
  | "offers"
  | "countdown"
  | "cta"
  | "faq"
  | "contact"
  | "footer"
  | "footer-rich"
  | "trust-badges"
  | "instagram-feed"
  | "video-section"
  | "spacer";

export interface ProductData {
  name: string;
  price: string;
  oldPrice?: string;
  emoji: string;
  badge?: string;
  gradient: string;
}

export interface CategoryData {
  name: string;
  emoji: string;
  count: string;
  gradient: string;
}

export interface FeatureData {
  icon: string;
  title: string;
  desc: string;
}

export interface TestimonialData {
  name: string;
  role: string;
  text: string;
  rating: number;
  initials: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Product data sets per store type
// ═══════════════════════════════════════════════════════════════════════════

export const PRODUCT_SETS: Record<string, ProductData[]> = {
  fashion: [
    {
      name: "فستان سهرة أنيق",
      price: "899",
      oldPrice: "1,199",
      emoji: "👗",
      badge: "خصم 25%",
      gradient: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
    },
    {
      name: "جاكيت جلد طبيعي",
      price: "1,499",
      emoji: "🧥",
      badge: "جديد",
      gradient: "linear-gradient(135deg, #efebe9 0%, #d7ccc8 100%)",
    },
    {
      name: "حقيبة يد كلاسيكية",
      price: "699",
      emoji: "👜",
      gradient: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
    },
    {
      name: "حذاء رياضي فاخر",
      price: "459",
      emoji: "👟",
      badge: "الأكثر مبيعاً",
      gradient: "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)",
    },
    {
      name: "ساعة كلاسيكية ذهبية",
      price: "2,999",
      emoji: "⌚",
      gradient: "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
    },
    {
      name: "نظارة شمسية ريبان",
      price: "349",
      emoji: "🕶️",
      gradient: "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)",
    },
    {
      name: "وشاح حرير إيطالي",
      price: "299",
      emoji: "🧣",
      badge: "حصري",
      gradient: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
    },
    {
      name: "حزام جلد طبيعي",
      price: "199",
      emoji: "👔",
      gradient: "linear-gradient(135deg, #efebe9 0%, #bcaaa4 100%)",
    },
  ],
  electronics: [
    {
      name: "آيفون 16 برو ماكس",
      price: "5,499",
      emoji: "📱",
      badge: "جديد",
      gradient: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
    },
    {
      name: "ماك بوك إير M4",
      price: "4,999",
      emoji: "💻",
      gradient: "linear-gradient(135deg, #eceff1 0%, #cfd8dc 100%)",
    },
    {
      name: "AirPods Pro 3",
      price: "1,099",
      emoji: "🎧",
      badge: "الأكثر مبيعاً",
      gradient: "linear-gradient(135deg, #fafafa 0%, #eeeeee 100%)",
    },
    {
      name: "آيباد برو 13 إنش",
      price: "3,999",
      emoji: "📱",
      gradient: "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)",
    },
    {
      name: "شاشة سامسونج 4K",
      price: "2,799",
      oldPrice: "3,499",
      emoji: "🖥️",
      badge: "خصم 20%",
      gradient: "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)",
    },
    {
      name: "كيبورد ميكانيكي RGB",
      price: "449",
      emoji: "⌨️",
      gradient: "linear-gradient(135deg, #263238 0%, #37474f 100%)",
    },
    {
      name: "كاميرا سوني ألفا 7",
      price: "6,999",
      emoji: "📷",
      badge: "احترافي",
      gradient: "linear-gradient(135deg, #212121 0%, #424242 100%)",
    },
    {
      name: "شاحن لاسلكي MagSafe",
      price: "199",
      emoji: "🔋",
      gradient: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
    },
  ],
  beauty: [
    {
      name: "عطر عود ملكي",
      price: "799",
      emoji: "🌹",
      badge: "الأكثر مبيعاً",
      gradient: "linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)",
    },
    {
      name: "سيروم فيتامين سي",
      price: "189",
      emoji: "✨",
      badge: "جديد",
      gradient: "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
    },
    {
      name: "طقم مكياج احترافي",
      price: "459",
      emoji: "💄",
      gradient: "linear-gradient(135deg, #fce4ec 0%, #f48fb1 100%)",
    },
    {
      name: "كريم مرطب هيالورونيك",
      price: "149",
      emoji: "🧴",
      gradient: "linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)",
    },
    {
      name: "مجموعة عناية بالشعر",
      price: "299",
      emoji: "💆",
      gradient: "linear-gradient(135deg, #f3e5f5 0%, #ce93d8 100%)",
    },
    {
      name: "ماسك وجه ذهبي 24K",
      price: "99",
      oldPrice: "149",
      emoji: "🪞",
      badge: "خصم",
      gradient: "linear-gradient(135deg, #fff8e1 0%, #ffd54f 100%)",
    },
    {
      name: "باليت ظلال عيون",
      price: "279",
      emoji: "🎨",
      gradient: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
    },
    {
      name: "عطر مسك أبيض",
      price: "599",
      emoji: "🌸",
      badge: "حصري",
      gradient: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
    },
  ],
  food: [
    {
      name: "برجر واغيو مميز",
      price: "89",
      emoji: "🍔",
      badge: "الأكثر طلباً",
      gradient: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
    },
    {
      name: "بيتزا مارغريتا إيطالية",
      price: "49",
      emoji: "🍕",
      gradient: "linear-gradient(135deg, #ffecb3 0%, #ffe082 100%)",
    },
    {
      name: "سلطة سيزر بالدجاج",
      price: "39",
      emoji: "🥗",
      badge: "صحي",
      gradient: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
    },
    {
      name: "ستيك مشوي على الفحم",
      price: "129",
      emoji: "🥩",
      gradient: "linear-gradient(135deg, #efebe9 0%, #d7ccc8 100%)",
    },
    {
      name: "تشيز كيك توت",
      price: "45",
      emoji: "🍰",
      badge: "جديد",
      gradient: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
    },
    {
      name: "عصير فواكه طبيعي",
      price: "25",
      emoji: "🥤",
      gradient: "linear-gradient(135deg, #fff9c4 0%, #fff176 100%)",
    },
    {
      name: "سوشي رول مشكل",
      price: "79",
      emoji: "🍣",
      gradient: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)",
    },
    {
      name: "موكا لاتيه",
      price: "28",
      emoji: "☕",
      gradient: "linear-gradient(135deg, #efebe9 0%, #bcaaa4 100%)",
    },
  ],
  general: [
    {
      name: "منتج مميز أول",
      price: "199",
      emoji: "⭐",
      badge: "الأكثر مبيعاً",
      gradient: "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)",
    },
    {
      name: "منتج راقي ثاني",
      price: "349",
      emoji: "💎",
      badge: "جديد",
      gradient: "linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)",
    },
    {
      name: "منتج عصري ثالث",
      price: "149",
      emoji: "🔥",
      gradient: "linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)",
    },
    {
      name: "منتج حصري رابع",
      price: "599",
      emoji: "🎁",
      badge: "حصري",
      gradient: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
    },
    {
      name: "منتج كلاسيكي خامس",
      price: "249",
      emoji: "🏷️",
      gradient: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
    },
    {
      name: "منتج عملي سادس",
      price: "89",
      oldPrice: "129",
      emoji: "📦",
      badge: "خصم 30%",
      gradient: "linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)",
    },
    {
      name: "منتج فريد سابع",
      price: "449",
      emoji: "🎯",
      gradient: "linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)",
    },
    {
      name: "منتج مبتكر ثامن",
      price: "699",
      emoji: "✨",
      gradient: "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
    },
  ],
  jewelry: [
    {
      name: "خاتم ألماس سوليتير",
      price: "12,999",
      emoji: "💍",
      badge: "فاخر",
      gradient: "linear-gradient(135deg, #fff8e1 0%, #ffd54f 100%)",
    },
    {
      name: "عقد ذهب عيار 21",
      price: "4,599",
      emoji: "📿",
      gradient: "linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)",
    },
    {
      name: "أسوارة كارتييه",
      price: "8,999",
      emoji: "💎",
      badge: "الأكثر مبيعاً",
      gradient: "linear-gradient(135deg, #fafafa 0%, #e0e0e0 100%)",
    },
    {
      name: "أقراط لؤلؤ طبيعي",
      price: "2,999",
      emoji: "✨",
      gradient: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%)",
    },
    {
      name: "ساعة رولكس ديت جست",
      price: "45,000",
      emoji: "⌚",
      badge: "حصري",
      gradient: "linear-gradient(135deg, #212121 0%, #424242 100%)",
    },
    {
      name: "طقم مجوهرات عروس",
      price: "18,999",
      emoji: "👑",
      gradient: "linear-gradient(135deg, #fff8e1 0%, #ffe082 100%)",
    },
    {
      name: "بروش ذهبي فاخر",
      price: "3,499",
      emoji: "🏅",
      gradient: "linear-gradient(135deg, #efebe9 0%, #d7ccc8 100%)",
    },
    {
      name: "خلخال ذهب ناعم",
      price: "1,899",
      emoji: "💫",
      badge: "جديد",
      gradient: "linear-gradient(135deg, #fff9c4 0%, #fff176 100%)",
    },
  ],
  sports: [
    {
      name: "حذاء جري نايك إير",
      price: "699",
      emoji: "👟",
      badge: "الأكثر مبيعاً",
      gradient: "linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)",
    },
    {
      name: "طقم تمارين كامل",
      price: "349",
      emoji: "🏋️",
      gradient: "linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)",
    },
    {
      name: "ساعة رياضية ذكية",
      price: "1,299",
      emoji: "⌚",
      badge: "جديد",
      gradient: "linear-gradient(135deg, #263238 0%, #455a64 100%)",
    },
    {
      name: "شنطة رياضية أديداس",
      price: "249",
      emoji: "🎒",
      gradient: "linear-gradient(135deg, #212121 0%, #616161 100%)",
    },
    {
      name: "مضرب تنس ويلسون",
      price: "899",
      emoji: "🎾",
      gradient: "linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)",
    },
    {
      name: "سجادة يوغا بريميوم",
      price: "149",
      emoji: "🧘",
      badge: "صحي",
      gradient: "linear-gradient(135deg, #f3e5f5 0%, #ce93d8 100%)",
    },
    {
      name: "دراجة هوائية احترافية",
      price: "3,499",
      emoji: "🚴",
      gradient: "linear-gradient(135deg, #e0e0e0 0%, #9e9e9e 100%)",
    },
    {
      name: "بروتين واي 2 كيلو",
      price: "199",
      emoji: "💪",
      gradient: "linear-gradient(135deg, #efebe9 0%, #bcaaa4 100%)",
    },
  ],
  kids: [
    {
      name: "دمية دب عملاقة",
      price: "149",
      emoji: "🧸",
      badge: "الأكثر مبيعاً",
      gradient: "linear-gradient(135deg, #fff9c4 0%, #fff176 100%)",
    },
    {
      name: "ليقو سفينة فضائية",
      price: "299",
      emoji: "🧩",
      badge: "جديد",
      gradient: "linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)",
    },
    {
      name: "كتب أطفال تعليمية",
      price: "89",
      emoji: "📚",
      gradient: "linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)",
    },
    {
      name: "طقم ألوان وأقلام",
      price: "59",
      emoji: "🎨",
      gradient: "linear-gradient(135deg, #fce4ec 0%, #f48fb1 100%)",
    },
    {
      name: "سيارة ريموت كنترول",
      price: "199",
      emoji: "🚗",
      badge: "عرض",
      gradient: "linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)",
    },
    {
      name: "بازل 500 قطعة",
      price: "79",
      emoji: "🧩",
      gradient: "linear-gradient(135deg, #f3e5f5 0%, #ce93d8 100%)",
    },
    {
      name: "خيمة أطفال داخلية",
      price: "249",
      emoji: "⛺",
      gradient: "linear-gradient(135deg, #e0f2f1 0%, #80cbc4 100%)",
    },
    {
      name: "لعبة طبخ مصغرة",
      price: "129",
      emoji: "🍳",
      gradient: "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
    },
  ],
  home: [
    {
      name: "أريكة مخملية فاخرة",
      price: "4,999",
      emoji: "🛋️",
      badge: "جديد",
      gradient: "linear-gradient(135deg, #efebe9 0%, #d7ccc8 100%)",
    },
    {
      name: "مصباح أرضي إسكندنافي",
      price: "699",
      emoji: "💡",
      gradient: "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)",
    },
    {
      name: "لوحة جدارية فنية",
      price: "349",
      emoji: "🖼️",
      badge: "حصري",
      gradient: "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)",
    },
    {
      name: "نبتة زينة داخلية",
      price: "89",
      emoji: "🌱",
      gradient: "linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)",
    },
    {
      name: "شمعة عطرية فاخرة",
      price: "149",
      emoji: "🕯️",
      badge: "الأكثر مبيعاً",
      gradient: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
    },
    {
      name: "سجادة بيرسيان",
      price: "2,499",
      emoji: "🏠",
      gradient: "linear-gradient(135deg, #efebe9 0%, #bcaaa4 100%)",
    },
    {
      name: "مرآة حائط ذهبية",
      price: "599",
      emoji: "🪞",
      gradient: "linear-gradient(135deg, #fff8e1 0%, #ffd54f 100%)",
    },
    {
      name: "مزهرية سيراميك",
      price: "199",
      emoji: "🏺",
      badge: "فن يدوي",
      gradient: "linear-gradient(135deg, #e0f2f1 0%, #80cbc4 100%)",
    },
  ],
  perfume: [
    {
      name: "عود كمبودي فاخر",
      price: "1,299",
      emoji: "🌹",
      badge: "فاخر",
      gradient: "linear-gradient(135deg, #311b92 0%, #4527a0 100%)",
    },
    {
      name: "عطر مسك طبيعي",
      price: "599",
      emoji: "🌸",
      badge: "الأكثر مبيعاً",
      gradient: "linear-gradient(135deg, #fce4ec 0%, #f48fb1 100%)",
    },
    {
      name: "بخور عربي أصيل",
      price: "249",
      emoji: "✨",
      gradient: "linear-gradient(135deg, #4e342e 0%, #6d4c41 100%)",
    },
    {
      name: "دخون ملكي",
      price: "349",
      emoji: "🔮",
      badge: "حصري",
      gradient: "linear-gradient(135deg, #1a237e 0%, #283593 100%)",
    },
    {
      name: "عطر ورد طائفي",
      price: "899",
      emoji: "🌺",
      gradient: "linear-gradient(135deg, #880e4f 0%, #ad1457 100%)",
    },
    {
      name: "مجموعة عطور سفر",
      price: "399",
      emoji: "🎀",
      badge: "هدية مثالية",
      gradient: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
    },
    {
      name: "عطر عنبر خالص",
      price: "1,899",
      emoji: "💎",
      gradient: "linear-gradient(135deg, #3e2723 0%, #5d4037 100%)",
    },
    {
      name: "زيت عود هندي",
      price: "2,499",
      emoji: "🫧",
      badge: "نادر",
      gradient: "linear-gradient(135deg, #263238 0%, #37474f 100%)",
    },
  ],
  health: [
    {
      name: "فيتامين D3 + K2",
      price: "89",
      emoji: "💊",
      badge: "الأكثر مبيعاً",
      gradient: "linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)",
    },
    {
      name: "بروتين نباتي عضوي",
      price: "199",
      emoji: "🌿",
      badge: "عضوي",
      gradient: "linear-gradient(135deg, #f1f8e9 0%, #aed581 100%)",
    },
    {
      name: "زيت جوز الهند البكر",
      price: "59",
      emoji: "🥥",
      gradient: "linear-gradient(135deg, #efebe9 0%, #d7ccc8 100%)",
    },
    {
      name: "عسل مانوكا نيوزلندي",
      price: "349",
      emoji: "🍯",
      badge: "طبيعي 100%",
      gradient: "linear-gradient(135deg, #fff8e1 0%, #ffcc80 100%)",
    },
    {
      name: "شاي أعشاب مهدئ",
      price: "39",
      emoji: "🍵",
      gradient: "linear-gradient(135deg, #e0f2f1 0%, #80cbc4 100%)",
    },
    {
      name: "كولاجين بحري",
      price: "249",
      emoji: "✨",
      badge: "جديد",
      gradient: "linear-gradient(135deg, #e3f2fd 0%, #90caf9 100%)",
    },
    {
      name: "مكمل أوميغا 3",
      price: "129",
      emoji: "🐟",
      gradient: "linear-gradient(135deg, #e8eaf6 0%, #9fa8da 100%)",
    },
    {
      name: "سوبر فود مكس",
      price: "179",
      emoji: "🥑",
      badge: "نباتي",
      gradient: "linear-gradient(135deg, #e8f5e9 0%, #66bb6a 100%)",
    },
  ],
  auto: [
    {
      name: "زيت محرك سينثتك 5W-30",
      price: "149",
      emoji: "🛢️",
      badge: "الأكثر مبيعاً",
      gradient: "linear-gradient(135deg, #212121 0%, #424242 100%)",
    },
    {
      name: "بطارية سيارة AGM",
      price: "699",
      emoji: "🔋",
      gradient: "linear-gradient(135deg, #263238 0%, #455a64 100%)",
    },
    {
      name: "إطارات ميشلان 4 قطع",
      price: "2,499",
      emoji: "🛞",
      badge: "عرض خاص",
      gradient: "linear-gradient(135deg, #37474f 0%, #546e7a 100%)",
    },
    {
      name: "كاميرا سيارة أمامية",
      price: "349",
      emoji: "📷",
      badge: "جديد",
      gradient: "linear-gradient(135deg, #1a237e 0%, #283593 100%)",
    },
    {
      name: "طقم عدة إصلاح 120 قطعة",
      price: "499",
      emoji: "🔧",
      gradient: "linear-gradient(135deg, #b71c1c 0%, #c62828 100%)",
    },
    {
      name: "منظف داخلي سيراميك",
      price: "89",
      emoji: "✨",
      gradient: "linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)",
    },
    {
      name: "شاحن سيارة سريع",
      price: "129",
      emoji: "⚡",
      gradient: "linear-gradient(135deg, #f57f17 0%, #ff8f00 100%)",
    },
    {
      name: "مسّاحات ممتازة زوج",
      price: "79",
      emoji: "🚗",
      gradient: "linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)",
    },
  ],
};

export const CATEGORY_SETS: Record<string, CategoryData[]> = {
  fashion: [
    {
      name: "أزياء نسائية",
      emoji: "👗",
      count: "120+",
      gradient: "linear-gradient(135deg, #e91e63, #ad1457)",
    },
    {
      name: "أزياء رجالية",
      emoji: "👔",
      count: "85+",
      gradient: "linear-gradient(135deg, #2196f3, #1565c0)",
    },
    {
      name: "أحذية",
      emoji: "👠",
      count: "60+",
      gradient: "linear-gradient(135deg, #ff9800, #ef6c00)",
    },
    {
      name: "إكسسوارات",
      emoji: "💎",
      count: "45+",
      gradient: "linear-gradient(135deg, #9c27b0, #6a1b9a)",
    },
    {
      name: "حقائب",
      emoji: "👜",
      count: "35+",
      gradient: "linear-gradient(135deg, #795548, #4e342e)",
    },
    {
      name: "ساعات",
      emoji: "⌚",
      count: "30+",
      gradient: "linear-gradient(135deg, #ffd700, #b8860b)",
    },
  ],
  electronics: [
    {
      name: "هواتف ذكية",
      emoji: "📱",
      count: "50+",
      gradient: "linear-gradient(135deg, #2196f3, #0d47a1)",
    },
    {
      name: "لابتوبات",
      emoji: "💻",
      count: "35+",
      gradient: "linear-gradient(135deg, #607d8b, #37474f)",
    },
    {
      name: "سماعات",
      emoji: "🎧",
      count: "40+",
      gradient: "linear-gradient(135deg, #9c27b0, #4a148c)",
    },
    {
      name: "شاشات",
      emoji: "🖥️",
      count: "25+",
      gradient: "linear-gradient(135deg, #212121, #424242)",
    },
    {
      name: "ألعاب",
      emoji: "🎮",
      count: "60+",
      gradient: "linear-gradient(135deg, #4caf50, #1b5e20)",
    },
    {
      name: "كاميرات",
      emoji: "📷",
      count: "20+",
      gradient: "linear-gradient(135deg, #ff5722, #bf360c)",
    },
  ],
  beauty: [
    {
      name: "عطور",
      emoji: "🌹",
      count: "80+",
      gradient: "linear-gradient(135deg, #9c27b0, #4a148c)",
    },
    {
      name: "مكياج",
      emoji: "💄",
      count: "120+",
      gradient: "linear-gradient(135deg, #e91e63, #880e4f)",
    },
    {
      name: "عناية بالبشرة",
      emoji: "✨",
      count: "60+",
      gradient: "linear-gradient(135deg, #00bcd4, #006064)",
    },
    {
      name: "عناية بالشعر",
      emoji: "💆",
      count: "45+",
      gradient: "linear-gradient(135deg, #ff9800, #e65100)",
    },
    {
      name: "أدوات تجميل",
      emoji: "🪞",
      count: "35+",
      gradient: "linear-gradient(135deg, #f06292, #c2185b)",
    },
    {
      name: "هدايا",
      emoji: "🎁",
      count: "25+",
      gradient: "linear-gradient(135deg, #ffd54f, #f9a825)",
    },
  ],
  food: [
    {
      name: "برجر",
      emoji: "🍔",
      count: "15+",
      gradient: "linear-gradient(135deg, #ff9800, #e65100)",
    },
    {
      name: "بيتزا",
      emoji: "🍕",
      count: "12+",
      gradient: "linear-gradient(135deg, #f44336, #c62828)",
    },
    {
      name: "سلطات",
      emoji: "🥗",
      count: "10+",
      gradient: "linear-gradient(135deg, #4caf50, #2e7d32)",
    },
    {
      name: "مشويات",
      emoji: "🥩",
      count: "8+",
      gradient: "linear-gradient(135deg, #795548, #3e2723)",
    },
    {
      name: "حلويات",
      emoji: "🍰",
      count: "20+",
      gradient: "linear-gradient(135deg, #e91e63, #ad1457)",
    },
    {
      name: "مشروبات",
      emoji: "☕",
      count: "15+",
      gradient: "linear-gradient(135deg, #6d4c41, #3e2723)",
    },
  ],
  general: [
    {
      name: "الأكثر مبيعاً",
      emoji: "🔥",
      count: "50+",
      gradient: "linear-gradient(135deg, #ff5722, #d84315)",
    },
    {
      name: "وصل حديثاً",
      emoji: "⭐",
      count: "30+",
      gradient: "linear-gradient(135deg, #ffc107, #ff8f00)",
    },
    {
      name: "عروض خاصة",
      emoji: "🏷️",
      count: "25+",
      gradient: "linear-gradient(135deg, #4caf50, #2e7d32)",
    },
    {
      name: "إلكترونيات",
      emoji: "📱",
      count: "40+",
      gradient: "linear-gradient(135deg, #2196f3, #1565c0)",
    },
    {
      name: "أزياء",
      emoji: "👗",
      count: "35+",
      gradient: "linear-gradient(135deg, #e91e63, #ad1457)",
    },
    {
      name: "منزل",
      emoji: "🏠",
      count: "20+",
      gradient: "linear-gradient(135deg, #795548, #4e342e)",
    },
  ],
};

export const TESTIMONIALS_DATA: TestimonialData[] = [
  {
    name: "سارة المالكي",
    role: "عميلة مميزة",
    text: "تجربة تسوق رائعة! المنتجات أصلية 100% والتوصيل وصلني في نفس اليوم. أنصح الجميع بالتعامل معهم.",
    rating: 5,
    initials: "سم",
  },
  {
    name: "محمد العتيبي",
    role: "عميل دائم",
    text: "أفضل متجر تعاملت معه في السعودية. خدمة العملاء ممتازة والمنتجات بجودة عالية. شكراً لكم!",
    rating: 5,
    initials: "مع",
  },
  {
    name: "نورة القحطاني",
    role: "مشترية معتمدة",
    text: "جودة عالية وأسعار منافسة جداً. التغليف كان فاخر والمنتج مطابق للوصف تماماً. سأعود بالتأكيد!",
    rating: 5,
    initials: "نق",
  },
  {
    name: "عبدالله الشمري",
    role: "عميل VIP",
    text: "من أضخم المتاجر الإلكترونية المحلية. تشكيلة واسعة وعروض مستمرة. التوصيل سريع ومجاني.",
    rating: 4,
    initials: "عش",
  },
  {
    name: "ريم الحربي",
    role: "عميلة جديدة",
    text: "أول مرة أتعامل معهم وكانت تجربة مذهلة. سرعة في المعالجة والشحن. أكيد بكرر التجربة.",
    rating: 5,
    initials: "رح",
  },
  {
    name: "فيصل الدوسري",
    role: "عميل منتظم",
    text: "ما لقيت متجر إلكتروني بهالمستوى من الاحترافية. الدفع سهل وآمن والمنتجات ممتازة.",
    rating: 5,
    initials: "فد",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Base CSS Generator
// ═══════════════════════════════════════════════════════════════════════════

function generateBaseCSS(theme: StoreTheme): string {
  return `
    :root {
      --p: ${theme.primary};
      --pd: ${theme.primaryDark};
      --a: ${theme.accent};
      --bg: ${theme.bg};
      --sf: ${theme.surface};
      --sfa: ${theme.surfaceAlt};
      --tx: ${theme.text};
      --ts: ${theme.textSecondary};
      --cb: ${theme.cardBg};
      --br: ${theme.borderColor};
      --r: ${theme.radius};
      --hg: ${theme.heroGradient};
    }
    *{margin:0;padding:0;box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{font-family:'Tajawal',sans-serif;background:var(--bg);color:var(--tx);line-height:1.7;-webkit-font-smoothing:antialiased}
    img{max-width:100%;display:block}
    a{text-decoration:none;color:inherit;transition:color .3s}
    .container{max-width:1200px;margin:0 auto;padding:0 24px}
    .section{padding:80px 0}
    .section-sm{padding:50px 0}

    /* Grid System */
    .grid{display:grid;gap:24px}
    .grid-2{grid-template-columns:repeat(2,1fr)}
    .grid-3{grid-template-columns:repeat(3,1fr)}
    .grid-4{grid-template-columns:repeat(4,1fr)}
    .grid-6{grid-template-columns:repeat(6,1fr)}
    .grid-auto{grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}

    /* Flex */
    .flex{display:flex}.flex-col{flex-direction:column}
    .items-center{align-items:center}.justify-center{justify-content:center}
    .justify-between{justify-content:space-between}.gap-8{gap:8px}
    .gap-12{gap:12px}.gap-16{gap:16px}.gap-20{gap:20px}.gap-24{gap:24px}.gap-32{gap:32px}
    .flex-wrap{flex-wrap:wrap}

    /* Typography */
    .text-center{text-align:center}
    .text-xs{font-size:.75rem}.text-sm{font-size:.875rem}.text-base{font-size:1rem}
    .text-lg{font-size:1.125rem}.text-xl{font-size:1.25rem}.text-2xl{font-size:1.5rem}
    .text-3xl{font-size:2rem}.text-4xl{font-size:2.5rem}.text-5xl{font-size:3.5rem}
    .font-light{font-weight:300}.font-normal{font-weight:400}.font-medium{font-weight:500}
    .font-semibold{font-weight:600}.font-bold{font-weight:700}.font-black{font-weight:900}
    .leading-tight{line-height:1.3}.leading-relaxed{line-height:1.8}
    .uppercase{text-transform:uppercase}.tracking-wide{letter-spacing:.05em}

    /* Colors */
    .text-primary{color:var(--p)}.text-accent{color:var(--a)}
    .text-white{color:#fff}.text-sec{color:var(--ts)}
    .bg-primary{background:var(--p)}.bg-accent{background:var(--a)}.bg-surface{background:var(--sf)}
    .bg-surface-alt{background:var(--sfa)}
    .opacity-80{opacity:.8}.opacity-60{opacity:.6}.opacity-50{opacity:.5}

    /* Spacing */
    .mb-4{margin-bottom:4px}.mb-8{margin-bottom:8px}.mb-12{margin-bottom:12px}
    .mb-16{margin-bottom:16px}.mb-24{margin-bottom:24px}.mb-32{margin-bottom:32px}
    .mb-40{margin-bottom:40px}.mb-48{margin-bottom:48px}
    .mt-16{margin-top:16px}.mt-24{margin-top:24px}.mt-32{margin-top:32px}
    .p-16{padding:16px}.p-24{padding:24px}.p-32{padding:32px}
    .py-8{padding-top:8px;padding-bottom:8px}.py-16{padding-top:16px;padding-bottom:16px}
    .py-24{padding-top:24px;padding-bottom:24px}.px-16{padding-left:16px;padding-right:16px}
    .px-24{padding-left:24px;padding-right:24px}.px-32{padding-left:32px;padding-right:32px}

    /* Components */
    .btn{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:var(--r);font-weight:700;font-size:1rem;cursor:pointer;border:none;transition:all .3s;font-family:'Tajawal',sans-serif;text-decoration:none}
    .btn:hover{transform:translateY(-2px)}
    .btn-p{background:var(--p);color:#fff;box-shadow:0 4px 15px rgba(0,0,0,.15)}
    .btn-p:hover{background:var(--pd);box-shadow:0 8px 25px rgba(0,0,0,.25)}
    .btn-o{background:transparent;border:2px solid var(--p);color:var(--p)}
    .btn-o:hover{background:var(--p);color:#fff}
    .btn-w{background:#fff;color:var(--p);box-shadow:0 4px 15px rgba(0,0,0,.1)}
    .btn-w:hover{box-shadow:0 8px 25px rgba(0,0,0,.2)}
    .btn-a{background:var(--a);color:#fff;box-shadow:0 4px 15px rgba(0,0,0,.15)}
    .btn-a:hover{box-shadow:0 8px 25px rgba(0,0,0,.25)}
    .btn-sm{padding:10px 24px;font-size:.875rem}
    .btn-lg{padding:18px 40px;font-size:1.125rem}

    /* Cards */
    .card{background:var(--cb);border-radius:var(--r);overflow:hidden;transition:all .4s cubic-bezier(.4,0,.2,1);border:1px solid var(--br)}
    .card:hover{transform:translateY(-8px);box-shadow:0 20px 40px rgba(0,0,0,.12)}

    /* Badge */
    .badge{display:inline-block;padding:4px 12px;border-radius:50px;font-size:.75rem;font-weight:600}
    .badge-p{background:var(--p);color:#fff}
    .badge-a{background:var(--a);color:#fff}
    .badge-sale{background:#ff4757;color:#fff}
    .badge-new{background:var(--a);color:#fff}

    /* Navbar */
    .navbar{position:sticky;top:0;z-index:100;background:var(--cb);border-bottom:1px solid var(--br);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px)}
    .navbar-inner{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;max-width:1200px;margin:0 auto}
    .navbar .logo{font-size:1.5rem;font-weight:900;color:var(--p);letter-spacing:-.02em}
    .nav-links{display:flex;gap:32px;align-items:center}
    .nav-links a{color:var(--ts);font-weight:500;font-size:.925rem;transition:color .3s;position:relative}
    .nav-links a:hover{color:var(--p)}
    .nav-links a::after{content:'';position:absolute;bottom:-4px;right:0;width:0;height:2px;background:var(--p);transition:width .3s}
    .nav-links a:hover::after{width:100%}
    .nav-icons{display:flex;gap:16px;align-items:center}
    .nav-icon{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--sfa);color:var(--ts);transition:all .3s;cursor:pointer;border:none;font-size:1.1rem}
    .nav-icon:hover{background:var(--p);color:#fff;transform:scale(1.05)}

    /* Product Card */
    .product-card{background:var(--cb);border-radius:var(--r);overflow:hidden;transition:all .4s cubic-bezier(.4,0,.2,1);border:1px solid var(--br);position:relative}
    .product-card:hover{transform:translateY(-8px);box-shadow:0 20px 40px rgba(0,0,0,.12)}
    .product-img{height:250px;display:flex;align-items:center;justify-content:center;font-size:4rem;position:relative;overflow:hidden}
    .product-img::after{content:'';position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.03),transparent);pointer-events:none}
    .product-info{padding:20px}
    .product-name{font-weight:600;font-size:1rem;margin-bottom:8px;color:var(--tx)}
    .product-price{font-weight:800;font-size:1.2rem;color:var(--p)}
    .product-old-price{font-size:.875rem;color:var(--ts);text-decoration:line-through;margin-right:8px}
    .product-badge{position:absolute;top:12px;right:12px;padding:6px 14px;border-radius:50px;font-size:.75rem;font-weight:700;color:#fff;z-index:1}
    .product-actions{position:absolute;bottom:0;left:0;right:0;padding:12px;display:flex;gap:8px;justify-content:center;opacity:0;transform:translateY(10px);transition:all .3s}
    .product-card:hover .product-actions{opacity:1;transform:translateY(0)}
    .product-action-btn{width:40px;height:40px;border-radius:50%;background:var(--cb);border:1px solid var(--br);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s;font-size:1rem;color:var(--tx)}
    .product-action-btn:hover{background:var(--p);color:#fff;border-color:var(--p)}

    /* Category Card */
    .cat-card{border-radius:var(--r);overflow:hidden;position:relative;cursor:pointer;transition:all .4s}
    .cat-card:hover{transform:translateY(-6px) scale(1.02)}
    .cat-inner{padding:32px 20px;text-align:center;color:#fff;position:relative;z-index:1}
    .cat-emoji{font-size:2.5rem;margin-bottom:12px;display:block}
    .cat-name{font-weight:700;font-size:1.1rem;margin-bottom:4px}
    .cat-count{font-size:.8rem;opacity:.8}

    /* Feature */
    .feature-card{text-align:center;padding:40px 24px;border-radius:var(--r);transition:all .3s;background:var(--cb);border:1px solid var(--br)}
    .feature-card:hover{border-color:var(--p);transform:translateY(-4px)}
    .feature-icon{width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:1.8rem;background:var(--sfa)}
    .feature-title{font-weight:700;font-size:1.1rem;margin-bottom:8px}
    .feature-desc{color:var(--ts);font-size:.9rem;line-height:1.7}

    /* Testimonial */
    .testimonial-card{background:var(--cb);border:1px solid var(--br);border-radius:var(--r);padding:32px;position:relative;transition:all .3s}
    .testimonial-card:hover{border-color:var(--p);transform:translateY(-4px)}
    .testimonial-card::before{content:'"';position:absolute;top:16px;left:24px;font-size:4rem;color:var(--p);opacity:.15;font-family:serif;line-height:1}
    .testimonial-text{font-size:.95rem;line-height:1.8;color:var(--ts);margin-bottom:20px;padding-right:8px}
    .testimonial-author{display:flex;align-items:center;gap:12px}
    .testimonial-avatar{width:44px;height:44px;border-radius:50%;background:var(--p);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem}
    .testimonial-name{font-weight:700;font-size:.925rem}
    .testimonial-role{font-size:.8rem;color:var(--ts)}
    .stars{color:#ffc107;font-size:.9rem;margin-bottom:12px;letter-spacing:2px}

    /* Newsletter */
    .newsletter-box{background:var(--hg);padding:60px 40px;border-radius:var(--r);text-align:center;color:#fff;position:relative;overflow:hidden}
    .newsletter-box::before{content:'';position:absolute;top:-50%;right:-30%;width:60%;height:200%;background:rgba(255,255,255,.05);border-radius:50%;transform:rotate(-15deg)}
    .newsletter-box h3{font-size:1.75rem;font-weight:800;margin-bottom:12px;position:relative;z-index:1}
    .newsletter-box p{opacity:.85;margin-bottom:24px;position:relative;z-index:1}
    .newsletter-form{display:flex;gap:12px;max-width:480px;margin:0 auto;position:relative;z-index:1}
    .newsletter-input{flex:1;padding:14px 20px;border-radius:var(--r);border:none;font-size:1rem;font-family:'Tajawal',sans-serif;outline:none}
    .newsletter-btn{padding:14px 32px;border-radius:var(--r);border:none;font-weight:700;cursor:pointer;font-family:'Tajawal',sans-serif;transition:all .3s}

    /* Stats */
    .stat-item{text-align:center;padding:32px 16px}
    .stat-value{font-size:2.5rem;font-weight:900;color:var(--p);margin-bottom:4px;letter-spacing:-.02em}
    .stat-label{font-size:.9rem;color:var(--ts);font-weight:500}

    /* Hero */
    .hero{position:relative;overflow:hidden}
    .hero-overlay{position:absolute;inset:0;z-index:0}
    .hero-content{position:relative;z-index:1}
    .hero-shapes{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden}
    .hero-circle{position:absolute;border-radius:50%;opacity:.08;background:#fff}
    .hero h1{line-height:1.2;letter-spacing:-.02em}

    /* Banner */
    .promo-banner{background:var(--p);color:#fff;padding:16px 24px;text-align:center;font-weight:600;font-size:.95rem}
    .promo-banner a{color:#fff;text-decoration:underline;margin-right:12px;font-weight:700}

    /* Footer */
    .store-footer{background:var(--sf);border-top:1px solid var(--br);padding:60px 0 24px}
    .footer-grid{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;padding-bottom:40px;border-bottom:1px solid var(--br)}
    .footer-brand .logo{font-size:1.5rem;font-weight:900;color:var(--p);margin-bottom:12px;display:block}
    .footer-brand p{color:var(--ts);font-size:.9rem;line-height:1.8;margin-bottom:20px}
    .footer-col h4{font-weight:700;margin-bottom:16px;color:var(--tx)}
    .footer-col a{display:block;color:var(--ts);font-size:.9rem;margin-bottom:10px;transition:color .3s}
    .footer-col a:hover{color:var(--p)}
    .footer-social{display:flex;gap:12px;margin-top:8px}
    .social-icon{width:40px;height:40px;border-radius:50%;background:var(--sfa);display:flex;align-items:center;justify-content:center;transition:all .3s;cursor:pointer;font-size:1.1rem;color:var(--ts)}
    .social-icon:hover{background:var(--p);color:#fff;transform:translateY(-2px)}
    .footer-bottom{padding-top:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px}
    .footer-bottom p{color:var(--ts);font-size:.85rem}
    .payment-icons{display:flex;gap:12px;align-items:center}
    .payment-icon{padding:6px 14px;border-radius:8px;background:var(--sfa);font-size:.8rem;font-weight:600;color:var(--ts)}

    /* CTA Section */
    .cta-section{background:var(--hg);padding:80px 40px;text-align:center;color:#fff;position:relative;overflow:hidden;border-radius:var(--r)}
    .cta-section::before{content:'';position:absolute;top:-50%;left:-30%;width:60%;height:200%;background:rgba(255,255,255,.04);border-radius:50%}
    .cta-section h2{font-size:2.25rem;font-weight:800;margin-bottom:16px;position:relative;z-index:1}
    .cta-section p{font-size:1.1rem;opacity:.85;margin-bottom:32px;position:relative;z-index:1}

    /* Offers */
    .offer-card{border-radius:var(--r);padding:32px;position:relative;overflow:hidden;color:#fff;transition:all .4s}
    .offer-card:hover{transform:translateY(-6px);box-shadow:0 20px 40px rgba(0,0,0,.2)}
    .offer-tag{position:absolute;top:16px;left:16px;background:rgba(255,255,255,.2);backdrop-filter:blur(10px);padding:6px 16px;border-radius:50px;font-size:.8rem;font-weight:700}
    .offer-emoji{font-size:3rem;margin-bottom:16px;display:block}
    .offer-title{font-size:1.25rem;font-weight:800;margin-bottom:8px}
    .offer-desc{font-size:.9rem;opacity:.85;margin-bottom:20px}
    .offer-price{font-size:1.8rem;font-weight:900;margin-bottom:4px}

    /* Countdown */
    .countdown-section{background:var(--hg);padding:60px;border-radius:var(--r);text-align:center;color:#fff;position:relative;overflow:hidden}
    .countdown-grid{display:flex;justify-content:center;gap:24px;margin:32px 0}
    .countdown-item{background:rgba(255,255,255,.15);backdrop-filter:blur(10px);padding:20px 28px;border-radius:16px;min-width:90px}
    .countdown-value{font-size:2.5rem;font-weight:900;display:block;line-height:1}
    .countdown-label{font-size:.8rem;opacity:.7;margin-top:4px}

    /* FAQ */
    .faq-item{border:1px solid var(--br);border-radius:var(--r);overflow:hidden;margin-bottom:12px;transition:all .3s}
    .faq-item:hover{border-color:var(--p)}
    .faq-q{padding:20px 24px;font-weight:700;cursor:pointer;display:flex;justify-content:space-between;align-items:center;background:var(--cb)}
    .faq-a{padding:0 24px 20px;color:var(--ts);line-height:1.8;display:block}
    .faq-icon{transition:transform .3s;font-size:1.2rem;color:var(--p)}

    /* Trust Badges */
    .trust-badges{display:flex;justify-content:center;gap:40px;padding:24px;flex-wrap:wrap}
    .trust-badge{display:flex;align-items:center;gap:10px;color:var(--ts);font-size:.9rem;font-weight:500}
    .trust-badge-icon{font-size:1.5rem}

    /* Gallery  */
    .gallery-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
    .gallery-item{border-radius:var(--r);overflow:hidden;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:3rem;transition:all .4s;cursor:pointer}
    .gallery-item:hover{transform:scale(1.05);box-shadow:0 12px 30px rgba(0,0,0,.15)}

    /* Brands */
    .brands-row{display:flex;justify-content:center;align-items:center;gap:48px;flex-wrap:wrap;padding:40px 0}
    .brand-item{padding:16px 32px;border-radius:12px;background:var(--sfa);font-weight:700;font-size:1.1rem;color:var(--ts);transition:all .3s;white-space:nowrap}
    .brand-item:hover{color:var(--p);transform:translateY(-2px)}

    /* Contact */
    .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px}
    .contact-info-item{display:flex;align-items:flex-start;gap:16px;margin-bottom:24px}
    .contact-icon{width:48px;height:48px;border-radius:12px;background:var(--sfa);display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0}
    .contact-form input,.contact-form textarea{width:100%;padding:14px 20px;border-radius:var(--r);border:1px solid var(--br);background:var(--cb);color:var(--tx);font-family:'Tajawal',sans-serif;font-size:1rem;margin-bottom:12px;outline:none;transition:border-color .3s}
    .contact-form input:focus,.contact-form textarea:focus{border-color:var(--p)}
    .contact-form textarea{height:120px;resize:vertical}

    /* Scroll Animations */
    [data-anim]{opacity:0;transform:translateY(30px);transition:all .7s cubic-bezier(.4,0,.2,1)}
    [data-anim].visible{opacity:1;transform:translateY(0)}

    /* Section Title */
    .section-header{text-align:center;margin-bottom:48px}
    .section-header h2{font-size:2rem;font-weight:800;margin-bottom:12px;letter-spacing:-.01em}
    .section-header p{color:var(--ts);font-size:1.05rem;max-width:600px;margin:0 auto}
    .section-header .line{width:60px;height:4px;background:var(--p);border-radius:2px;margin:16px auto 0}

    /* Responsive */
    @media(max-width:1024px){
      .grid-4{grid-template-columns:repeat(2,1fr)}
      .grid-6{grid-template-columns:repeat(3,1fr)}
      .footer-grid{grid-template-columns:1fr 1fr}
      .contact-grid{grid-template-columns:1fr}
      .text-5xl{font-size:2.5rem}
      .text-4xl{font-size:2rem}
    }
    @media(max-width:768px){
      .section{padding:50px 0}
      .grid-2,.grid-3,.grid-4{grid-template-columns:1fr}
      .grid-6{grid-template-columns:repeat(2,1fr)}
      .nav-links{display:none}
      .newsletter-form{flex-direction:column}
      .hero{padding:60px 0!important}
      .footer-grid{grid-template-columns:1fr}
      .gallery-grid{grid-template-columns:repeat(2,1fr)}
      .countdown-grid{gap:12px}
      .countdown-item{padding:14px 18px;min-width:60px}
      .countdown-value{font-size:1.8rem}
      .trust-badges{gap:20px}
      .brands-row{gap:20px}
      .flex-mobile-col{flex-direction:column}
    }
    @media(max-width:480px){
      .grid-6{grid-template-columns:1fr 1fr}
      .container{padding:0 16px}
      .text-4xl{font-size:1.75rem}
      .text-3xl{font-size:1.5rem}
    }
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// Section Renderers
// ═══════════════════════════════════════════════════════════════════════════

function renderNavbar(props: Record<string, any>, storeName: string): string {
  const links = props.links || [
    "الرئيسية",
    "المنتجات",
    "العروض",
    "من نحن",
    "تواصل معنا",
  ];
  const cta = props.cta || "تسوق الآن";
  return `
  <nav class="navbar" data-section-type="navbar">
    <div class="navbar-inner">
      <span class="logo">${storeName}</span>
      <div class="nav-links">
        ${links.map((l: string) => `<a href="#">${l}</a>`).join("")}
      </div>
      <div class="nav-icons">
        <button class="nav-icon" title="بحث">🔍</button>
        <button class="nav-icon" title="المفضلة">♡</button>
        <button class="nav-icon" title="السلة">🛒</button>
        <a href="#" class="btn btn-p btn-sm" style="margin-right:8px">${cta}</a>
      </div>
    </div>
  </nav>`;
}

function renderHero(props: Record<string, any>, storeName: string): string {
  const title = props.title || `مرحباً بكم في ${storeName}`;
  const subtitle =
    props.subtitle ||
    "اكتشفوا تشكيلتنا الفريدة من أفضل المنتجات بأسعار لا تُقاوم";
  const cta = props.cta || "تسوق الآن";
  const cta2 = props.cta2 || "اكتشف المزيد";
  const height = props.height || "500px";
  return `
  <section class="hero" style="background:var(--hg);padding:0" data-section-type="hero" data-anim>
    <div class="hero-shapes">
      <div class="hero-circle" style="width:300px;height:300px;top:-80px;left:-80px"></div>
      <div class="hero-circle" style="width:200px;height:200px;bottom:-50px;right:10%"></div>
      <div class="hero-circle" style="width:150px;height:150px;top:30%;right:5%"></div>
    </div>
    <div class="hero-content" style="min-height:${height};display:flex;align-items:center">
      <div class="container" style="width:100%">
        <div style="max-width:700px">
          <div class="badge badge-p mb-16" style="background:rgba(255,255,255,.15);backdrop-filter:blur(10px);color:#fff">✨ ${props.badge || "وصل حديثاً — مجموعة 2026"}</div>
          <h1 class="text-5xl font-black mb-24" style="color:#fff">${title}</h1>
          <p class="text-lg mb-32" style="color:rgba(255,255,255,.85);max-width:540px;line-height:1.8">${subtitle}</p>
          <div class="flex gap-16 flex-wrap">
            <a href="#products" class="btn btn-w btn-lg">${cta} ←</a>
            <a href="#features" class="btn btn-lg" style="background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.25);backdrop-filter:blur(10px)">${cta2}</a>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function renderHeroSplit(
  props: Record<string, any>,
  storeName: string,
): string {
  const title = props.title || `اكتشف ${storeName}`;
  const subtitle =
    props.subtitle || "تشكيلة حصرية تجمع بين الأناقة والجودة العالية";
  const emoji = props.emoji || "🛍️";
  return `
  <section class="section" style="background:var(--sf)" data-section-type="hero-split" data-anim>
    <div class="container">
      <div class="grid grid-2 items-center" style="min-height:400px">
        <div>
          <div class="badge badge-a mb-16">🔥 عرض محدود</div>
          <h1 class="text-4xl font-black mb-16 leading-tight">${title}</h1>
          <p class="text-lg text-sec mb-32 leading-relaxed" style="max-width:460px">${subtitle}</p>
          <div class="flex gap-12">
            <a href="#" class="btn btn-p">تسوق الآن ←</a>
            <a href="#" class="btn btn-o">شاهد الفيديو ▶</a>
          </div>
          <div class="trust-badges" style="justify-content:flex-start;padding:32px 0 0;gap:24px">
            <span class="trust-badge"><span class="trust-badge-icon">🚚</span> شحن مجاني</span>
            <span class="trust-badge"><span class="trust-badge-icon">🔒</span> دفع آمن</span>
            <span class="trust-badge"><span class="trust-badge-icon">↩️</span> إرجاع سهل</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:center">
          <div style="width:380px;height:380px;border-radius:50%;background:var(--hg);display:flex;align-items:center;justify-content:center;font-size:8rem;box-shadow:0 40px 80px rgba(0,0,0,.15)">
            ${emoji}
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function renderTrustBadges(_props: Record<string, any>): string {
  return `
  <section style="background:var(--sf);border-bottom:1px solid var(--br)" data-section-type="trust-badges" data-anim>
    <div class="container">
      <div class="trust-badges">
        <span class="trust-badge"><span class="trust-badge-icon">🚚</span> شحن مجاني للطلبات فوق 200 ر.س</span>
        <span class="trust-badge"><span class="trust-badge-icon">🔒</span> دفع آمن 100%</span>
        <span class="trust-badge"><span class="trust-badge-icon">↩️</span> إرجاع خلال 14 يوم</span>
        <span class="trust-badge"><span class="trust-badge-icon">💬</span> دعم فني 24/7</span>
        <span class="trust-badge"><span class="trust-badge-icon">✅</span> منتجات أصلية</span>
      </div>
    </div>
  </section>`;
}

function renderCategories(
  props: Record<string, any>,
  storeType: string,
): string {
  const categories =
    props.categories || CATEGORY_SETS[storeType] || CATEGORY_SETS.general;
  return `
  <section class="section" id="categories" data-section-type="categories" data-anim>
    <div class="container">
      <div class="section-header">
        <h2>${props.title || "تسوق حسب القسم"}</h2>
        <p>${props.subtitle || "اختر من تشكيلتنا المتنوعة"}</p>
        <div class="line"></div>
      </div>
      <div class="grid grid-6 gap-16">
        ${(categories as CategoryData[])
          .map(
            (cat: CategoryData) => `
          <div class="cat-card" style="background:${cat.gradient}">
            <div class="cat-inner">
              <span class="cat-emoji">${cat.emoji}</span>
              <div class="cat-name">${cat.name}</div>
              <div class="cat-count">${cat.count} منتج</div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  </section>`;
}

function renderProducts(props: Record<string, any>, storeType: string): string {
  const products =
    props.products || PRODUCT_SETS[storeType] || PRODUCT_SETS.general;
  const count = props.count || 8;
  const displayProducts = (products as ProductData[]).slice(0, count);
  return `
  <section class="section" id="products" data-section-type="products" data-anim>
    <div class="container">
      <div class="section-header">
        <h2>${props.title || "منتجات مميزة"}</h2>
        <p>${props.subtitle || "اكتشف أحدث المنتجات المختارة بعناية"}</p>
        <div class="line"></div>
      </div>
      <div class="grid grid-4">
        ${displayProducts
          .map(
            (p: ProductData) => `
          <div class="product-card">
            ${p.badge ? `<span class="product-badge" style="background:${p.badge.includes("خصم") ? "#ff4757" : "var(--a)"}">${p.badge}</span>` : ""}
            <div class="product-img" style="background:${p.gradient}">
              ${p.emoji}
              <div class="product-actions">
                <button class="product-action-btn" title="أضف للسلة">🛒</button>
                <button class="product-action-btn" title="المفضلة">♡</button>
                <button class="product-action-btn" title="معاينة">👁</button>
              </div>
            </div>
            <div class="product-info">
              <div class="product-name">${p.name}</div>
              <div class="flex items-center gap-8">
                <span class="product-price">${p.price} ر.س</span>
                ${p.oldPrice ? `<span class="product-old-price">${p.oldPrice} ر.س</span>` : ""}
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
      <div class="text-center mt-32">
        <a href="#" class="btn btn-o">عرض جميع المنتجات ←</a>
      </div>
    </div>
  </section>`;
}

function renderProductsFeatured(
  props: Record<string, any>,
  storeType: string,
): string {
  const products =
    props.products || PRODUCT_SETS[storeType] || PRODUCT_SETS.general;
  const main = (products as ProductData[])[0];
  const side = (products as ProductData[]).slice(1, 4);
  return `
  <section class="section" data-section-type="products-featured" data-anim>
    <div class="container">
      <div class="section-header">
        <h2>${props.title || "منتج مميز"}</h2>
        <p>${props.subtitle || "اختيارنا لهذا الأسبوع"}</p>
        <div class="line"></div>
      </div>
      <div class="grid grid-2 items-center" style="gap:40px">
        <div class="card" style="padding:0;overflow:hidden">
          <div style="height:400px;background:${main.gradient};display:flex;align-items:center;justify-content:center;font-size:6rem;position:relative">
            ${main.emoji}
            ${main.badge ? `<span class="product-badge" style="background:var(--a)">${main.badge}</span>` : ""}
          </div>
        </div>
        <div>
          <div class="badge badge-a mb-16">${main.badge || "⭐ اختيار المحرر"}</div>
          <h3 class="text-3xl font-black mb-12">${main.name}</h3>
          <p class="text-sec mb-24 leading-relaxed" style="font-size:1.05rem">منتج استثنائي بجودة فائقة. مصمم بعناية لتلبية أعلى المعايير وتجاوز توقعاتك. احصل عليه الآن واستمتع بتجربة فريدة.</p>
          <div class="flex items-center gap-16 mb-24">
            <span class="text-3xl font-black text-primary">${main.price} ر.س</span>
            ${main.oldPrice ? `<span class="text-xl text-sec" style="text-decoration:line-through">${main.oldPrice} ر.س</span>` : ""}
          </div>
          <a href="#" class="btn btn-p btn-lg">أضف للسلة 🛒</a>
          <div class="grid grid-3 mt-32" style="gap:16px">
            ${side
              .map(
                (p: ProductData) => `
              <div class="card" style="cursor:pointer">
                <div style="height:100px;background:${p.gradient};display:flex;align-items:center;justify-content:center;font-size:2rem">${p.emoji}</div>
                <div class="p-16">
                  <div style="font-size:.85rem;font-weight:600;margin-bottom:4px">${p.name}</div>
                  <div class="text-primary font-bold">${p.price} ر.س</div>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function renderFeatures(props: Record<string, any>, storeType: string): string {
  const defaultFeatures: Record<string, FeatureData[]> = {
    fashion: [
      {
        icon: "🚚",
        title: "شحن مجاني",
        desc: "توصيل مجاني لجميع الطلبات فوق 200 ر.س في المملكة",
      },
      {
        icon: "↩️",
        title: "إرجاع سهل",
        desc: "إرجاع مجاني خلال 14 يوم بدون أي أسئلة",
      },
      {
        icon: "✅",
        title: "أصلية 100%",
        desc: "جميع منتجاتنا أصلية مع شهادة ضمان معتمدة",
      },
      {
        icon: "💳",
        title: "دفع مرن",
        desc: "ادفع بالبطاقة أو مدى أو أبل باي أو تقسيط",
      },
    ],
    electronics: [
      {
        icon: "🔧",
        title: "ضمان سنتين",
        desc: "ضمان شامل على جميع الأجهزة مع صيانة مجانية",
      },
      {
        icon: "💬",
        title: "دعم فني 24/7",
        desc: "فريق دعم متخصص يساعدك في أي وقت",
      },
      {
        icon: "🚀",
        title: "توصيل سريع",
        desc: "توصيل خلال 24 ساعة داخل المدن الرئيسية",
      },
      {
        icon: "💰",
        title: "أقساط بدون فوائد",
        desc: "تقسيط مريح حتى 12 شهر بدون أي فوائد",
      },
    ],
    beauty: [
      {
        icon: "🌿",
        title: "مكونات طبيعية",
        desc: "منتجات مصنوعة من أجود المكونات الطبيعية",
      },
      {
        icon: "🎁",
        title: "عينات مجانية",
        desc: "احصلي على عينات مجانية مع كل طلب",
      },
      {
        icon: "👩‍⚕️",
        title: "نصائح خبراء",
        desc: "استشارات مجانية من خبراء التجميل والعناية",
      },
      {
        icon: "📦",
        title: "تغليف فاخر",
        desc: "تغليف احترافي يليق بجمال منتجاتنا",
      },
    ],
    food: [
      {
        icon: "🕐",
        title: "توصيل 30 دقيقة",
        desc: "طلبك يوصلك خلال 30 دقيقة أو أقل",
      },
      {
        icon: "🌿",
        title: "مكونات طازجة",
        desc: "نستخدم أفضل المكونات الطازجة يومياً",
      },
      {
        icon: "👨‍🍳",
        title: "طهاة محترفون",
        desc: "طهاة بخبرة عالمية يعدون وجباتك بعناية",
      },
      {
        icon: "♻️",
        title: "تغليف صديق للبيئة",
        desc: "عبوات قابلة لإعادة التدوير بنسبة 100%",
      },
    ],
    default: [
      {
        icon: "🚚",
        title: "شحن سريع",
        desc: "توصيل سريع لجميع المناطق في المملكة",
      },
      {
        icon: "🔒",
        title: "دفع آمن",
        desc: "حماية كاملة لبياناتك المالية مع أحدث تقنيات التشفير",
      },
      {
        icon: "↩️",
        title: "استرجاع مجاني",
        desc: "إرجاع مجاني خلال 14 يوم بدون أي شروط",
      },
      {
        icon: "💬",
        title: "دعم متواصل",
        desc: "فريق خدمة عملاء متاح على مدار الساعة",
      },
    ],
  };
  const features =
    props.features || defaultFeatures[storeType] || defaultFeatures.default;
  return `
  <section class="section" id="features" style="background:var(--sf)" data-section-type="features" data-anim>
    <div class="container">
      <div class="section-header">
        <h2>${props.title || "لماذا تختارنا؟"}</h2>
        <p>${props.subtitle || "نقدم لك تجربة تسوق لا مثيل لها"}</p>
        <div class="line"></div>
      </div>
      <div class="grid grid-4">
        ${(features as FeatureData[])
          .map(
            (f: FeatureData) => `
          <div class="feature-card">
            <div class="feature-icon">${f.icon}</div>
            <div class="feature-title">${f.title}</div>
            <div class="feature-desc">${f.desc}</div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  </section>`;
}

function renderTestimonials(props: Record<string, any>): string {
  const testimonials = props.testimonials || TESTIMONIALS_DATA.slice(0, 3);
  return `
  <section class="section" data-section-type="testimonials" data-anim>
    <div class="container">
      <div class="section-header">
        <h2>${props.title || "آراء عملائنا"}</h2>
        <p>${props.subtitle || "ثقة أكثر من 10,000 عميل سعيد"}</p>
        <div class="line"></div>
      </div>
      <div class="grid grid-3">
        ${(testimonials as TestimonialData[])
          .map(
            (t: TestimonialData) => `
          <div class="testimonial-card">
            <div class="stars">${"★".repeat(t.rating)}${"☆".repeat(5 - t.rating)}</div>
            <div class="testimonial-text">${t.text}</div>
            <div class="testimonial-author">
              <div class="testimonial-avatar">${t.initials}</div>
              <div>
                <div class="testimonial-name">${t.name}</div>
                <div class="testimonial-role">${t.role}</div>
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  </section>`;
}

function renderNewsletter(props: Record<string, any>): string {
  return `
  <section class="section-sm" data-section-type="newsletter" data-anim>
    <div class="container">
      <div class="newsletter-box">
        <h3>${props.title || "اشترك في نشرتنا البريدية"}</h3>
        <p>${props.subtitle || "احصل على أحدث العروض والمنتجات الجديدة مباشرة في بريدك"}</p>
        <div class="newsletter-form">
          <input type="email" class="newsletter-input" placeholder="أدخل بريدك الإلكتروني" dir="rtl">
          <button class="newsletter-btn btn-w">${props.btnText || "اشترك الآن"}</button>
        </div>
      </div>
    </div>
  </section>`;
}

function renderBanner(props: Record<string, any>): string {
  return `
  <div class="promo-banner" data-section-type="banner">
    ${props.emoji || "🎉"} ${props.text || "خصم 30% على جميع المنتجات — استخدم كود: SAVE30"}
    <a href="#">تسوق الآن</a>
  </div>`;
}

function renderStats(props: Record<string, any>): string {
  const stats = props.stats || [
    { value: "+10K", label: "عميل سعيد" },
    { value: "+500", label: "منتج متوفر" },
    { value: "+50K", label: "طلب منجز" },
    { value: "4.9", label: "تقييم العملاء" },
  ];
  return `
  <section class="section-sm" style="background:var(--sf)" data-section-type="stats" data-anim>
    <div class="container">
      <div class="grid grid-4">
        ${(stats as Array<{ value: string; label: string }>)
          .map(
            (s) => `
          <div class="stat-item">
            <div class="stat-value">${s.value}</div>
            <div class="stat-label">${s.label}</div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  </section>`;
}

function renderBrands(props: Record<string, any>): string {
  const brands = props.brands || [
    "Apple",
    "Samsung",
    "Nike",
    "Adidas",
    "Chanel",
    "Dior",
    "Gucci",
    "Louis Vuitton",
  ];
  return `
  <section class="section-sm" data-section-type="brands" data-anim>
    <div class="container">
      <div class="section-header">
        <h2>${props.title || "علاماتنا التجارية"}</h2>
        <div class="line"></div>
      </div>
      <div class="brands-row">
        ${(brands as string[]).map((b: string) => `<span class="brand-item">${b}</span>`).join("")}
      </div>
    </div>
  </section>`;
}

function renderOffers(props: Record<string, any>): string {
  const offers = props.offers || [
    {
      emoji: "🔥",
      title: "تخفيضات الموسم",
      desc: "خصومات تصل حتى 50% على آخر مجموعة",
      tag: "عرض محدود",
      price: "يبدأ من 99 ر.س",
      gradient: "linear-gradient(135deg, #e74c3c, #c0392b)",
    },
    {
      emoji: "⭐",
      title: "منتجات VIP",
      desc: "منتجات حصرية لأعضاء النادي فقط",
      tag: "حصري",
      price: "يبدأ من 199 ر.س",
      gradient: "linear-gradient(135deg, #8e44ad, #6c3483)",
    },
    {
      emoji: "🎁",
      title: "اشترِ 2 واحصل على 1",
      desc: "عرض خاص على منتجات مختارة",
      tag: "أكثر توفيراً",
      price: "وفر حتى 300 ر.س",
      gradient: "linear-gradient(135deg, #27ae60, #1e8449)",
    },
  ];
  return `
  <section class="section" data-section-type="offers" data-anim>
    <div class="container">
      <div class="section-header">
        <h2>${props.title || "🔥 عروض لا تفوّت"}</h2>
        <p>${props.subtitle || "عروض محدودة — اغتنم الفرصة قبل النفاد"}</p>
        <div class="line"></div>
      </div>
      <div class="grid grid-3">
        ${(offers as any[])
          .map(
            (o) => `
          <div class="offer-card" style="background:${o.gradient}">
            <span class="offer-tag">${o.tag}</span>
            <span class="offer-emoji">${o.emoji}</span>
            <div class="offer-title">${o.title}</div>
            <div class="offer-desc">${o.desc}</div>
            <div class="offer-price">${o.price}</div>
            <a href="#" class="btn btn-w btn-sm mt-16">اكتشف العرض ←</a>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  </section>`;
}

function renderCountdown(props: Record<string, any>): string {
  return `
  <section class="section-sm" data-section-type="countdown" data-anim>
    <div class="container">
      <div class="countdown-section">
        <div class="badge" style="background:rgba(255,255,255,.15);color:#fff;backdrop-filter:blur(10px);margin-bottom:16px;display:inline-block">⏰ عرض لفترة محدودة</div>
        <h2 class="text-3xl font-black mb-8">${props.title || "تخفيضات نهاية الموسم"}</h2>
        <p class="opacity-80">${props.subtitle || "خصم يصل إلى 70% — ينتهي قريباً!"}</p>
        <div class="countdown-grid">
          <div class="countdown-item"><span class="countdown-value">03</span><span class="countdown-label">أيام</span></div>
          <div class="countdown-item"><span class="countdown-value">12</span><span class="countdown-label">ساعة</span></div>
          <div class="countdown-item"><span class="countdown-value">45</span><span class="countdown-label">دقيقة</span></div>
          <div class="countdown-item"><span class="countdown-value">28</span><span class="countdown-label">ثانية</span></div>
        </div>
        <a href="#" class="btn btn-w btn-lg">تسوق العروض الآن ←</a>
      </div>
    </div>
  </section>`;
}

function renderGallery(props: Record<string, any>, storeType: string): string {
  const emojis: Record<string, string[]> = {
    fashion: ["👗", "👠", "👜", "💍", "⌚", "🧥", "👔", "🕶️"],
    beauty: ["🌹", "💄", "✨", "🌸", "🧴", "🎀", "💅", "🪞"],
    food: ["🍔", "🍕", "🥗", "🍰", "☕", "🍣", "🥤", "🍝"],
    default: ["📸", "🎨", "🌟", "💫", "🎪", "🌈", "🎭", "✨"],
  };
  const icons = emojis[storeType] || emojis.default;
  const gradients = [
    "linear-gradient(135deg, #667eea, #764ba2)",
    "linear-gradient(135deg, #f093fb, #f5576c)",
    "linear-gradient(135deg, #4facfe, #00f2fe)",
    "linear-gradient(135deg, #43e97b, #38f9d7)",
    "linear-gradient(135deg, #fa709a, #fee140)",
    "linear-gradient(135deg, #a18cd1, #fbc2eb)",
    "linear-gradient(135deg, #fccb90, #d57eeb)",
    "linear-gradient(135deg, #e0c3fc, #8ec5fc)",
  ];
  return `
  <section class="section" data-section-type="gallery" data-anim>
    <div class="container">
      <div class="section-header">
        <h2>${props.title || "📸 معرض الصور"}</h2>
        <p>${props.subtitle || "لمحات من أجمل منتجاتنا"}</p>
        <div class="line"></div>
      </div>
      <div class="gallery-grid">
        ${icons
          .map(
            (icon: string, i: number) => `
          <div class="gallery-item" style="background:${gradients[i]}">
            ${icon}
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  </section>`;
}

function renderCTA(props: Record<string, any>): string {
  return `
  <section class="section-sm" data-section-type="cta" data-anim>
    <div class="container">
      <div class="cta-section">
        <h2>${props.title || "جاهز تبدأ التسوق؟"}</h2>
        <p>${props.subtitle || "آلاف المنتجات بانتظارك — ابدأ الآن واستمتع بعروض حصرية"}</p>
        <div class="flex justify-center gap-16" style="position:relative;z-index:1">
          <a href="#" class="btn btn-w btn-lg">${props.cta || "تسوق الآن"} ←</a>
          <a href="#" class="btn btn-lg" style="background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3)">${props.cta2 || "تواصل معنا"}</a>
        </div>
      </div>
    </div>
  </section>`;
}

function renderFAQ(props: Record<string, any>): string {
  const faqs = props.items || [
    {
      q: "كم مدة التوصيل؟",
      a: "التوصيل داخل المدن الرئيسية خلال 24 ساعة، وباقي المناطق خلال 2-5 أيام عمل. نوفر أيضاً خيار التوصيل السريع.",
    },
    {
      q: "هل يمكنني إرجاع المنتج؟",
      a: "نعم، يمكنك إرجاع أي منتج خلال 14 يوم من تاريخ الاستلام بدون أي شروط. سنقوم بإرسال مندوب لاستلام المنتج.",
    },
    {
      q: "ما طرق الدفع المتاحة؟",
      a: "نقبل الدفع بالبطاقات البنكية (فيزا/ماستركارد)، مدى، أبل باي، تحويل بنكي، والدفع عند الاستلام في بعض المناطق.",
    },
    {
      q: "هل المنتجات أصلية؟",
      a: "جميع منتجاتنا أصلية 100% ومستوردة مباشرة من الشركات المصنعة. نقدم شهادة أصالة مع كل منتج.",
    },
    {
      q: "كيف أتابع طلبي؟",
      a: 'بعد تأكيد طلبك، ستصلك رسالة على الإيميل والجوال تحتوي رقم التتبع. يمكنك متابعة حالة طلبك من صفحة "طلباتي" أو عبر رابط التتبع.',
    },
  ];
  return `
  <section class="section" style="background:var(--sf)" data-section-type="faq" data-anim>
    <div class="container" style="max-width:800px">
      <div class="section-header">
        <h2>${props.title || "الأسئلة الشائعة"}</h2>
        <p>${props.subtitle || "إجابات لأكثر الأسئلة شيوعاً"}</p>
        <div class="line"></div>
      </div>
      ${(faqs as any[])
        .map(
          (f) => `
        <div class="faq-item">
          <div class="faq-q">
            <span>${f.q}</span>
            <span class="faq-icon">+</span>
          </div>
          <div class="faq-a">${f.a}</div>
        </div>
      `,
        )
        .join("")}
    </div>
  </section>`;
}

function renderContact(props: Record<string, any>, storeName: string): string {
  return `
  <section class="section" data-section-type="contact" data-anim>
    <div class="container">
      <div class="section-header">
        <h2>${props.title || "تواصل معنا"}</h2>
        <p>${props.subtitle || "نسعد بخدمتك — تواصل معنا في أي وقت"}</p>
        <div class="line"></div>
      </div>
      <div class="contact-grid">
        <div>
          <div class="contact-info-item">
            <div class="contact-icon">📍</div>
            <div><strong>العنوان</strong><br><span class="text-sec">الرياض، المملكة العربية السعودية</span></div>
          </div>
          <div class="contact-info-item">
            <div class="contact-icon">📧</div>
            <div><strong>البريد الإلكتروني</strong><br><span class="text-sec">info@${storeName.replace(/\s+/g, "").toLowerCase()}.com</span></div>
          </div>
          <div class="contact-info-item">
            <div class="contact-icon">📞</div>
            <div><strong>الهاتف</strong><br><span class="text-sec" dir="ltr">+966 50 000 0000</span></div>
          </div>
          <div class="contact-info-item">
            <div class="contact-icon">⏰</div>
            <div><strong>أوقات العمل</strong><br><span class="text-sec">السبت - الخميس: 9 صباحاً - 10 مساءً</span></div>
          </div>
        </div>
        <div class="contact-form">
          <div class="grid grid-2" style="gap:12px">
            <input type="text" placeholder="الاسم الكامل" dir="rtl">
            <input type="email" placeholder="البريد الإلكتروني" dir="rtl">
          </div>
          <input type="text" placeholder="الموضوع" dir="rtl">
          <textarea placeholder="رسالتك..." dir="rtl"></textarea>
          <button class="btn btn-p" style="width:100%">إرسال الرسالة ✉️</button>
        </div>
      </div>
    </div>
  </section>`;
}

function renderFooter(_props: Record<string, any>, storeName: string): string {
  return `
  <footer class="store-footer" data-section-type="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <span class="logo">${storeName}</span>
          <p>نسعى لتقديم أفضل تجربة تسوق إلكتروني في المملكة العربية السعودية. نختار لكم أجود المنتجات بعناية فائقة.</p>
          <div class="footer-social">
            <span class="social-icon">𝕏</span>
            <span class="social-icon">📷</span>
            <span class="social-icon">📘</span>
            <span class="social-icon">▶</span>
            <span class="social-icon">💬</span>
          </div>
        </div>
        <div class="footer-col">
          <h4>المتجر</h4>
          <a href="#">جميع المنتجات</a>
          <a href="#">المجموعات</a>
          <a href="#">العروض</a>
          <a href="#">وصل حديثاً</a>
          <a href="#">الأكثر مبيعاً</a>
        </div>
        <div class="footer-col">
          <h4>خدمة العملاء</h4>
          <a href="#">تتبع الطلب</a>
          <a href="#">سياسة الإرجاع</a>
          <a href="#">الشحن والتوصيل</a>
          <a href="#">الأسئلة الشائعة</a>
          <a href="#">تواصل معنا</a>
        </div>
        <div class="footer-col">
          <h4>عن المتجر</h4>
          <a href="#">من نحن</a>
          <a href="#">سياسة الخصوصية</a>
          <a href="#">الشروط والأحكام</a>
          <a href="#">وظائف</a>
          <a href="#">المدونة</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 ${storeName} — جميع الحقوق محفوظة ❤️</p>
        <div class="payment-icons">
          <span class="payment-icon">💳 Visa</span>
          <span class="payment-icon">💳 Mastercard</span>
          <span class="payment-icon">🏦 مدى</span>
          <span class="payment-icon">🍎 Apple Pay</span>
          <span class="payment-icon">💵 كاش</span>
        </div>
      </div>
    </div>
  </footer>`;
}

function renderSpacer(_props: Record<string, any>): string {
  return `<div style="height:40px" data-section-type="spacer"></div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Section Router
// ═══════════════════════════════════════════════════════════════════════════

function renderSection(
  section: SectionConfig,
  storeName: string,
  storeType: string,
): string {
  const p = section.props || {};
  switch (section.type) {
    case "navbar":
      return renderNavbar(p, storeName);
    case "hero":
      return renderHero(p, storeName);
    case "hero-split":
      return renderHeroSplit(p, storeName);
    case "trust-badges":
      return renderTrustBadges(p);
    case "categories":
      return renderCategories(p, storeType);
    case "products":
      return renderProducts(p, storeType);
    case "products-featured":
      return renderProductsFeatured(p, storeType);
    case "features":
      return renderFeatures(p, storeType);
    case "testimonials":
      return renderTestimonials(p);
    case "newsletter":
      return renderNewsletter(p);
    case "banner":
      return renderBanner(p);
    case "stats":
      return renderStats(p);
    case "brands":
      return renderBrands(p);
    case "offers":
      return renderOffers(p);
    case "countdown":
      return renderCountdown(p);
    case "gallery":
      return renderGallery(p, storeType);
    case "cta":
      return renderCTA(p);
    case "faq":
      return renderFAQ(p);
    case "contact":
      return renderContact(p, storeName);
    case "footer":
      return renderFooter(p, storeName);
    case "footer-rich":
      return renderFooter(p, storeName);
    case "spacer":
      return renderSpacer(p);
    default:
      return `<!-- Unknown section: ${section.type} -->`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Assembly
// ═══════════════════════════════════════════════════════════════════════════

export function generateStoreHTML(
  storeName: string,
  storeType: string,
  theme: StoreTheme,
  sections: SectionConfig[],
): string {
  const css = generateBaseCSS(theme);
  const body = sections
    .map((s) => renderSection(s, storeName, storeType))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${storeName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet">
  <style>${css}</style>
</head>
<body>
${body}
<script>
  // Scroll animation observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-anim]').forEach(el => observer.observe(el));

  // FAQ toggle
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const answer = item.querySelector('.faq-a');
      const icon = q.querySelector('.faq-icon');
      const isOpen = answer.style.display !== 'none';
      document.querySelectorAll('.faq-a').forEach(a => a.style.display = 'none');
      document.querySelectorAll('.faq-icon').forEach(i => i.textContent = '+');
      if (!isOpen) {
        answer.style.display = 'block';
        icon.textContent = '−';
      } else {
        answer.style.display = 'none';
        icon.textContent = '+';
      }
    });
  });
  // Initialize FAQ: hide all answers
  document.querySelectorAll('.faq-a').forEach(a => a.style.display = 'none');
</script>
</body>
</html>`;
}
