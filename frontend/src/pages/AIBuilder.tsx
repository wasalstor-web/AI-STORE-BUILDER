import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { storesApi, aiChatApi } from '../lib/api';
import { STORE_TEMPLATES, getTemplateHTML, type StoreTemplate } from '../data/templates';
import { SECTION_LIBRARY, generateSingleSectionHTML, type SectionType } from '../data/templateEngine';
import toast from 'react-hot-toast';
import {
  Send, Sparkles, ArrowRight, Monitor, Smartphone, Tablet,
  Loader2, RotateCcw, Download, Check,
  Code2, PanelRightClose,
  Layers, Plus,
  Layout, Type, ShoppingBag, Undo2, Redo2,
  Wand2, MessageSquare,
  Zap, LayoutTemplate,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  html?: string;
  timestamp: Date;
}

interface HistoryEntry {
  html: string;
  label: string;
  timestamp: Date;
}

const CATEGORY_ICONS: Record<string, typeof Layers> = {
  hero: Layout,
  content: Type,
  products: ShoppingBag,
  social: MessageSquare,
  marketing: Zap,
  footer: Layers,
};
void CATEGORY_ICONS;

const CATEGORY_LABELS: Record<string, string> = {
  hero: 'الرأس والبطل',
  content: 'المحتوى',
  products: 'المنتجات',
  social: 'اجتماعي',
  marketing: 'تسويق',
  footer: 'التذييل',
};

const AI_SYSTEM_PROMPT = `أنت مطور ويب خبير. المستخدم يطلب تعديلات على متجره الإلكتروني.
عدّل HTML/CSS المتجر حسب طلب المستخدم. أرجع الكود الكامل للصفحة (HTML كامل مع head و body).
لا تكتب أي شرح — فقط أرجع كود HTML كامل.
التزم بـ RTL والعربية. استخدم خط Tajawal.
الأهم: أرجع HTML كامل فقط بدون markdown أو \`\`\`.`;
void AI_SYSTEM_PROMPT;

const QUICK_ACTIONS = [
  { label: '🎨 غيّر الألوان', prompt: 'غيّر ألوان المتجر' },
  { label: '📦 أضف منتجات', prompt: 'أضف 4 منتجات جديدة بأسماء وأسعار حقيقية' },
  { label: '🔥 أضف عروض', prompt: 'أضف قسم عروض خاصة مع بطاقات ملونة وخصومات' },
  { label: '💬 تقييمات عملاء', prompt: 'أضف قسم آراء العملاء مع 3 تقييمات بنجوم' },
  { label: '📧 نشرة بريدية', prompt: 'أضف قسم اشتراك بريد إلكتروني احترافي' },
  { label: '❓ أسئلة شائعة', prompt: 'أضف قسم أسئلة شائعة تفاعلي (أكورديون)' },
  { label: '📞 تواصل معنا', prompt: 'أضف قسم تواصل معنا مع نموذج ومعلومات الاتصال' },
  { label: '⏰ عداد تنازلي', prompt: 'أضف عداد تنازلي لعرض محدود المدة بتصميم جميل' },
  { label: '📊 إحصائيات', prompt: 'أضف قسم إحصائيات (عملاء، منتجات، طلبات، تقييم)' },
  { label: '🖼️ معرض صور', prompt: 'أضف معرض صور بشبكة ملونة جميلة مع hover effects' },
  { label: '✨ خلّه فاخر', prompt: 'حوّل التصميم لستايل فاخر وملكي مع ألوان ذهبية وخلفية داكنة' },
  { label: '🌙 وضع داكن', prompt: 'حوّل المتجر للوضع الداكن مع ألوان أنيقة' },
];

type PanelMode = 'chat' | 'sections' | 'templates';

