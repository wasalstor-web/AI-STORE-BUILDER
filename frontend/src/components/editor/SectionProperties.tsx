import type { EditorSection } from './types';

interface Props {
  section: EditorSection | null;
  onUpdate: (id: string, props: Record<string, unknown>) => void;
}

export default function SectionProperties({ section, onUpdate }: Props) {
  if (!section) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm p-6 text-center">
        اختر قسماً من القائمة لتعديل إعداداته
      </div>
    );
  }

  const update = (key: string, value: unknown) => {
    onUpdate(section.id, { ...section.props, [key]: value });
  };

  return (
    <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
      <div className="flex items-center gap-2 pb-3 border-b border-dark-border">
        <span className="text-lg">{section.icon}</span>
        <h3 className="font-semibold text-sm">{section.label}</h3>
      </div>

      {/* Dynamic fields per section type */}
      {section.type === 'hero' && (
        <>
          <Field label="العنوان">
            <input
              className="input-field text-sm"
              value={(section.props.title as string) || ''}
              onChange={(e) => update('title', e.target.value)}
            />
          </Field>
          <Field label="العنوان الفرعي">
            <input
              className="input-field text-sm"
              value={(section.props.subtitle as string) || ''}
              onChange={(e) => update('subtitle', e.target.value)}
            />
          </Field>
          <Field label="نص الزر">
            <input
              className="input-field text-sm"
              value={(section.props.buttonText as string) || ''}
              onChange={(e) => update('buttonText', e.target.value)}
            />
          </Field>
          <Field label="لون الخلفية">
            <div className="flex gap-2">
              <input
                type="color"
                value={(section.props.bgColor as string) || '#6c5ce7'}
                onChange={(e) => update('bgColor', e.target.value)}
                className="w-10 h-10 rounded-lg border border-dark-border cursor-pointer bg-transparent"
              />
              <input
                className="input-field text-sm flex-1"
                dir="ltr"
                value={(section.props.bgColor as string) || ''}
                onChange={(e) => update('bgColor', e.target.value)}
              />
            </div>
          </Field>
          <Field label="الحجم">
            <select
              className="input-field text-sm"
              value={(section.props.height as string) || 'large'}
              onChange={(e) => update('height', e.target.value)}
            >
              <option value="small">صغير</option>
              <option value="medium">متوسط</option>
              <option value="large">كبير</option>
            </select>
          </Field>
        </>
      )}

      {section.type === 'categories' && (
        <>
          <Field label="عدد الأعمدة">
            <select
              className="input-field text-sm"
              value={String(section.props.columns || 4)}
              onChange={(e) => update('columns', parseInt(e.target.value))}
            >
              {[2, 3, 4, 6].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="عرض بالصور">
            <Toggle value={section.props.showImages as boolean} onChange={(v) => update('showImages', v)} />
          </Field>
        </>
      )}

      {section.type === 'featured_products' && (
        <>
          <Field label="عدد الأعمدة">
            <select
              className="input-field text-sm"
              value={String(section.props.columns || 4)}
              onChange={(e) => update('columns', parseInt(e.target.value))}
            >
              {[2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="عدد المنتجات">
            <select
              className="input-field text-sm"
              value={String(section.props.count || 8)}
              onChange={(e) => update('count', parseInt(e.target.value))}
            >
              {[4, 8, 12, 16].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="عرض السعر">
            <Toggle value={section.props.showPrice as boolean} onChange={(v) => update('showPrice', v)} />
          </Field>
          <Field label="عرض التقييم">
            <Toggle value={section.props.showRating as boolean} onChange={(v) => update('showRating', v)} />
          </Field>
        </>
      )}

      {section.type === 'banner' && (
        <>
          <Field label="النص">
            <input
              className="input-field text-sm"
              value={(section.props.text as string) || ''}
              onChange={(e) => update('text', e.target.value)}
            />
          </Field>
          <Field label="لون الخلفية">
            <div className="flex gap-2">
              <input
                type="color"
                value={(section.props.bgColor as string) || '#00cec9'}
                onChange={(e) => update('bgColor', e.target.value)}
                className="w-10 h-10 rounded-lg border border-dark-border cursor-pointer bg-transparent"
              />
              <input className="input-field text-sm flex-1" dir="ltr"
                value={(section.props.bgColor as string) || ''} onChange={(e) => update('bgColor', e.target.value)} />
            </div>
          </Field>
        </>
      )}

      {section.type === 'testimonials' && (
        <>
          <Field label="عدد الأعمدة">
            <select
              className="input-field text-sm"
              value={String(section.props.columns || 3)}
              onChange={(e) => update('columns', parseInt(e.target.value))}
            >
              {[2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <Field label="تمرير تلقائي">
            <Toggle value={section.props.autoSlide as boolean} onChange={(v) => update('autoSlide', v)} />
          </Field>
        </>
      )}

      {section.type === 'newsletter' && (
        <>
          <Field label="العنوان">
            <input className="input-field text-sm" value={(section.props.title as string) || ''} onChange={(e) => update('title', e.target.value)} />
          </Field>
          <Field label="العنوان الفرعي">
            <input className="input-field text-sm" value={(section.props.subtitle as string) || ''} onChange={(e) => update('subtitle', e.target.value)} />
          </Field>
          <Field label="نص الزر">
            <input className="input-field text-sm" value={(section.props.buttonText as string) || ''} onChange={(e) => update('buttonText', e.target.value)} />
          </Field>
        </>
      )}

      {section.type === 'gallery' && (
        <Field label="عدد الأعمدة">
          <select
            className="input-field text-sm"
            value={String(section.props.columns || 3)}
            onChange={(e) => update('columns', parseInt(e.target.value))}
          >
            {[2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
      )}

      {section.type === 'brands' && (
        <Field label="أبيض وأسود">
          <Toggle value={section.props.grayscale as boolean} onChange={(v) => update('grayscale', v)} />
        </Field>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-text-muted block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors relative ${value ? 'bg-primary' : 'bg-dark-border'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${value ? 'right-0.5' : 'right-[22px]'}`} />
    </button>
  );
}
