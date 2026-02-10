import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { storesApi } from '../lib/api';
import { STORE_TEMPLATES, getTemplateHTML, getCategories, type StoreTemplate } from '../data/templates';
import toast from 'react-hot-toast';
import {
  Sparkles, ArrowRight, Check, Search, LayoutGrid,
  MessageSquareText, Eye, Loader2, X, Monitor, Smartphone, Tablet,
  Palette, Star, Layers, ChevronLeft,
} from 'lucide-react';

const STORE_TYPES = [
  { v: 'fashion', l: '👗 أزياء', color: '#d4af37' },
  { v: 'electronics', l: '📱 إلكترونيات', color: '#00b4d8' },
  { v: 'beauty', l: '💄 تجميل', color: '#e84393' },
  { v: 'food', l: '🍽️ أغذية', color: '#e17055' },
  { v: 'jewelry', l: '💎 مجوهرات', color: '#ffd700' },
  { v: 'sports', l: '⚽ رياضة', color: '#00b894' },
  { v: 'kids', l: '🧸 أطفال', color: '#a29bfe' },
  { v: 'home', l: '🏠 ديكور', color: '#b8860b' },
  { v: 'perfume', l: '🌹 عطور', color: '#6c3483' },
  { v: 'health', l: '🌿 صحة', color: '#27ae60' },
  { v: 'auto', l: '🚗 سيارات', color: '#e74c3c' },
  { v: 'restaurant', l: '🍕 مطعم', color: '#ff6348' },
  { v: 'portfolio', l: '💼 محفظة أعمال', color: '#5f27cd' },
  { v: 'blog', l: '✍️ مدونة', color: '#01a3a4' },
  { v: 'realestate', l: '🏢 عقارات', color: '#2c3e50' },
  { v: 'general', l: '🏪 عام', color: '#6c5ce7' },
];

