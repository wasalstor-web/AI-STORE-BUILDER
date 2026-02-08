// ═══════════════════════════════════════════════════════════════════════════
// 12 Professional Store Templates with Full HTML Generation
// ═══════════════════════════════════════════════════════════════════════════

import {
  generateStoreHTML,
  type StoreTheme,
  type SectionConfig,
} from './templateEngine';

export interface StoreTemplate {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  description: string;
  thumbnail: string;
  primaryColor: string;
  accentColor: string;
  style: 'modern' | 'luxury' | 'minimal' | 'classic' | 'bold' | 'playful';
  storeType: string;
  features: string[];
  pages: string[];
  theme: StoreTheme;
  sections: SectionConfig[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Template Definitions
// ═══════════════════════════════════════════════════════════════════════════

export const STORE_TEMPLATES: StoreTemplate[] = [
  // ─── 1. Luxury Fashion ────────────────────────────────────────
  {
    id: 'fashion-luxury',
    name: 'أناقَة',
    nameEn: 'Elegance',
    category: 'أزياء',
    description: 'قالب فاخر للمتاجر الراقية — تصميم ملكي مع ألوان ذهبية وخلفية داكنة أنيقة',
    thumbnail: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 30%, #d4af37 100%)',
    primaryColor: '#d4af37',
    accentColor: '#8b6914',
    style: 'luxury',
    storeType: 'fashion',
    features: ['عرض منتجات شبكي فاخر', 'فلتر ألوان/مقاسات', 'عربة تسوق ذكية', 'معرض صور 360°'],
    pages: ['الرئيسية', 'المنتجات', 'المجموعات', 'من نحن', 'تواصل'],
    theme: {
      primary: '#d4af37', primaryDark: '#b8960c', accent: '#e8c547',
      bg: '#fafaf8', surface: '#f5f3ef', surfaceAlt: '#ece8e0',
      text: '#1a1a2e', textSecondary: '#6b6b7b', cardBg: '#ffffff',
      borderColor: '#e0ddd5', fontFamily: 'Tajawal', radius: '16px',
      heroGradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #0f0520 100%)',
      style: 'luxury',
    },
    sections: [
      { id: 's1', type: 'navbar', props: { links: ['الرئيسية', 'مجموعات', 'جديدنا', 'العروض', 'الدار'] } },
      { id: 's2', type: 'hero', props: { title: 'أناقة تتجاوز الزمن', subtitle: 'مجموعة حصرية من أرقى الأزياء العالمية — تصاميم فاخرة تليق بذوقك الرفيع', badge: '✨ مجموعة ربيع 2026', cta: 'تسوق المجموعة', cta2: 'شاهد الكتالوج', height: '560px' } },
      { id: 's3', type: 'trust-badges', props: {} },
      { id: 's4', type: 'categories', props: { title: 'تسوق حسب القسم', subtitle: 'اختر من مجموعاتنا المتنوعة' } },
      { id: 's5', type: 'products', props: { title: 'أحدث الوصولات', subtitle: 'تشكيلة حصرية مختارة بعناية فائقة', count: 8 } },
      { id: 's6', type: 'products-featured', props: { title: 'قطعة الموسم', subtitle: 'اختيارنا الأول لهذا الموسم' } },
      { id: 's7', type: 'offers', props: {} },
      { id: 's8', type: 'testimonials', props: {} },
      { id: 's9', type: 'newsletter', props: { title: 'انضم لعالم الأناقة', subtitle: 'اشترك واحصل على عروض حصرية وكود خصم 15%' } },
      { id: 's10', type: 'footer', props: {} },
    ],
  },

  // ─── 2. Electronics Modern ────────────────────────────────────
  {
    id: 'electronics-modern',
    name: 'تِك ماكس',
    nameEn: 'TechMax',
    category: 'إلكترونيات',
    description: 'قالب عصري للأجهزة والإلكترونيات — تصميم نظيف داكن مع تدرجات سيان',
    thumbnail: 'linear-gradient(135deg, #0c0c1d 0%, #1e3a5f 50%, #00cec9 100%)',
    primaryColor: '#00cec9',
    accentColor: '#0984e3',
    style: 'modern',
    storeType: 'electronics',
    features: ['مقارنة منتجات', 'مواصفات تقنية مفصلة', 'تقييمات مع صور', 'فلتر ذكي'],
    pages: ['الرئيسية', 'المنتجات', 'العروض', 'الدعم الفني', 'تواصل'],
    theme: {
      primary: '#00cec9', primaryDark: '#00a8a3', accent: '#0984e3',
      bg: '#f4f7fa', surface: '#edf1f7', surfaceAlt: '#e2e8f0',
      text: '#0c0c1d', textSecondary: '#5a6a7a', cardBg: '#ffffff',
      borderColor: '#dde3ed', fontFamily: 'Tajawal', radius: '14px',
      heroGradient: 'linear-gradient(135deg, #0c0c1d 0%, #1e3a5f 50%, #0a1628 100%)',
      style: 'modern',
    },
    sections: [
      { id: 's1', type: 'navbar', props: { links: ['الرئيسية', 'هواتف', 'لابتوبات', 'إكسسوارات', 'العروض', 'الدعم'] } },
      { id: 's2', type: 'hero', props: { title: 'أحدث التقنيات في مكان واحد', subtitle: 'اكتشف عالم الإلكترونيات مع أقوى العروض — أجهزة أصلية بضمان حقيقي وتوصيل سريع', badge: '🚀 آيفون 16 برو — متوفر الآن', cta: 'تسوق الآن', cta2: 'قارن الأسعار', height: '520px' } },
      { id: 's3', type: 'banner', props: { text: '🔥 خصم 500 ر.س على الماك بوك — استخدم كود: TECH500', emoji: '💻' } },
      { id: 's4', type: 'categories', props: {} },
      { id: 's5', type: 'products', props: { count: 8 } },
      { id: 's6', type: 'features', props: {} },
      { id: 's7', type: 'countdown', props: { title: 'تخفيضات التقنية الكبرى', subtitle: 'خصومات تصل حتى 40% على أقوى الأجهزة' } },
      { id: 's8', type: 'stats', props: {} },
      { id: 's9', type: 'testimonials', props: {} },
      { id: 's10', type: 'brands', props: { brands: ['Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Lenovo', 'Logitech', 'JBL'] } },
      { id: 's11', type: 'faq', props: {} },
      { id: 's12', type: 'newsletter', props: {} },
      { id: 's13', type: 'footer', props: {} },
    ],
  },

  // ─── 3. Beauty & Cosmetics ────────────────────────────────────
  {
    id: 'beauty-glow',
    name: 'بيوتي جلو',
    nameEn: 'BeautyGlow',
    category: 'تجميل',
    description: 'قالب أنيق لمتاجر العطور والتجميل — ألوان وردية ناعمة وتصميم عصري',
    thumbnail: 'linear-gradient(135deg, #2d1f3d 0%, #1a1a2e 40%, #e84393 100%)',
    primaryColor: '#e84393',
    accentColor: '#fd79a8',
    style: 'modern',
    storeType: 'beauty',
    features: ['عرض 360°', 'نصائح جمال', 'برنامج ولاء', 'عينات مجانية'],
    pages: ['الرئيسية', 'العطور', 'المكياج', 'العناية', 'العروض'],
    theme: {
      primary: '#e84393', primaryDark: '#c0287a', accent: '#fd79a8',
      bg: '#fef7fa', surface: '#fdf0f5', surfaceAlt: '#fbe4ed',
      text: '#2d1f3d', textSecondary: '#7a6187', cardBg: '#ffffff',
      borderColor: '#f0dce5', fontFamily: 'Tajawal', radius: '20px',
      heroGradient: 'linear-gradient(135deg, #2d1f3d 0%, #6c2c6e 50%, #e84393 100%)',
      style: 'modern',
    },
    sections: [
      { id: 's1', type: 'navbar', props: { links: ['الرئيسية', 'العطور', 'المكياج', 'العناية', 'العروض'], cta: 'اطلبي الآن' } },
      { id: 's2', type: 'hero', props: { title: 'جمالك يبدأ من هنا', subtitle: 'أفخم العطور ومنتجات التجميل العالمية — مكونات طبيعية وجودة فائقة لتتألقي كل يوم', badge: '🌸 وصلت مجموعة الربيع — عينات مجانية', cta: 'تسوقي الآن', cta2: 'اكتشفي العطور', height: '520px' } },
      { id: 's3', type: 'trust-badges', props: {} },
      { id: 's4', type: 'categories', props: {} },
      { id: 's5', type: 'products-featured', props: { title: '⭐ منتج الشهر', subtitle: 'اختيار خبيرات التجميل' } },
      { id: 's6', type: 'products', props: { title: 'الأكثر مبيعاً', subtitle: 'المنتجات المفضلة لعملائنا', count: 8 } },
      { id: 's7', type: 'features', props: {} },
      { id: 's8', type: 'gallery', props: { title: '📸 أجواء بيوتي جلو', subtitle: 'لمحات من عالم الجمال' } },
      { id: 's9', type: 'testimonials', props: {} },
      { id: 's10', type: 'newsletter', props: { title: '💌 نصائح جمال مجانية', subtitle: 'اشتركي واحصلي على كود خصم 10% + نصائح أسبوعية' } },
      { id: 's11', type: 'footer', props: {} },
    ],
  },

  // ─── 4. Food & Restaurant ─────────────────────────────────────
  {
    id: 'food-gourmet',
    name: 'ذَواقة',
    nameEn: 'Gourmet',
    category: 'أغذية',
    description: 'قالب دافئ لمتاجر الأغذية والمطاعم — ألوان طبيعية دفيئة وتصميم شهي',
    thumbnail: 'linear-gradient(135deg, #1a1209 0%, #2d1f0e 50%, #e17055 100%)',
    primaryColor: '#e17055',
    accentColor: '#fdcb6e',
    style: 'classic',
    storeType: 'food',
    features: ['قائمة طعام تفاعلية', 'طلب أونلاين', 'توصيل ≤30 دقيقة', 'تتبع الطلب'],
    pages: ['الرئيسية', 'القائمة', 'العروض', 'عن المطعم', 'اتصل بنا'],
    theme: {
      primary: '#e17055', primaryDark: '#c0503a', accent: '#fdcb6e',
      bg: '#fdfaf6', surface: '#f9f3eb', surfaceAlt: '#f0e8dd',
      text: '#2c1a0e', textSecondary: '#7a6554', cardBg: '#ffffff',
      borderColor: '#e8ddd0', fontFamily: 'Tajawal', radius: '16px',
      heroGradient: 'linear-gradient(135deg, #2c1a0e 0%, #5a3520 50%, #e17055 100%)',
      style: 'classic',
    },
    sections: [
      { id: 's1', type: 'navbar', props: { links: ['الرئيسية', 'القائمة', 'عن المطعم', 'العروض', 'اتصل بنا'], cta: 'اطلب الآن' } },
      { id: 's2', type: 'hero', props: { title: 'نكهات تأسر الحواس', subtitle: 'أشهى المأكولات من أيدي أمهر الطهاة — مكونات طازجة يومياً وتوصيل سريع لبابك', badge: '🍔 عرض اليوم — وجبة عائلية بـ 99 ر.س فقط', cta: 'اطلب الآن', cta2: 'تصفح القائمة', height: '500px' } },
      { id: 's3', type: 'banner', props: { text: '🎉 توصيل مجاني لأول طلب — استخدم كود: FIRST', emoji: '🚚' } },
      { id: 's4', type: 'categories', props: { title: 'قائمتنا', subtitle: 'اختر من أقسامنا المتنوعة' } },
      { id: 's5', type: 'products', props: { title: 'الأكثر طلباً', subtitle: 'وجبات يعشقها عملاؤنا', count: 8 } },
      { id: 's6', type: 'features', props: {} },
      { id: 's7', type: 'offers', props: { title: '🔥 عروض اليوم', subtitle: 'خصومات حصرية لفترة محدودة', offers: [
        { emoji: '🍔', title: 'وجبة عائلية', desc: "4 برجر + بطاطس + مشروبات", tag: 'توفير 40%', price: '99 ر.س فقط', gradient: 'linear-gradient(135deg, #e17055, #c0503a)' },
        { emoji: '🍕', title: 'عرض الأصدقاء', desc: "بيتزا كبيرة + بيتزا وسط مجاناً", tag: 'اشترِ 1 واحصل على 1', price: 'يبدأ من 69 ر.س', gradient: 'linear-gradient(135deg, #fdcb6e, #e17055)' },
        { emoji: '☕', title: 'وقت القهوة', desc: "أي مشروب ساخن + حلى", tag: 'عرض الصباح', price: '29 ر.س فقط', gradient: 'linear-gradient(135deg, #6d4c41, #3e2723)' },
      ]}},
      { id: 's8', type: 'testimonials', props: {} },
      { id: 's9', type: 'contact', props: { title: 'موقعنا وتواصل', subtitle: 'نسعد بزيارتكم أو تواصلكم' } },
      { id: 's10', type: 'footer', props: {} },
    ],
  },

  // ─── 5. Simple General ────────────────────────────────────────
  {
    id: 'simple-shop',
    name: 'سِمبل شوب',
    nameEn: 'SimpleShop',
    category: 'عام',
    description: 'قالب بسيط ونظيف يناسب أي نوع متجر — مثالي للمبتدئين، سهل التخصيص',
    thumbnail: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #6c5ce7 100%)',
    primaryColor: '#6c5ce7',
    accentColor: '#a29bfe',
    style: 'minimal',
    storeType: 'general',
    features: ['سهل التخصيص', 'سريع التحميل', 'متوافق مع الجوال', 'SEO محسّن'],
    pages: ['الرئيسية', 'المنتجات', 'من نحن', 'تواصل معنا'],
    theme: {
      primary: '#6c5ce7', primaryDark: '#4834d4', accent: '#a29bfe',
      bg: '#f8f9fc', surface: '#f0f2f8', surfaceAlt: '#e6e9f2',
      text: '#1a1a2e', textSecondary: '#6b6b8a', cardBg: '#ffffff',
      borderColor: '#dfe2ec', fontFamily: 'Tajawal', radius: '14px',
      heroGradient: 'linear-gradient(135deg, #1a1a2e 0%, #2d2b55 50%, #6c5ce7 100%)',
      style: 'minimal',
    },
    sections: [
      { id: 's1', type: 'navbar', props: {} },
      { id: 's2', type: 'hero', props: { title: 'مرحباً بكم في متجرنا', subtitle: 'أفضل المنتجات بأفضل الأسعار — تسوق بثقة واستمتع بتجربة شراء سلسة وسهلة', height: '480px' } },
      { id: 's3', type: 'trust-badges', props: {} },
      { id: 's4', type: 'products', props: { count: 8 } },
      { id: 's5', type: 'features', props: {} },
      { id: 's6', type: 'stats', props: {} },
      { id: 's7', type: 'testimonials', props: {} },
      { id: 's8', type: 'faq', props: {} },
      { id: 's9', type: 'newsletter', props: {} },
      { id: 's10', type: 'footer', props: {} },
    ],
  },

  // ─── 6. Royal Jewelry ─────────────────────────────────────────
  {
    id: 'jewelry-royal',
    name: 'جواهر روايال',
    nameEn: 'Royal Jewels',
    category: 'مجوهرات',
    description: 'قالب فاخر للمجوهرات والساعات — لمسة ملكية ذهبية مع خلفية سوداء',
    thumbnail: 'linear-gradient(135deg, #0a0510 0%, #1a0a2e 40%, #ffd700 100%)',
    primaryColor: '#ffd700',
    accentColor: '#c9a227',
    style: 'luxury',
    storeType: 'jewelry',
    features: ['عرض 3D', 'شهادات أصالة', 'تغليف فاخر', 'دفع آمن'],
    pages: ['الرئيسية', 'المجوهرات', 'الساعات', 'الهدايا', 'عن الدار'],
    theme: {
      primary: '#ffd700', primaryDark: '#b8960c', accent: '#c9a227',
      bg: '#0a0510', surface: '#12081c', surfaceAlt: '#1c0f2e',
      text: '#f0e8d8', textSecondary: '#a09880', cardBg: '#16102a',
      borderColor: '#2a1f42', fontFamily: 'Tajawal', radius: '16px',
      heroGradient: 'linear-gradient(135deg, #0a0510 0%, #1a0a2e 50%, #2d1b45 100%)',
      style: 'luxury',
    },
    sections: [
      { id: 's1', type: 'navbar', props: { links: ['الرئيسية', 'المجوهرات', 'الساعات', 'الهدايا', 'عن الدار'] } },
      { id: 's2', type: 'hero', props: { title: 'روعة تليق بك', subtitle: 'مجوهرات استثنائية تحكي قصص الأناقة والتميز — كل قطعة تحفة فنية فريدة من نوعها', badge: '💎 مجموعة حصرية — إصدار محدود 2026', cta: 'اكتشف المجموعة', cta2: 'شاهد الكتالوج', height: '560px' } },
      { id: 's3', type: 'categories', props: { title: 'مجموعاتنا', subtitle: 'كل قطعة تحفة فنية فريدة' } },
      { id: 's4', type: 'products-featured', props: { title: '💎 قطعة الموسم', subtitle: 'اختيار خبراء المجوهرات' } },
      { id: 's5', type: 'products', props: { title: 'أحدث الإصدارات', subtitle: 'تشكيلة حصرية من أرقى المجوهرات', count: 8 } },
      { id: 's6', type: 'features', props: { features: [
        { icon: '💎', title: 'أصالة مضمونة', desc: 'شهادة أصالة دولية مع كل قطعة + ضمان مدى الحياة' },
        { icon: '🎁', title: 'تغليف ملكي', desc: 'تغليف فاخر بصندوق مخملي يليق بأنقى المجوهرات' },
        { icon: '🔒', title: 'دفع آمن وسري', desc: 'معاملات مشفرة بأعلى معايير الأمان العالمية' },
        { icon: '🚚', title: 'توصيل مؤمّن', desc: 'شحن مؤمّن ومتتبع مع تسليم يد بيد' },
      ]}},
      { id: 's7', type: 'testimonials', props: {} },
      { id: 's8', type: 'brands', props: { brands: ['Cartier', 'Tiffany', 'Bvlgari', 'Van Cleef', 'Chopard', 'Rolex', 'Piaget', 'IWC'], title: 'علاماتنا الفاخرة' } },
      { id: 's9', type: 'cta', props: { title: 'اكتشف أناقة لا تُضاهى', subtitle: 'زر أقرب فرع أو تسوق أونلاين — توصيل مؤمّن لباب بيتك', cta: 'تسوق الآن', cta2: 'فروعنا' } },
      { id: 's10', type: 'footer', props: {} },
    ],
  },

  // ─── 7. Sports Zone ───────────────────────────────────────────
  {
    id: 'sports-zone',
    name: 'سبورتي',
    nameEn: 'Sporty',
    category: 'رياضة',
    description: 'قالب حيوي للمتاجر الرياضية — تصميم ديناميكي بألوان خضراء نشيطة',
    thumbnail: 'linear-gradient(135deg, #0d1117 0%, #1b4332 50%, #2ecc71 100%)',
    primaryColor: '#2ecc71',
    accentColor: '#27ae60',
    style: 'bold',
    storeType: 'sports',
    features: ['فلتر حسب الرياضة', 'مقاسات دقيقة', 'مقارنة منتجات', 'تقييمات رياضيين'],
    pages: ['الرئيسية', 'المنتجات', 'العروض', 'المقالات', 'تواصل'],
    theme: {
      primary: '#2ecc71', primaryDark: '#27ae60', accent: '#00b894',
      bg: '#f4f9f6', surface: '#ebf5f0', surfaceAlt: '#d5ede2',
      text: '#0d1117', textSecondary: '#4a6a5a', cardBg: '#ffffff',
      borderColor: '#d0e4d8', fontFamily: 'Tajawal', radius: '14px',
      heroGradient: 'linear-gradient(135deg, #0d1117 0%, #1b4332 50%, #0d2818 100%)',
      style: 'bold',
    },
    sections: [
      { id: 's1', type: 'navbar', props: { links: ['الرئيسية', 'أحذية', 'ملابس', 'معدات', 'مكملات', 'العروض'] } },
      { id: 's2', type: 'hero-split', props: { title: 'جهّز. انطلق. انتصر.', subtitle: 'أفضل المعدات والملابس الرياضية من أقوى العلامات العالمية — ابدأ رحلتك الرياضية معنا', emoji: '🏃' } },
      { id: 's3', type: 'banner', props: { text: '⚡ خصم 25% على جميع أحذية الجري — هذا الأسبوع فقط', emoji: '👟' } },
      { id: 's4', type: 'categories', props: {} },
      { id: 's5', type: 'products', props: { count: 8, title: 'الأكثر طلباً', subtitle: 'المنتجات الرياضية الأكثر شعبية' } },
      { id: 's6', type: 'countdown', props: { title: 'ماراثون التخفيضات', subtitle: 'خصومات تصل حتى 60% على أقوى المنتجات الرياضية' } },
      { id: 's7', type: 'features', props: {} },
      { id: 's8', type: 'stats', props: { stats: [{ value: '+15K', label: 'رياضي يثق فينا' }, { value: '+800', label: 'منتج رياضي' }, { value: '+30', label: 'علامة تجارية' }, { value: '4.8', label: 'تقييم العملاء' }] } },
      { id: 's9', type: 'testimonials', props: {} },
      { id: 's10', type: 'brands', props: { brands: ['Nike', 'Adidas', 'Under Armour', 'Puma', 'Reebok', 'New Balance', 'Asics', 'Columbia'] } },
      { id: 's11', type: 'newsletter', props: { title: '🏋️ انضم لمجتمعنا الرياضي', subtitle: 'نصائح رياضية + عروض حصرية + كود خصم 10%' } },
      { id: 's12', type: 'footer', props: {} },
    ],
  },

  // ─── 8. Kids World ────────────────────────────────────────────
  {
    id: 'kids-world',
    name: 'كيدز لاند',
    nameEn: 'KidsLand',
    category: 'أطفال',
    description: 'قالب مرح وملون للأطفال والألعاب — ألوان زاهية وتصميم مبهج',
    thumbnail: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 30%, #fd79a8 60%, #fdcb6e 100%)',
    primaryColor: '#6c5ce7',
    accentColor: '#fd79a8',
    style: 'playful',
    storeType: 'kids',
    features: ['فلتر حسب العمر', 'منتجات آمنة', 'تغليف هدايا', 'ألعاب تعليمية'],
    pages: ['الرئيسية', 'ألعاب', 'تعليمية', 'ملابس', 'هدايا'],
    theme: {
      primary: '#6c5ce7', primaryDark: '#5a4bd1', accent: '#fd79a8',
      bg: '#fef9ff', surface: '#f8f0ff', surfaceAlt: '#efe5ff',
      text: '#2d2252', textSecondary: '#7a6b94', cardBg: '#ffffff',
      borderColor: '#e8ddf5', fontFamily: 'Tajawal', radius: '24px',
      heroGradient: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #fd79a8 100%)',
      style: 'playful',
    },
    sections: [
      { id: 's1', type: 'navbar', props: { links: ['الرئيسية', 'ألعاب', 'تعليمية', 'ملابس', 'هدايا'], cta: 'تسوق الآن 🎁' } },
      { id: 's2', type: 'hero', props: { title: 'عالم المرح والتعلم! 🎊', subtitle: 'ألعاب آمنة وتعليمية تنمّي مهارات طفلك وتملأ عالمه بالسعادة والإبداع', badge: '🧸 مجموعة العيد وصلت!', cta: 'اكتشف الألعاب', cta2: 'هدايا مميزة', height: '500px' } },
      { id: 's3', type: 'trust-badges', props: {} },
      { id: 's4', type: 'categories', props: { title: '🎨 اختر القسم', subtitle: 'ألعاب لكل عمر واهتمام' } },
      { id: 's5', type: 'products', props: { count: 8, title: '⭐ الأكثر شعبية', subtitle: 'الألعاب التي يحبها الأطفال' } },
      { id: 's6', type: 'offers', props: { title: '🎉 عروض مبهجة', subtitle: 'خصومات كبيرة على ألعاب مختارة' } },
      { id: 's7', type: 'features', props: { features: [
        { icon: '🛡️', title: 'آمنة 100%', desc: 'جميع الألعاب مطابقة لمعايير السلامة العالمية' },
        { icon: '🎁', title: 'تغليف هدايا مجاني', desc: 'نغلف لك الهدية بطريقة جميلة ومبهجة' },
        { icon: '📚', title: 'ألعاب تعليمية', desc: 'تنمي الذكاء والإبداع والمهارات الحركية' },
        { icon: '🚚', title: 'توصيل سريع', desc: 'توصيل خلال يومين لجميع المناطق' },
      ]}},
      { id: 's8', type: 'testimonials', props: {} },
      { id: 's9', type: 'newsletter', props: { title: '🎈 احصل على عروض حصرية', subtitle: 'اشترك واحصل على خصم 15% + أفكار هدايا أسبوعية' } },
      { id: 's10', type: 'footer', props: {} },
    ],
  },

  // ─── 9. Home & Decor ──────────────────────────────────────────
  {
    id: 'home-decor',
    name: 'هوم ديكور',
    nameEn: 'HomeDecor',
    category: 'ديكور',
    description: 'قالب أنيق للديكور والأثاث — ألوان أرضية دافئة وتصميم مريح',
    thumbnail: 'linear-gradient(135deg, #2c2013 0%, #4a3728 50%, #8d6e63 100%)',
    primaryColor: '#8d6e63',
    accentColor: '#a1887f',
    style: 'classic',
    storeType: 'home',
    features: ['معاينة الغرفة', 'تنسيق ديكور', 'استشارات تصميم', 'خدمة تركيب'],
    pages: ['الرئيسية', 'الأثاث', 'الإضاءة', 'الإكسسوارات', 'عن الشركة'],
    theme: {
      primary: '#8d6e63', primaryDark: '#6d4c41', accent: '#a1887f',
      bg: '#faf8f5', surface: '#f5f0ea', surfaceAlt: '#ebe3d8',
      text: '#2c2013', textSecondary: '#7a6a5a', cardBg: '#ffffff',
      borderColor: '#e0d5c8', fontFamily: 'Tajawal', radius: '12px',
      heroGradient: 'linear-gradient(135deg, #2c2013 0%, #4a3728 60%, #6d4c41 100%)',
      style: 'classic',
    },
    sections: [
      { id: 's1', type: 'navbar', props: { links: ['الرئيسية', 'الأثاث', 'الإضاءة', 'إكسسوارات', 'الحدائق', 'عنا'] } },
      { id: 's2', type: 'hero-split', props: { title: 'صمّم مساحتك المثالية', subtitle: 'أثاث وديكورات حصرية تحوّل منزلك إلى تحفة فنية — جودة عالمية وتصاميم عربية أصيلة', emoji: '🛋️' } },
      { id: 's3', type: 'categories', props: { title: 'أقسامنا', subtitle: 'كل ما يحتاجه منزلك في مكان واحد' } },
      { id: 's4', type: 'products', props: { count: 8, title: 'منتجات مختارة', subtitle: 'أثاث وديكور بلمسة فنية' } },
      { id: 's5', type: 'products-featured', props: { title: '✨ قطعة الموسم', subtitle: 'اختيار مصممي الديكور' } },
      { id: 's6', type: 'features', props: { features: [
        { icon: '🏠', title: 'تصميم داخلي', desc: 'استشارات تصميم مجانية مع خبراء الديكور' },
        { icon: '🔨', title: 'خدمة تركيب', desc: 'فريق متخصص يركب الأثاث في منزلك' },
        { icon: '🚚', title: 'توصيل آمن', desc: 'شحن مؤمّن مع تغليف احترافي' },
        { icon: '↩️', title: 'استبدال سهل', desc: '30 يوم للاستبدال بدون أي تعقيدات' },
      ]}},
      { id: 's7', type: 'gallery', props: { title: '📸 إلهام ديكور', subtitle: 'أفكار وتنسيقات لتستلهم منها' } },
      { id: 's8', type: 'testimonials', props: {} },
      { id: 's9', type: 'cta', props: { title: 'جاهز تجدد ديكور بيتك؟', subtitle: 'تواصل مع مصممينا أو تسوق أونلاين — توصيل وتركيب مجاني' } },
      { id: 's10', type: 'footer', props: {} },
    ],
  },

  // ─── 10. Perfume Attar ────────────────────────────────────────
  {
    id: 'perfume-attar',
    name: 'عَطر',
    nameEn: 'Attar',
    category: 'عطور',
    description: 'قالب فخم للعطور والبخور — أجواء شرقية فاخرة مع تدرجات بنفسجية عميقة',
    thumbnail: 'linear-gradient(135deg, #0a0515 0%, #1a0a3a 40%, #9b59b6 100%)',
    primaryColor: '#9b59b6',
    accentColor: '#8e44ad',
    style: 'luxury',
    storeType: 'perfume',
    features: ['كتالوج عطور', 'عينات مصغرة', 'تغليف فاخر', 'نقش الأسماء'],
    pages: ['الرئيسية', 'العطور', 'البخور', 'الدخون', 'المجموعات', 'عن الدار'],
    theme: {
      primary: '#9b59b6', primaryDark: '#7d3c98', accent: '#d4a0e8',
      bg: '#0f081a', surface: '#160e24', surfaceAlt: '#1f1435',
      text: '#e8ddf0', textSecondary: '#9a88a8', cardBg: '#1a1030',
      borderColor: '#2e1f45', fontFamily: 'Tajawal', radius: '16px',
      heroGradient: 'linear-gradient(135deg, #0f081a 0%, #2a1050 50%, #4a1a7a 100%)',
      style: 'luxury',
    },
    sections: [
      { id: 's1', type: 'navbar', props: { links: ['الرئيسية', 'العطور', 'البخور', 'الدخون', 'المجموعات', 'الدار'] } },
      { id: 's2', type: 'hero', props: { title: 'عطور تحكي قصتك', subtitle: 'عود كمبودي أصيل، مسك طبيعي، وروائح شرقية فاخرة — كل عطر رحلة حسية لا تُنسى', badge: '🌹 إصدار محدود — عود ملكي 2026', cta: 'اكتشف العطور', cta2: 'مجموعة الهدايا', height: '560px' } },
      { id: 's3', type: 'categories', props: { title: 'عوالمنا العطرية', subtitle: 'كل قسم عالم من الروائح الساحرة' } },
      { id: 's4', type: 'products-featured', props: { title: '🌹 عطر الموسم', subtitle: 'اختيار خبراء العطور' } },
      { id: 's5', type: 'products', props: { title: 'تشكيلتنا الفاخرة', subtitle: 'عطور مختارة بعناية من أجود المكونات', count: 8 } },
      { id: 's6', type: 'offers', props: { title: '✨ عروض حصرية', subtitle: 'فرص ذهبية على أفخم العطور' } },
      { id: 's7', type: 'features', props: { features: [
        { icon: '🌿', title: 'مكونات نادرة', desc: 'عود كمبودي، مسك غزال، عنبر طبيعي من أنقى المصادر' },
        { icon: '✍️', title: 'نقش مجاني', desc: 'نقش اسمك أو رسالتك على الزجاجة بالليزر' },
        { icon: '🎁', title: 'تغليف مخملي', desc: 'صندوق فاخر بتصميم ملكي يليق بالمناسبات' },
        { icon: '📦', title: 'عينات مجانية', desc: 'اطلب عينات مصغرة قبل شراء الحجم الكامل' },
      ]}},
      { id: 's8', type: 'testimonials', props: {} },
      { id: 's9', type: 'newsletter', props: { title: '🌸 انضم لعشاق العطور', subtitle: 'عروض حصرية + إصدارات محدودة + نصائح عطرية' } },
      { id: 's10', type: 'footer', props: {} },
    ],
  },

  // ─── 11. Health & Wellness ────────────────────────────────────
  {
    id: 'health-wellness',
    name: 'صِحتك',
    nameEn: 'HealthPlus',
    category: 'صحة',
    description: 'قالب طبيعي لمتاجر الصحة والعافية — ألوان خضراء هادئة وتصميم نظيف',
    thumbnail: 'linear-gradient(135deg, #0a1a0f 0%, #1b5e20 50%, #66bb6a 100%)',
    primaryColor: '#43a047',
    accentColor: '#66bb6a',
    style: 'minimal',
    storeType: 'health',
    features: ['فلتر عضوي/طبيعي', 'معلومات غذائية', 'اشتراكات شهرية', 'استشارات صحية'],
    pages: ['الرئيسية', 'المكملات', 'العناية', 'الأغذية', 'المقالات'],
    theme: {
      primary: '#43a047', primaryDark: '#2e7d32', accent: '#66bb6a',
      bg: '#f5faf6', surface: '#edf5ef', surfaceAlt: '#dceee0',
      text: '#0a1a0f', textSecondary: '#4a6a50', cardBg: '#ffffff',
      borderColor: '#cfe2d3', fontFamily: 'Tajawal', radius: '14px',
      heroGradient: 'linear-gradient(135deg, #0a1a0f 0%, #1b5e20 50%, #0d3012 100%)',
      style: 'minimal',
    },
    sections: [
      { id: 's1', type: 'navbar', props: { links: ['الرئيسية', 'مكملات', 'عناية طبيعية', 'أغذية عضوية', 'المدونة'], cta: 'تسوق صحي' } },
      { id: 's2', type: 'hero', props: { title: 'صحتك أولاً', subtitle: 'مكملات غذائية طبيعية 100% ومنتجات عضوية معتمدة — ابدأ رحلتك نحو حياة أصح اليوم', badge: '🌿 منتجات عضوية معتمدة — شحن مبرّد', cta: 'تسوق الآن', cta2: 'استشارة مجانية', height: '500px' } },
      { id: 's3', type: 'trust-badges', props: {} },
      { id: 's4', type: 'categories', props: { title: '🌿 أقسامنا', subtitle: 'كل ما تحتاجه لحياة صحية' } },
      { id: 's5', type: 'products', props: { count: 8, title: 'أكثر المنتجات طلباً', subtitle: 'منتجات اختارها عملاؤنا' } },
      { id: 's6', type: 'features', props: { features: [
        { icon: '🌱', title: '100% طبيعي', desc: 'جميع منتجاتنا من مكونات طبيعية بدون مواد كيميائية' },
        { icon: '🧪', title: 'مختبر معتمد', desc: 'كل منتج يخضع لفحوصات مخبرية صارمة' },
        { icon: '🚚', title: 'شحن مبرّد', desc: 'توصيل مبرّد للمنتجات الحساسة للحرارة' },
        { icon: '👨‍⚕️', title: 'استشارات مجانية', desc: 'تحدث مع أخصائي تغذية مجاناً' },
      ]}},
      { id: 's7', type: 'stats', props: { stats: [{ value: '+25K', label: 'عميل صحي' }, { value: '+300', label: 'منتج طبيعي' }, { value: '99%', label: 'نسبة الرضا' }, { value: '5.0', label: 'تقييم' }] } },
      { id: 's8', type: 'testimonials', props: {} },
      { id: 's9', type: 'faq', props: {} },
      { id: 's10', type: 'newsletter', props: { title: '🥑 نصائح صحية أسبوعية', subtitle: 'اشترك واحصل على نصائح تغذية + كود خصم 10%' } },
      { id: 's11', type: 'footer', props: {} },
    ],
  },

  // ─── 12. Auto Parts ───────────────────────────────────────────
  {
    id: 'auto-parts',
    name: 'أوتو بارتس',
    nameEn: 'AutoParts',
    category: 'سيارات',
    description: 'قالب احترافي لقطع غيار السيارات — تصميم داكن صناعي مع لمسات حمراء',
    thumbnail: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 40%, #e74c3c 100%)',
    primaryColor: '#e74c3c',
    accentColor: '#c0392b',
    style: 'bold',
    storeType: 'auto',
    features: ['البحث بموديل السيارة', 'كتالوج قطع', 'فلتر متقدم', 'ضمان القطع'],
    pages: ['الرئيسية', 'قطع الغيار', 'الزيوت', 'الإكسسوارات', 'الضمان'],
    theme: {
      primary: '#e74c3c', primaryDark: '#c0392b', accent: '#ff6b6b',
      bg: '#0a0a0f', surface: '#111118', surfaceAlt: '#1a1a25',
      text: '#e8e8f0', textSecondary: '#8888a8', cardBg: '#14141f',
      borderColor: '#2a2a3e', fontFamily: 'Tajawal', radius: '12px',
      heroGradient: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a0f 50%, #2a0a0f 100%)',
      style: 'bold',
    },
    sections: [
      { id: 's1', type: 'navbar', props: { links: ['الرئيسية', 'قطع غيار', 'زيوت', 'إطارات', 'إكسسوارات', 'الضمان'], cta: 'اطلب الآن' } },
      { id: 's2', type: 'hero', props: { title: 'قطع غيار أصلية — أداء لا يتوقف', subtitle: 'أكبر تشكيلة من قطع غيار السيارات الأصلية والبديلة — ابحث بموديل سيارتك واطلب الآن', badge: '🔧 أكثر من 50,000 قطعة غيار', cta: 'ابحث عن قطعتك', cta2: 'تصفح العروض', height: '500px' } },
      { id: 's3', type: 'banner', props: { text: '🔥 خصم 20% على جميع الزيوت الأصلية هذا الأسبوع — الكمية محدودة', emoji: '🛢️' } },
      { id: 's4', type: 'categories', props: { title: '🔧 أقسامنا', subtitle: 'كل ما تحتاجه سيارتك في مكان واحد' } },
      { id: 's5', type: 'products', props: { count: 8, title: 'الأكثر طلباً', subtitle: 'قطع غيار بأعلى جودة وأفضل سعر' } },
      { id: 's6', type: 'features', props: { features: [
        { icon: '✅', title: 'قطع أصلية', desc: 'جميع القطع أصلية أو معتمدة مع ضمان المصنع' },
        { icon: '🔍', title: 'بحث بالموديل', desc: 'ابحث بنوع وموديل سيارتك للعثور على القطعة المناسبة' },
        { icon: '🚚', title: 'توصيل سريع', desc: 'توصيل خلال 24 ساعة لقطع الصيانة الأساسية' },
        { icon: '🔧', title: 'خدمة تركيب', desc: 'ربط مع ورش معتمدة لتركيب القطع' },
      ]}},
      { id: 's7', type: 'countdown', props: { title: '⚡ عروض نهاية الشهر', subtitle: 'خصومات حصرية على الإطارات والزيوت' } },
      { id: 's8', type: 'stats', props: { stats: [{ value: '+50K', label: 'قطعة متوفرة' }, { value: '+200', label: 'علامة تجارية' }, { value: '+8K', label: 'عميل' }, { value: '4.7', label: 'تقييم' }] } },
      { id: 's9', type: 'testimonials', props: {} },
      { id: 's10', type: 'faq', props: { items: [
        { q: 'كيف أتأكد أن القطعة تناسب سيارتي؟', a: 'ابحث برقم الشاصي (VIN) أو اختر نوع وموديل سيارتك وسنة الصنع من قائمتنا، وسنعرض لك القطع المتوافقة فقط.' },
        { q: 'هل القطع أصلية؟', a: 'نعم، جميع القطع إما أصلية من الشركة المصنعة أو بديلة معتمدة بضمان. نوفر شهادة أصالة ورقم تتبع لكل قطعة.' },
        { q: 'هل يوجد خدمة تركيب؟', a: 'نعم، نتعاون مع شبكة ورش معتمدة في أنحاء المملكة. يمكنك حجز خدمة التركيب عند إتمام الطلب أو لاحقاً.' },
        { q: 'ما سياسة الضمان والإرجاع؟', a: 'ضمان سنة كاملة على جميع القطع. إمكانية الإرجاع خلال 30 يوم إذا كانت القطعة بحالتها الأصلية.' },
      ]}},
      { id: 's11', type: 'footer', props: {} },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Template HTML Generator
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate complete professional HTML for a template
 */
export function getTemplateHTML(templateId: string, storeName?: string): string {
  const template = STORE_TEMPLATES.find(t => t.id === templateId);
  if (!template) {
    return getTemplateHTML('simple-shop', storeName);
  }
  const name = storeName || template.name;
  return generateStoreHTML(name, template.storeType, template.theme, template.sections);
}

/**
 * Generate HTML for a template with custom sections
 */
export function getCustomTemplateHTML(
  storeName: string,
  storeType: string,
  theme: StoreTheme,
  sections: SectionConfig[]
): string {
  return generateStoreHTML(storeName, storeType, theme, sections);
}

/**
 * Get a template by ID
 */
export function getTemplate(templateId: string): StoreTemplate | undefined {
  return STORE_TEMPLATES.find(t => t.id === templateId);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): StoreTemplate[] {
  if (category === 'الكل') return STORE_TEMPLATES;
  return STORE_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
  return ['الكل', ...new Set(STORE_TEMPLATES.map(t => t.category))];
}