export default function AIBuilder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const storeName = searchParams.get('name') || 'متجري';
  const storeType = searchParams.get('type') || 'general';
  const templateId = searchParams.get('template') || '';

  // ── State ──
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'system',
      content: `مرحباً! 👋 أنا مساعدك الذكي لبناء "${storeName}".\n\nبنيت لك متجر احترافي كامل — جرّب:\n• اكتب ما تريد تغييره\n• اسحب أقسام جاهزة من مكتبة الأقسام\n• أو اختر قالب آخر من معرض القوالب\n\n💡 أمثلة: "غيّر الألوان لأخضر"، "أضف عروض"، "خلّه فاخر"`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentHTML, setCurrentHTML] = useState(() => {
    if (templateId) return getTemplateHTML(templateId, storeName);
    // Find best matching template for store type
    const match = STORE_TEMPLATES.find(t => t.storeType === storeType) || STORE_TEMPLATES[4]; // simple-shop
    return getTemplateHTML(match.id, storeName);
  });
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showCode, setShowCode] = useState(false);
  const [panelMode, setPanelMode] = useState<PanelMode>('chat');
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [sectionFilter, setSectionFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('الكل');

  // Version history
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Push to history
  const pushHistory = useCallback((html: string, label: string) => {
    setHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), { html, label, timestamp: new Date() }];
      return newHistory.slice(-20); // keep last 20
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) { doc.open(); doc.write(currentHTML); doc.close(); }
    }
  }, [currentHTML]);

  // ── Initial history entry ──
  useEffect(() => {
    pushHistory(currentHTML, 'تصميم أولي');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = useCallback(async (textOverride?: string) => {
    const text = (textOverride || input).trim();
    if (!text || isGenerating) return;

    const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    if (!textOverride) setInput('');
    setIsGenerating(true);

    try {
      const { data } = await aiChatApi.send({
        message: text,
        current_html: currentHTML,
        store_name: storeName,
        store_type: storeType,
      });

      const newHTML = data.html || currentHTML;
      setCurrentHTML(newHTML);
      pushHistory(newHTML, text.slice(0, 30));
      const aiMsg: ChatMessage = { id: `ai-${Date.now()}`, role: 'ai', content: data.message || 'تم تطبيق التعديلات! ✅ شوف المعاينة 👈', html: newHTML, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      applyLocalFallback(text);
    } finally {
      setIsGenerating(false);
    }
  }, [input, isGenerating, currentHTML, storeName, storeType, pushHistory]);

  const applyLocalFallback = (text: string) => {
    let html = currentHTML;
    const changes: string[] = [];

    if (text.includes('أخضر')) { html = html.replace(/var\(--p\)/g, '#2ecc71').replace(/#6c5ce7/g, '#2ecc71'); changes.push('الأخضر'); }
    if (text.includes('أحمر')) { html = html.replace(/var\(--p\)/g, '#e74c3c').replace(/#6c5ce7/g, '#e74c3c'); changes.push('الأحمر'); }
    if (text.includes('ذهبي')) { html = html.replace(/var\(--p\)/g, '#d4af37').replace(/#6c5ce7/g, '#d4af37'); changes.push('الذهبي'); }
    if (text.includes('أزرق')) { html = html.replace(/var\(--p\)/g, '#0984e3').replace(/#6c5ce7/g, '#0984e3'); changes.push('الأزرق'); }
    if (text.includes('وردي')) { html = html.replace(/var\(--p\)/g, '#e84393').replace(/#6c5ce7/g, '#e84393'); changes.push('الوردي'); }
    if (text.includes('فاخر') || text.includes('ملكي') || text.includes('luxury')) {
      html = html.replace(/var\(--p\)/g, '#d4af37').replace(/var\(--bg\)/g, '#0a0a0f');
      changes.push('ستايل فاخر');
    }
    if (text.includes('داكن') || text.includes('dark')) {
      html = html.replace(/var\(--bg\)/g, '#0a0a0f').replace(/var\(--cb\)/g, '#14141f');
      changes.push('وضع داكن');
    }

    setCurrentHTML(html);
    if (changes.length > 0) pushHistory(html, changes.join(' + '));

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`, role: 'ai',
      content: changes.length > 0
        ? `تم تطبيق: ${changes.join(', ')} ✅ شوف المعاينة!`
        : 'طبّقت تعديلات على التصميم! 👈 شوف المعاينة',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handlePublish = async () => {
    try {
      // First generate/create the store
      const res = await storesApi.generate({ name: storeName, store_type: storeType });
      const storeId = res.data?.store_id || res.data?.id;
      // Then save the current HTML to the store
      if (storeId) {
        await storesApi.update(storeId, { html_content: currentHTML, status: 'active' });
      }
      toast.success('تم نشر متجرك بنجاح! 🚀');
      navigate('/dashboard');
    } catch {
      toast.error('حدث خطأ أثناء النشر');
    }
  };

  const resetHTML = () => {
    const match = STORE_TEMPLATES.find(t => t.storeType === storeType) || STORE_TEMPLATES[4];
    const html = getTemplateHTML(match.id, storeName);
    setCurrentHTML(html);
    pushHistory(html, 'إعادة ضبط');
    toast.success('تم إعادة ضبط التصميم');
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setCurrentHTML(history[historyIndex - 1].html);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setCurrentHTML(history[historyIndex + 1].html);
    }
  };

  const addSection = (sectionType: SectionType) => {
    const sectionHTML = generateSingleSectionHTML(sectionType, {}, storeName, storeType);
    // Insert before </body>
    const newHTML = currentHTML.replace('</body>', `${sectionHTML}\n</body>`);
    setCurrentHTML(newHTML);
    pushHistory(newHTML, `إضافة ${SECTION_LIBRARY.find(s => s.type === sectionType)?.name || sectionType}`);
    toast.success('تم إضافة القسم! 👈 شوف المعاينة');
    setPanelMode('chat');
  };

  const applyTemplate = (template: StoreTemplate) => {
    const html = getTemplateHTML(template.id, storeName);
    setCurrentHTML(html);
    pushHistory(html, `قالب: ${template.name}`);
    toast.success(`تم تطبيق قالب "${template.name}"!`);
    setPanelMode('chat');
  };

  const downloadHTML = () => {
    const blob = new Blob([currentHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${storeName}.html`; a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تحميل الملف');
  };

  const filteredSections = sectionFilter === 'all'
    ? SECTION_LIBRARY
    : SECTION_LIBRARY.filter(s => s.category === sectionFilter);

  const filteredTemplates = templateFilter === 'الكل'
    ? STORE_TEMPLATES
    : STORE_TEMPLATES.filter(t => t.category === templateFilter);

  const deviceWidth = previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%';

  return (
    <div className="h-screen flex flex-col bg-dark-bg overflow-hidden -m-4 lg:-m-8">
      {/* ══ Top Bar ══ */}
      <div className="flex items-center justify-between px-3 py-2 bg-dark-surface border-b border-dark-border shrink-0">
        <div className="flex items-center gap-2">
          <Link to="/stores/create" className="text-text-muted hover:text-text-secondary p-1">
            <ArrowRight className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm">{storeName}</span>
          </div>
          <span className="badge badge-primary text-[9px]">AI Builder Pro</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Undo/Redo */}
          <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-dark-hover disabled:opacity-30 transition-colors" title="تراجع">
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-dark-hover disabled:opacity-30 transition-colors" title="إعادة">
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-5 bg-dark-border mx-1" />

          {/* Device switcher */}
          <div className="flex items-center gap-0.5 bg-dark-bg rounded-lg p-0.5 border border-dark-border">
            {([
              { device: 'desktop' as const, icon: Monitor },
              { device: 'tablet' as const, icon: Tablet },
              { device: 'mobile' as const, icon: Smartphone },
            ]).map(({ device, icon: Icon }) => (
              <button key={device} onClick={() => setPreviewDevice(device)}
                className={`p-1.5 rounded-md transition-colors ${previewDevice === device ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-dark-border mx-1" />

          <button onClick={() => setShowCode(!showCode)}
            className={`p-1.5 rounded-lg transition-colors ${showCode ? 'bg-primary/20 text-primary-light' : 'text-text-muted hover:text-text-primary hover:bg-dark-hover'}`} title="عرض الكود">
            <Code2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={downloadHTML} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-dark-hover rounded-lg transition-colors" title="تحميل HTML">
            <Download className="w-3.5 h-3.5" />
          </button>
          <button onClick={resetHTML} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-dark-hover rounded-lg transition-colors" title="إعادة ضبط">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-5 bg-dark-border mx-1" />
          <button onClick={handlePublish} className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            نشر المتجر
          </button>
        </div>
      </div>

      {/* ══ Main Area ══ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left Panel ── */}
        <AnimatePresence>
          {!panelCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 flex flex-col bg-dark-surface border-l border-dark-border overflow-hidden"
            >
              {/* Panel Tabs */}
              <div className="flex items-center border-b border-dark-border shrink-0">
                {([
                  { mode: 'chat' as PanelMode, icon: MessageSquare, label: 'الدردشة' },
                  { mode: 'sections' as PanelMode, icon: Layers, label: 'الأقسام' },
                  { mode: 'templates' as PanelMode, icon: LayoutTemplate, label: 'القوالب' },
                ]).map(({ mode, icon: Icon, label }) => (
                  <button key={mode} onClick={() => setPanelMode(mode)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                      panelMode === mode ? 'border-primary text-primary-light bg-primary/5' : 'border-transparent text-text-muted hover:text-text-secondary'
                    }`}>
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
                <button onClick={() => setPanelCollapsed(true)} className="p-2 text-text-muted hover:text-text-primary">
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>

              {/* ── Chat Panel ── */}
              {panelMode === 'chat' && (
                <>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {messages.map((msg) => (
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          msg.role === 'user' ? 'bg-primary text-white rounded-br-md'
                            : msg.role === 'system' ? 'bg-dark-card border border-dark-border text-text-primary rounded-bl-md'
                            : 'bg-accent/10 border border-accent/20 text-text-primary rounded-bl-md'
                        }`}>
                          {msg.role === 'ai' && <Wand2 className="w-3 h-3 text-accent inline-block ml-1 mb-0.5" />}
                          <span className="whitespace-pre-wrap">{msg.content}</span>
                        </div>
                      </motion.div>
                    ))}
                    {isGenerating && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                        <div className="bg-dark-card border border-dark-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-accent" />
                          <span className="text-sm text-text-muted">جاري البناء...</span>
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="px-3 pb-2">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Zap className="w-3 h-3 text-accent" />
                      <span className="text-[10px] text-text-muted font-medium">إجراءات سريعة</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 max-h-[100px] overflow-y-auto">
                      {QUICK_ACTIONS.map((action) => (
                        <button key={action.label} onClick={() => handleSend(action.prompt)}
                          className="text-[10px] px-2 py-1.5 rounded-lg bg-dark-hover/50 text-text-muted hover:text-text-primary hover:bg-dark-hover transition-colors text-center leading-tight">
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-dark-border">
                    <div className="flex items-end gap-2">
                      <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="قول للذكاء الاصطناعي إيش يعدّل..."
                        rows={1}
                        className="input-field text-sm py-2.5 resize-none flex-1 min-h-[42px] max-h-[100px]"
                        style={{ height: 'auto' }}
                        onInput={(e) => { const t = e.currentTarget; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 100) + 'px'; }}
                      />
                      <button onClick={() => handleSend()} disabled={!input.trim() || isGenerating}
                        className="p-2.5 rounded-xl bg-primary text-white disabled:opacity-40 hover:bg-primary-dark transition-colors shrink-0">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── Sections Library Panel ── */}
              {panelMode === 'sections' && (
                <div className="flex-1 overflow-y-auto">
                  {/* Category Filter */}
                  <div className="p-3 border-b border-dark-border">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Layers className="w-3.5 h-3.5 text-primary-light" />
                      <span className="text-xs font-semibold">مكتبة الأقسام</span>
                      <span className="text-[10px] text-text-muted mr-auto">{SECTION_LIBRARY.length} قسم</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => setSectionFilter('all')}
                        className={`text-[10px] px-2.5 py-1 rounded-lg transition-colors ${sectionFilter === 'all' ? 'bg-primary text-white' : 'bg-dark-hover text-text-muted'}`}>
                        الكل
                      </button>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <button key={key} onClick={() => setSectionFilter(key)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg transition-colors ${sectionFilter === key ? 'bg-primary text-white' : 'bg-dark-hover text-text-muted'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section Cards */}
                  <div className="p-3 space-y-2">
                    {filteredSections.map((section) => (
                      <motion.div key={section.type} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className="group flex items-center gap-3 p-3 rounded-xl bg-dark-card border border-dark-border hover:border-primary/30 transition-all cursor-pointer"
                        onClick={() => addSection(section.type)}>
                        <div className="w-10 h-10 rounded-xl bg-dark-hover flex items-center justify-center text-lg shrink-0 group-hover:bg-primary/10 transition-colors">
                          {section.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{section.name}</span>
                            <span className="text-[10px] text-text-muted">{section.nameEn}</span>
                          </div>
                          <p className="text-[11px] text-text-muted truncate">{section.description}</p>
                        </div>
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                            <Plus className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Templates Panel ── */}
              {panelMode === 'templates' && (
                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 border-b border-dark-border">
                    <div className="flex items-center gap-1.5 mb-2">
                      <LayoutTemplate className="w-3.5 h-3.5 text-primary-light" />
                      <span className="text-xs font-semibold">معرض القوالب</span>
                      <span className="text-[10px] text-text-muted mr-auto">{STORE_TEMPLATES.length} قالب</span>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {['الكل', ...new Set(STORE_TEMPLATES.map(t => t.category))].map(cat => (
                        <button key={cat} onClick={() => setTemplateFilter(cat)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg transition-colors ${templateFilter === cat ? 'bg-primary text-white' : 'bg-dark-hover text-text-muted'}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 space-y-3">
                    {filteredTemplates.map((template) => (
                      <motion.div key={template.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className="group rounded-xl overflow-hidden border border-dark-border hover:border-primary/30 transition-all cursor-pointer"
                        onClick={() => applyTemplate(template)}>
                        <div className="h-24 relative" style={{ background: template.thumbnail }}>
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-semibold bg-primary/80 backdrop-blur-sm px-3 py-1.5 rounded-lg">تطبيق القالب</span>
                          </div>
                        </div>
                        <div className="p-3 bg-dark-card">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold">{template.name}</span>
                            <span className="text-[10px] text-text-muted bg-dark-hover px-2 py-0.5 rounded-full">{template.category}</span>
                          </div>
                          <p className="text-[11px] text-text-muted line-clamp-1">{template.description}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="w-3 h-3 rounded-full border border-dark-border" style={{ background: template.primaryColor }} />
                            <div className="w-3 h-3 rounded-full border border-dark-border" style={{ background: template.accentColor }} />
                            <span className="text-[10px] text-text-muted mr-auto">{template.sections.length} قسم</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel Toggle */}
        {panelCollapsed && (
          <div className="flex flex-col items-center gap-1 py-4 px-1 bg-dark-surface border-l border-dark-border">
            <button onClick={() => { setPanelCollapsed(false); setPanelMode('chat'); }} className="p-2 rounded-lg hover:bg-dark-hover text-text-muted hover:text-primary-light transition-colors" title="الدردشة">
              <MessageSquare className="w-4 h-4" />
            </button>
            <button onClick={() => { setPanelCollapsed(false); setPanelMode('sections'); }} className="p-2 rounded-lg hover:bg-dark-hover text-text-muted hover:text-primary-light transition-colors" title="الأقسام">
              <Layers className="w-4 h-4" />
            </button>
            <button onClick={() => { setPanelCollapsed(false); setPanelMode('templates'); }} className="p-2 rounded-lg hover:bg-dark-hover text-text-muted hover:text-primary-light transition-colors" title="القوالب">
              <LayoutTemplate className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Preview Panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-dark-bg">
          {/* Version History Bar */}
          {history.length > 1 && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-dark-surface/50 border-b border-dark-border/50 overflow-x-auto">
              <span className="text-[10px] text-text-muted shrink-0">التاريخ:</span>
              {history.map((entry, i) => (
                <button key={i} onClick={() => { setHistoryIndex(i); setCurrentHTML(entry.html); }}
                  className={`text-[10px] px-2 py-0.5 rounded-md shrink-0 transition-colors ${
                    i === historyIndex ? 'bg-primary/20 text-primary-light font-medium' : 'text-text-muted hover:text-text-primary hover:bg-dark-hover'
                  }`}>
                  {entry.label}
                </button>
              ))}
            </div>
          )}

          {showCode ? (
            <div className="flex-1 overflow-auto p-4">
              <pre className="text-xs text-text-secondary font-mono bg-dark-surface rounded-xl p-4 overflow-auto h-full border border-dark-border whitespace-pre-wrap">
                {currentHTML}
              </pre>
            </div>
          ) : (
            <div className="flex-1 flex items-start justify-center overflow-auto p-4">
              <div className="bg-white rounded-xl overflow-hidden shadow-2xl border border-dark-border/30 transition-all duration-300 h-full"
                style={{ width: deviceWidth, maxWidth: '100%' }}>
                <iframe ref={iframeRef} className="w-full h-full border-0" sandbox="allow-scripts" title="Store Preview" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