export default function CreateStore() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'name' | 'templates'>('name');
  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<StoreTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<StoreTemplate | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [filter, setFilter] = useState('الكل');
  const [search, setSearch] = useState('');
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  const categories = useMemo(() => getCategories(), []);

  const generateMutation = useMutation({
    mutationFn: (data: { name: string; store_type: string; branding?: Record<string, unknown> }) =>
      storesApi.generate({ name: data.name, store_type: data.store_type, branding: data.branding }),
    onSuccess: () => { toast.success('جاري بناء متجرك! 🚀'); navigate('/dashboard'); },
    onError: () => toast.error('حدث خطأ أثناء إنشاء المتجر'),
  });

  const filteredTemplates = useMemo(() => STORE_TEMPLATES.filter((t) => {
    if (filter !== 'الكل' && t.category !== filter) return false;
    if (search && !t.name.includes(search) && !t.description.includes(search) && !t.nameEn.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [filter, search]);

  // Load live preview HTML into iframe
  useEffect(() => {
    if (previewTemplate && previewIframeRef.current) {
      const doc = previewIframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(getTemplateHTML(previewTemplate.id, storeName || previewTemplate.name));
        doc.close();
      }
    }
  }, [previewTemplate, storeName]);

  const handleUseTemplate = (template?: StoreTemplate) => {
    const t = template || selectedTemplate;
    if (!t || !storeName) return;
    // Navigate to AI Builder with template pre-loaded
    navigate(`/stores/ai-builder?name=${encodeURIComponent(storeName)}&type=${t.storeType}&template=${t.id}`);
  };

  const handleGoToAIBuilder = () => {
    if (!storeName) return toast.error('أدخل اسم المتجر أولاً');
    navigate(`/stores/ai-builder?name=${encodeURIComponent(storeName)}&type=${storeType || 'general'}`);
  };

  const previewDeviceWidth = previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%';

  return (
    <div className="max-w-7xl mx-auto">
      <AnimatePresence mode="wait">
        {/* ═══════ Step 1: Store Name ═══════ */}
        {step === 'name' && (
          <motion.div key="name" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto pt-6">
            <div className="text-center mb-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-3xl bg-linear-to-br from-primary via-accent to-primary-dark flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">أنشئ متجرك الإلكتروني</h1>
              <p className="text-text-secondary text-lg">اختر اسم ونوع متجرك وراح نجهزلك كل شي 🚀</p>
            </div>

            <div className="glass-card p-8 space-y-6">
              <div>
                <label className="text-sm font-semibold text-text-secondary mb-2 block">اسم المتجر *</label>
                <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
                  placeholder="مثال: متجر الأناقة" className="input-field text-lg py-4" autoFocus />
                <p className="text-xs text-text-muted mt-1.5">سيظهر كـ: <span className="font-mono text-primary-light" dir="ltr">{(storeName || 'your-store').toLowerCase().replace(/\s+/g, '-')}.aibuilder.app</span></p>
              </div>

              <div>
                <label className="text-sm font-semibold text-text-secondary mb-3 block">نوع المتجر</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {STORE_TYPES.map((t) => (
                    <button key={t.v} type="button" onClick={() => setStoreType(t.v)}
                      className={`px-3 py-3 rounded-xl border text-sm transition-all font-medium ${
                        storeType === t.v 
                          ? 'border-primary bg-primary/10 text-primary-light shadow-sm shadow-primary/10' 
                          : 'border-dark-border hover:border-dark-hover'
                      }`}>
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => storeName.length >= 2 ? setStep('templates') : toast.error('اسم المتجر لازم حرفين على الأقل')}
                  disabled={storeName.length < 2}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 text-lg py-4 disabled:opacity-50">
                  <Palette className="w-5 h-5" />
                  اختر قالب
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                <button type="button" onClick={handleGoToAIBuilder}
                  className="btn-outline flex items-center justify-center gap-2 text-lg py-4 border-accent text-accent hover:bg-accent/10 px-6">
                  <Sparkles className="w-5 h-5" />
                  ابنِ بالـ AI
                </button>
              </div>
            </div>

            {/* Store count badge */}
            <div className="text-center mt-6">
              <span className="inline-flex items-center gap-2 text-xs text-text-muted bg-dark-surface px-4 py-2 rounded-full border border-dark-border">
                <Star className="w-3 h-3 text-accent" />
                {STORE_TEMPLATES.length} قالب احترافي جاهز — مجاناً
              </span>
            </div>
          </motion.div>
        )}

        {/* ═══════ Step 2: Template Gallery ═══════ */}
        {step === 'templates' && (
          <motion.div key="templates" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <button onClick={() => setStep('name')} className="text-text-muted hover:text-text-secondary text-sm flex items-center gap-1 mb-1">
                  <ArrowRight className="w-4 h-4" />
                  رجوع
                </button>
                <h1 className="text-2xl font-bold">اختر قالب لـ "{storeName}"</h1>
                <p className="text-text-secondary text-sm mt-1">{STORE_TEMPLATES.length} قالب احترافي — اضغط على أي قالب لمعاينته حياً</p>
              </div>
              <button onClick={handleGoToAIBuilder}
                className="btn-outline flex items-center gap-2 border-accent text-accent hover:bg-accent/10">
                <MessageSquareText className="w-4 h-4" />
                ابنِ بالذكاء الاصطناعي بدون قالب
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث في القوالب..." className="input-field pr-10 text-sm py-2.5" />
              </div>
              <div className="flex gap-1.5 shrink-0">
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setFilter(cat)}
                    className={`px-3.5 py-2 rounded-xl text-sm transition-all whitespace-nowrap font-medium ${
                      filter === cat ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'bg-dark-surface border border-dark-border text-text-secondary hover:border-dark-hover'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {filteredTemplates.map((template, i) => (
                <motion.div key={template.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`glass-card overflow-hidden cursor-pointer transition-all group ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-primary border-primary' : 'hover:border-dark-hover hover:-translate-y-1'
                  }`}>
                  {/* Thumbnail */}
                  <div className="h-40 relative overflow-hidden" style={{ background: template.thumbnail }}
                    onClick={() => setPreviewTemplate(template)}>
                    {/* Mini wireframe overlay */}
                    <div className="absolute inset-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 opacity-70 group-hover:opacity-100 transition-opacity">
                      <div className="h-1.5 w-16 bg-white/30 rounded mb-2" />
                      <div className="h-8 w-full bg-white/15 rounded-md mb-2" />
                      <div className="grid grid-cols-3 gap-1">
                        {[1, 2, 3].map(n => <div key={n} className="aspect-square bg-white/20 rounded" />)}
                      </div>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <span className="text-white text-sm font-semibold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        معاينة حية
                      </span>
                    </div>
                    {selectedTemplate?.id === template.id && (
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="p-3.5" onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-sm">{template.name}</h3>
                      <span className="text-[10px] text-text-muted bg-dark-hover/80 px-2 py-0.5 rounded-full">{template.category}</span>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-1 mb-2">{template.description}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full border border-dark-border/50" style={{ background: template.primaryColor }} />
                      <div className="w-3.5 h-3.5 rounded-full border border-dark-border/50" style={{ background: template.accentColor }} />
                      <span className="text-[10px] text-text-muted mr-auto flex items-center gap-1">
                        <Layers className="w-2.5 h-2.5" />
                        {template.sections.length}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom bar */}
            <AnimatePresence>
              {selectedTemplate && (
                <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
                  className="fixed bottom-0 left-0 right-0 bg-dark-surface/95 backdrop-blur-xl border-t border-dark-border p-4 z-50">
                  <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: selectedTemplate.thumbnail }} />
                      <div>
                        <p className="font-semibold">{selectedTemplate.name}</p>
                        <p className="text-xs text-text-muted">{selectedTemplate.category} • {selectedTemplate.style} • {selectedTemplate.sections.length} قسم</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setPreviewTemplate(selectedTemplate)} className="btn-outline text-sm px-4 py-2.5 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        معاينة
                      </button>
                      <button onClick={() => setSelectedTemplate(null)} className="btn-outline text-sm px-4 py-2.5">إلغاء</button>
                      <button onClick={() => handleUseTemplate()} disabled={generateMutation.isPending}
                        className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2 disabled:opacity-50">
                        {generateMutation.isPending ? (
                          <><Loader2 className="w-4 h-4 animate-spin" />جاري البناء...</>
                        ) : (
                          <><LayoutGrid className="w-4 h-4" />ابنِ بهذا القالب</>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI CTA Card */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="glass-card p-8 text-center border-dashed border-2 border-accent/20 mb-24">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquareText className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">ما لقيت اللي يعجبك؟</h3>
              <p className="text-text-secondary text-sm mb-5 max-w-md mx-auto">خلّ الذكاء الاصطناعي يبني لك متجر مخصص من الصفر — تكلمه وهو يصمم ويبني!</p>
              <button onClick={handleGoToAIBuilder}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                <Sparkles className="w-5 h-5" />
                ابدأ البناء بالذكاء الاصطناعي
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ Live Template Preview Modal ═══════ */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
            onClick={() => setPreviewTemplate(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-surface rounded-2xl overflow-hidden w-full max-w-6xl max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}>
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-dark-border shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl shrink-0" style={{ background: previewTemplate.thumbnail }} />
                  <div>
                    <h2 className="font-bold">{previewTemplate.name} <span className="text-text-muted text-sm font-normal">({previewTemplate.nameEn})</span></h2>
                    <p className="text-xs text-text-muted">{previewTemplate.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Device Switcher */}
                  <div className="flex items-center gap-0.5 bg-dark-bg rounded-lg p-0.5 border border-dark-border">
                    {([
                      { d: 'desktop' as const, icon: Monitor },
                      { d: 'tablet' as const, icon: Tablet },
                      { d: 'mobile' as const, icon: Smartphone },
                    ]).map(({ d, icon: Icon }) => (
                      <button key={d} onClick={() => setPreviewDevice(d)}
                        className={`p-1.5 rounded-md transition-colors ${previewDevice === d ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                  <button onClick={() => handleUseTemplate(previewTemplate)}
                    className="btn-primary text-sm px-5 py-2 flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    ابنِ بهذا القالب
                  </button>
                  <button onClick={() => setPreviewTemplate(null)} className="p-2 rounded-lg hover:bg-dark-hover transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Live Preview */}
              <div className="flex-1 overflow-hidden bg-gray-100 flex items-start justify-center p-4">
                <div className="bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-300 h-full"
                  style={{ width: previewDeviceWidth, maxWidth: '100%' }}>
                  {/* Browser chrome */}
                  <div className="bg-gray-50 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-400 text-center border border-gray-200" dir="ltr">
                      {(storeName || previewTemplate.nameEn).toLowerCase().replace(/\s+/g, '-')}.aibuilder.app
                    </div>
                  </div>
                  <iframe ref={previewIframeRef} className="w-full border-0" style={{ height: 'calc(100% - 36px)' }}
                    sandbox="allow-scripts" title="Template Preview" />
                </div>
              </div>

              {/* Template Info Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-dark-border bg-dark-card shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full border border-dark-border" style={{ background: previewTemplate.primaryColor }} />
                    <div className="w-4 h-4 rounded-full border border-dark-border" style={{ background: previewTemplate.accentColor }} />
                  </div>
                  <span className="text-xs text-text-muted">{previewTemplate.sections.length} قسم</span>
                  <span className="text-xs text-text-muted">•</span>
                  <span className="text-xs text-text-muted">{previewTemplate.features.join(' • ')}</span>
                </div>
                <span className="text-xs text-text-muted bg-dark-hover px-3 py-1 rounded-full">{previewTemplate.style}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
