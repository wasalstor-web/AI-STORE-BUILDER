import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { storesApi } from '../lib/api';
import { getTemplateHTML } from '../data/templates';
import type { Store } from '../types';
import {
  ArrowRight, Globe, CreditCard, Truck, Palette, ExternalLink,
  Clock, CheckCircle, AlertCircle, Loader2, BarChart3, Package,
  Settings, Copy, Bot, Eye, Monitor, Smartphone, Tablet,
  ShoppingCart, Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: 'نشط', color: 'text-success', icon: CheckCircle },
  pending: { label: 'قيد الإنشاء', color: 'text-warning', icon: Clock },
  generating: { label: 'جاري البناء', color: 'text-primary-light', icon: Loader2 },
  failed: { label: 'فشل', color: 'text-danger', icon: AlertCircle },
};

export default function StoreDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: store, isLoading, error } = useQuery<Store>({
    queryKey: ['store', id],
    queryFn: async () => {
      const res = await storesApi.get(id!);
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-text-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        جاري التحميل...
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
        <p className="text-text-secondary">لم يتم العثور على المتجر</p>
        <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 mt-4">
          <ArrowRight className="w-4 h-4" />
          العودة للوحة التحكم
        </Link>
      </div>
    );
  }

  const status = statusConfig[store.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const config = store.config || {};
  const subdomain = (store as unknown as Record<string, unknown>).subdomain as string || store.name.toLowerCase().replace(/\s+/g, '-');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const copyDomain = () => {
    navigator.clipboard.writeText(`${subdomain}.aibuilder.app`);
    toast.success('تم نسخ الرابط!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link to="/dashboard" className="text-text-muted hover:text-text-secondary text-sm flex items-center gap-1 mb-2">
            <ArrowRight className="w-4 h-4" />
            العودة
          </Link>
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <div className={`flex items-center gap-2 mt-1`}>
            <span className={`badge text-xs flex items-center gap-1.5 ${store.status === 'active' ? 'badge-success' : store.status === 'generating' ? 'badge-primary' : 'badge-warning'}`}>
              <StatusIcon className={`w-3 h-3 ${store.status === 'generating' ? 'animate-spin' : ''}`} />
              {status.label}
            </span>
          </div>
        </div>
        {store.status === 'active' && (
          <div className="flex gap-3">
            <Link
              to={`/stores/ai-builder?name=${encodeURIComponent(store.name)}&type=${store.store_type}&storeId=${id}`}
              className="btn-outline flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              تعديل بالـ AI
            </Link>
            <Link
              to={`/stores/${id}/edit`}
              className="btn-outline flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              تعديل التصميم
            </Link>
            <a
              href={`https://${subdomain}.aibuilder.app`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              زيارة المتجر
            </a>
          </div>
        )}
      </motion.div>

      {/* Quick Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BarChart3, label: 'الزيارات', value: '0', color: 'text-primary-light', trend: '--' },
          { icon: Package, label: 'المنتجات', value: '0', color: 'text-accent', trend: 'جديد' },
          { icon: ShoppingCart, label: 'الطلبات', value: '0', color: 'text-success', trend: '--' },
          { icon: Star, label: 'التقييم', value: '5.0 ⭐', color: 'text-warning', trend: '--' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <span className="badge badge-neutral text-[9px]">{stat.trend}</span>
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-text-muted text-xs">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Domain */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary-light" />
          رابط المتجر
        </h2>
        <div className="flex items-center gap-3 bg-dark-surface rounded-xl p-3 border border-dark-border">
          <span dir="ltr" className="text-text-secondary flex-1 font-mono text-sm">
            {subdomain}.aibuilder.app
          </span>
          <button onClick={copyDomain} className="p-2 hover:bg-dark-hover rounded-lg transition-colors">
            <Copy className="w-4 h-4 text-text-muted" />
          </button>
        </div>
      </motion.div>

      {/* Live Preview - always show with template-generated or stored HTML */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Eye className="w-5 h-5 text-accent" />
            معاينة المتجر
          </h2>
          <div className="flex items-center gap-1 bg-dark-bg rounded-lg p-0.5 border border-dark-border">
            {[
              { key: 'desktop' as const, icon: Monitor },
              { key: 'tablet' as const, icon: Tablet },
              { key: 'mobile' as const, icon: Smartphone },
            ].map(({ key, icon: Icon }) => (
              <button key={key} onClick={() => setPreviewDevice(key)}
                className={`p-1.5 rounded-md transition-colors ${previewDevice === key ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'}`}>
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl overflow-hidden border border-dark-border bg-white flex justify-center" style={{ height: '450px' }}>
          <div className="h-full transition-all duration-300 overflow-hidden" style={{ width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%' }}>
            <StorePreviewIframe storeName={store.name} storeType={store.store_type} previewHtml={config.preview_html as string | undefined} />
          </div>
        </div>
      </motion.div>

      {/* Configuration Details */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-accent" />
          إعدادات المتجر
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <InfoRow icon={Globe} label="اللغة" value={
            (config.language as string) === 'ar' ? 'عربي' :
            (config.language as string) === 'en' ? 'English' : (config.language as string) || 'عربي'
          } />
          <InfoRow icon={Palette} label="التصميم" value={(config.branding as Record<string, unknown>)?.style as string || store.store_type || '—'} />
          <InfoRow icon={CreditCard} label="بوابة الدفع" value={(config.payment as Record<string, unknown>)?.gateway as string || '—'} />
          <InfoRow icon={Truck} label="الشحن" value={(config.shipping as Record<string, unknown>)?.provider as string || '—'} />
        </div>
      </motion.div>

      {/* Generating State */}
      {store.status === 'generating' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center border-primary/30">
          <Loader2 className="w-10 h-10 text-primary-light animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">الذكاء الاصطناعي يبني متجرك...</h3>
          <p className="text-text-muted text-sm">هذه العملية تستغرق دقيقة إلى دقيقتين</p>
          <div className="w-48 h-1.5 bg-dark-surface rounded-full mx-auto mt-6 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-l from-primary to-accent rounded-full"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              style={{ width: '40%' }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Globe; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-dark-surface rounded-xl">
      <Icon className="w-4 h-4 text-text-muted shrink-0" />
      <span className="text-text-muted text-sm">{label}:</span>
      <span className="text-sm font-medium mr-auto">{value}</span>
    </div>
  );
}

function StorePreviewIframe({ storeName, storeType, previewHtml }: { storeName: string; storeType: string; previewHtml?: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        // Use stored preview HTML if available, otherwise generate from template engine
        const html = previewHtml || getTemplateHTML(storeType === 'fashion' ? 'fashion-luxury' : storeType === 'electronics' ? 'electronics-modern' : storeType === 'beauty' ? 'beauty-glow' : storeType === 'food' ? 'food-gourmet' : 'simple-shop', storeName);
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [storeName, storeType, previewHtml]);

  return <iframe ref={iframeRef} className="w-full h-full border-0" sandbox="allow-scripts" title="Store Preview" />;
}
