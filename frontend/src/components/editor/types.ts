// Types for the visual store editor

export interface EditorSection {
  id: string;
  type: SectionType;
  label: string;
  icon: string;
  enabled: boolean;
  props: Record<string, unknown>;
}

export type SectionType =
  | 'hero'
  | 'categories'
  | 'featured_products'
  | 'banner'
  | 'testimonials'
  | 'features'
  | 'newsletter'
  | 'brands'
  | 'gallery'
  | 'faq';

export interface SectionTemplate {
  type: SectionType;
  label: string;
  icon: string;
  description: string;
  defaultProps: Record<string, unknown>;
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    type: 'hero',
    label: 'البانر الرئيسي',
    icon: '🖼️',
    description: 'صورة كبيرة مع عنوان وزر',
    defaultProps: {
      title: 'مرحباً بكم في متجرنا',
      subtitle: 'أفضل المنتجات بأفضل الأسعار',
      buttonText: 'تسوق الآن',
      buttonLink: '/products',
      bgColor: '#6c5ce7',
      height: 'large',
    },
  },
  {
    type: 'categories',
    label: 'التصنيفات',
    icon: '📦',
    description: 'عرض أقسام المتجر',
    defaultProps: {
      columns: 4,
      showImages: true,
      gridStyle: 'cards',
    },
  },
  {
    type: 'featured_products',
    label: 'منتجات مميزة',
    icon: '⭐',
    description: 'عرض المنتجات المختارة',
    defaultProps: {
      columns: 4,
      count: 8,
      showPrice: true,
      showRating: true,
    },
  },
  {
    type: 'banner',
    label: 'بانر إعلاني',
    icon: '📢',
    description: 'بانر ترويجي',
    defaultProps: {
      text: 'خصم 50% على جميع المنتجات!',
      bgColor: '#00cec9',
      textColor: '#ffffff',
    },
  },
  {
    type: 'testimonials',
    label: 'آراء العملاء',
    icon: '💬',
    description: 'تقييمات ومراجعات',
    defaultProps: {
      columns: 3,
      autoSlide: true,
    },
  },
  {
    type: 'features',
    label: 'مميزات المتجر',
    icon: '✨',
    description: 'شحن مجاني، دفع آمن...',
    defaultProps: {
      items: [
        { icon: '🚚', title: 'شحن مجاني', desc: 'لجميع الطلبات' },
        { icon: '🔒', title: 'دفع آمن', desc: '100% حماية' },
        { icon: '↩️', title: 'استرجاع سهل', desc: 'خلال 14 يوم' },
        { icon: '💬', title: 'دعم 24/7', desc: 'نحن هنا دائماً' },
      ],
    },
  },
  {
    type: 'newsletter',
    label: 'النشرة البريدية',
    icon: '📧',
    description: 'نموذج اشتراك',
    defaultProps: {
      title: 'اشترك في نشرتنا البريدية',
      subtitle: 'احصل على أحدث العروض',
      buttonText: 'اشترك',
    },
  },
  {
    type: 'brands',
    label: 'الماركات',
    icon: '🏷️',
    description: 'شعارات العلامات التجارية',
    defaultProps: {
      grayscale: true,
    },
  },
  {
    type: 'gallery',
    label: 'معرض الصور',
    icon: '🖼️',
    description: 'شبكة صور',
    defaultProps: {
      columns: 3,
      gap: 4,
    },
  },
  {
    type: 'faq',
    label: 'الأسئلة الشائعة',
    icon: '❓',
    description: 'أسئلة وأجوبة',
    defaultProps: {
      items: [
        { q: 'كيف أطلب؟', a: 'اختر المنتج وأضفه للسلة' },
        { q: 'ما مدة التوصيل؟', a: '3-5 أيام عمل' },
      ],
    },
  },
];

export function createSection(type: SectionType): EditorSection {
  const template = SECTION_TEMPLATES.find((t) => t.type === type);
  if (!template) throw new Error(`Unknown section type: ${type}`);
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    label: template.label,
    icon: template.icon,
    enabled: true,
    props: { ...template.defaultProps },
  };
}

export const DEFAULT_SECTIONS: EditorSection[] = [
  createSection('hero'),
  createSection('categories'),
  createSection('featured_products'),
  createSection('features'),
];
