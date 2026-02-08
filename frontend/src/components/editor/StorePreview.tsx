import type { EditorSection } from './types';

interface Props {
  sections: EditorSection[];
  primaryColor: string;
  storeName: string;
}

export default function StorePreview({ sections, primaryColor, storeName }: Props) {
  const enabledSections = sections.filter((s) => s.enabled);

  return (
    <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-dark-border/50 h-full flex flex-col">
      {/* Browser Chrome */}
      <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded-lg px-3 py-1 text-xs text-gray-400 text-center" dir="ltr">
          {storeName.toLowerCase().replace(/\s+/g, '-')}.aibuilder.app
        </div>
      </div>

      {/* Store Nav */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200 shrink-0" dir="rtl">
        <span className="font-bold text-sm" style={{ color: primaryColor }}>{storeName || 'متجري'}</span>
        <div className="flex gap-4 text-xs text-gray-500">
          <span>الرئيسية</span>
          <span>المنتجات</span>
          <span>تواصل معنا</span>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto" dir="rtl">
        {enabledSections.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            أضف أقساماً لمعاينة المتجر
          </div>
        ) : (
          enabledSections.map((section) => (
            <PreviewSection key={section.id} section={section} primaryColor={primaryColor} />
          ))
        )}
      </div>
    </div>
  );
}

function PreviewSection({ section, primaryColor }: { section: EditorSection; primaryColor: string }) {
  const p = section.props;

  switch (section.type) {
    case 'hero': {
      const height = p.height === 'small' ? 'h-24' : p.height === 'medium' ? 'h-36' : 'h-48';
      return (
        <div className={`${height} flex flex-col items-center justify-center text-white text-center p-4`}
          style={{ background: `linear-gradient(135deg, ${(p.bgColor as string) || primaryColor}, ${primaryColor})` }}>
          <h2 className="text-base font-bold mb-1">{(p.title as string) || 'عنوان البانر'}</h2>
          <p className="text-xs opacity-80 mb-2">{(p.subtitle as string) || ''}</p>
          <span className="bg-white/20 px-3 py-1 rounded-full text-xs">{(p.buttonText as string) || 'تسوق الآن'}</span>
        </div>
      );
    }
    case 'categories': {
      const cols = (p.columns as number) || 4;
      return (
        <div className="p-4">
          <h3 className="text-sm font-bold mb-3">التصنيفات</h3>
          <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, 1fr)` }}>
            {Array.from({ length: Math.min(cols, 6) }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-3 text-center">
                {!!p.showImages && <div className="w-8 h-8 bg-gray-200 rounded-lg mx-auto mb-1" />}
                <span className="text-xs text-gray-600">قسم {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'featured_products': {
      const cols = (p.columns as number) || 4;
      const count = Math.min((p.count as number) || 4, 8);
      return (
        <div className="p-4">
          <h3 className="text-sm font-bold mb-3">منتجات مميزة</h3>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, 1fr)` }}>
            {Array.from({ length: Math.min(count, cols * 2) }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                <div className="bg-gray-200 h-16" />
                <div className="p-2">
                  <div className="h-2 bg-gray-200 rounded w-3/4 mb-1" />
                  {!!p.showPrice && <span className="text-xs font-bold" style={{ color: primaryColor }}>99 ر.س</span>}
                  {!!p.showRating && <div className="text-yellow-400 text-xs mt-0.5">★★★★★</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'banner':
      return (
        <div className="px-4 py-3 text-center text-white text-xs font-medium"
          style={{ backgroundColor: (p.bgColor as string) || '#00cec9', color: (p.textColor as string) || '#fff' }}>
          {(p.text as string) || 'عرض خاص!'}
        </div>
      );
    case 'testimonials': {
      const cols = (p.columns as number) || 3;
      return (
        <div className="p-4 bg-gray-50">
          <h3 className="text-sm font-bold mb-3 text-center">آراء العملاء</h3>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)` }}>
            {Array.from({ length: Math.min(cols, 3) }).map((_, i) => (
              <div key={i} className="bg-white p-3 rounded-lg shadow-sm">
                <div className="text-yellow-400 text-xs mb-1">★★★★★</div>
                <p className="text-xs text-gray-500 mb-2">خدمة ممتازة ومنتجات رائعة</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-200" />
                  <span className="text-xs font-medium">عميل {i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'features': {
      const items = (p.items as Array<{ icon: string; title: string; desc: string }>) || [];
      return (
        <div className="p-4">
          <div className="grid grid-cols-4 gap-2">
            {items.slice(0, 4).map((item, i) => (
              <div key={i} className="text-center p-2">
                <span className="text-lg">{item.icon}</span>
                <p className="text-xs font-medium mt-1">{item.title}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'newsletter':
      return (
        <div className="p-4 text-center" style={{ backgroundColor: primaryColor + '10' }}>
          <h3 className="text-sm font-bold mb-1">{(p.title as string) || 'النشرة البريدية'}</h3>
          <p className="text-xs text-gray-500 mb-2">{(p.subtitle as string) || ''}</p>
          <div className="flex gap-1 max-w-[200px] mx-auto">
            <div className="flex-1 bg-gray-100 rounded px-2 py-1 text-xs text-gray-400 text-right">بريدك الإلكتروني</div>
            <span className="text-xs text-white px-3 py-1 rounded" style={{ backgroundColor: primaryColor }}>
              {(p.buttonText as string) || 'اشترك'}
            </span>
          </div>
        </div>
      );
    case 'brands':
      return (
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center justify-center gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`w-12 h-6 bg-gray-200 rounded ${p.grayscale ? 'opacity-40' : ''}`} />
            ))}
          </div>
        </div>
      );
    case 'gallery': {
      const cols = (p.columns as number) || 3;
      return (
        <div className="p-4">
          <h3 className="text-sm font-bold mb-3">معرض الصور</h3>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols * 2 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded aspect-square" />
            ))}
          </div>
        </div>
      );
    }
    case 'faq': {
      const items = (p.items as Array<{ q: string; a: string }>) || [];
      return (
        <div className="p-4">
          <h3 className="text-sm font-bold mb-3">الأسئلة الشائعة</h3>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs font-medium mb-1">{item.q}</p>
                <p className="text-xs text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    default:
      return <div className="p-4 text-center text-gray-400 text-xs">قسم غير معروف</div>;
  }
}
