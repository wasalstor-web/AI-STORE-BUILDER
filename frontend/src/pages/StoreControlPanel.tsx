import { Fragment } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  storesApi,
  productsApi,
  categoriesApi,
  ordersApi,
  uploadsApi,
} from "../lib/api";
import { getTemplateHTML } from "../data/templates";
import type { Store, Product, Category, Order, OrderSummary } from "../types";
import {
  ArrowRight,
  Globe,
  Palette,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  Package,
  Settings,
  Copy,
  Bot,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  ShoppingCart,
  Trash2,
  Plus,
  Search,
  Edit3,
  TrendingUp,
  DollarSign,
  Layers,
  X,
  Save,
  Image,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { useState, useRef, useEffect } from "react";
import ConfirmDialog from "../components/ConfirmDialog";

/* ── Debounce Hook ── */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

/* ── Tab Types ── */
type TabId =
  | "overview"
  | "products"
  | "categories"
  | "orders"
  | "design"
  | "settings";

const TABS: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "نظرة عامة", icon: BarChart3 },
  { id: "products", label: "المنتجات", icon: Package },
  { id: "categories", label: "التصنيفات", icon: Layers },
  { id: "orders", label: "الطلبات", icon: ShoppingCart },
  { id: "design", label: "التصميم", icon: Palette },
  { id: "settings", label: "الإعدادات", icon: Settings },
];

const statusConfig: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle }
> = {
  active: { label: "نشط", color: "text-success", icon: CheckCircle },
  pending: { label: "قيد الإنشاء", color: "text-warning", icon: Clock },
  generating: {
    label: "جاري البناء",
    color: "text-primary-light",
    icon: Loader2,
  },
  failed: { label: "فشل", color: "text-error", icon: AlertCircle },
};

export default function StoreControlPanel() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const {
    data: store,
    isLoading,
    error,
  } = useQuery<Store>({
    queryKey: ["store", id],
    queryFn: async () => (await storesApi.get(id!)).data,
    enabled: !!id,
  });

  useEffect(() => {
    document.title = store
      ? `${store.name} | ويب فلو`
      : "لوحة تحكم المتجر | ويب فلو";
  }, [store]);

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
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-text-secondary">لم يتم العثور على المتجر</p>
        <Link
          to="/dashboard"
          className="btn-primary inline-flex items-center gap-2 mt-4"
        >
          <ArrowRight className="w-4 h-4" /> العودة
        </Link>
      </div>
    );
  }

  const status = statusConfig[store.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const subdomain = store.slug || store.name.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4 mb-6"
      >
        <div>
          <Link
            to="/dashboard"
            className="text-text-muted hover:text-text-secondary text-sm flex items-center gap-1 mb-2"
          >
            <ArrowRight className="w-4 h-4" /> لوحة التحكم
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{store.name}</h1>
            <span
              className={`badge text-xs flex items-center gap-1.5 ${store.status === "active" ? "badge-success" : "badge-warning"}`}
            >
              <StatusIcon
                className={`w-3 h-3 ${store.status === "generating" ? "animate-spin" : ""}`}
              />
              {status.label}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/stores/ai-builder?name=${encodeURIComponent(store.name)}&type=${store.store_type}&storeId=${id}`}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <Bot className="w-4 h-4" /> تعديل AI
          </Link>
          <a
            href={`https://${subdomain}.aibuilder.app`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <ExternalLink className="w-4 h-4" /> زيارة الموقع
          </a>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-dark-border mb-6 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-primary text-primary-light bg-primary/5"
                : "border-transparent text-text-muted hover:text-text-secondary hover:bg-dark-hover/50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && (
            <OverviewTab store={store} storeId={id!} />
          )}
          {activeTab === "products" && <ProductsTab storeId={id!} />}
          {activeTab === "categories" && <CategoriesTab storeId={id!} />}
          {activeTab === "orders" && <OrdersTab storeId={id!} />}
          {activeTab === "design" && <DesignTab store={store} storeId={id!} />}
          {activeTab === "settings" && (
            <SettingsTab store={store} storeId={id!} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB: Overview
   ══════════════════════════════════════════════════════════ */
function OverviewTab({ store, storeId }: { store: Store; storeId: string }) {
  const { data: orderSummary } = useQuery<OrderSummary>({
    queryKey: ["order-summary", storeId],
    queryFn: async () => (await ordersApi.summary(storeId)).data,
  });
  const { data: productsData } = useQuery({
    queryKey: ["products-count", storeId],
    queryFn: async () =>
      (await productsApi.list(storeId, { page: 1, page_size: 1 })).data,
  });

  const stats = [
    {
      icon: DollarSign,
      label: "إجمالي المبيعات",
      value: orderSummary
        ? `${orderSummary.total_revenue.toFixed(0)} ر.س`
        : "—",
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      icon: ShoppingCart,
      label: "الطلبات",
      value: orderSummary?.total_orders?.toString() || "0",
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: Package,
      label: "المنتجات",
      value: productsData?.total?.toString() || "0",
      color: "text-primary-light",
      bg: "bg-primary/10",
    },
    {
      icon: TrendingUp,
      label: "قيد التنفيذ",
      value: orderSummary?.pending_orders?.toString() || "0",
      color: "text-warning",
      bg: "bg-warning/10",
    },
  ];

  const subdomain = store.slug || store.name.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass-card p-5 hover:border-primary/20 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-text-muted text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Domain Card */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary-light" /> رابط الموقع
        </h3>
        <div className="flex items-center gap-3 bg-dark-surface rounded-xl p-3 border border-dark-border">
          <span
            dir="ltr"
            className="text-text-secondary flex-1 font-mono text-sm"
          >
            {subdomain}.aibuilder.app
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${subdomain}.aibuilder.app`);
              toast.success("تم النسخ");
            }}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4 text-text-muted" />
          </button>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-success" /> نشاط الأسبوع
          <span className="mr-auto text-[10px] font-normal text-text-muted bg-dark-hover px-2 py-0.5 rounded-full">
            تقريبي
          </span>
        </h3>
        <MiniActivityChart
          totalOrders={orderSummary?.total_orders || 0}
          totalRevenue={orderSummary?.total_revenue || 0}
        />
      </div>

      {/* Quick Preview */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-accent" /> معاينة سريعة
        </h3>
        <div
          className="rounded-xl overflow-hidden border border-dark-border bg-white"
          style={{ height: "300px" }}
        >
          <StorePreviewIframe
            storeName={store.name}
            storeType={store.store_type}
            previewHtml={
              (store.config as Record<string, unknown>)?.preview_html as
                | string
                | undefined
            }
          />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB: Products
   ══════════════════════════════════════════════════════════ */
function ProductsTab({ storeId }: { storeId: string }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading } = useQuery({
    queryKey: ["products", storeId, debouncedSearch, page],
    queryFn: async () =>
      (
        await productsApi.list(storeId, {
          page,
          page_size: PAGE_SIZE,
          search: debouncedSearch || undefined,
        })
      ).data,
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => productsApi.delete(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", storeId] });
      toast.success("تم حذف المنتج");
    },
    onError: () => toast.error("فشل الحذف"),
  });

  const products: Product[] = data?.items || [];

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في المنتجات..."
            className="input-field pr-10 text-sm py-2.5"
          />
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> إضافة منتج
        </button>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary mb-4">لا توجد منتجات بعد</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> أضف أول منتج
          </button>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border text-text-muted text-xs">
                <th className="text-right p-3 font-medium">المنتج</th>
                <th className="text-right p-3 font-medium">السعر</th>
                <th className="text-right p-3 font-medium">المخزون</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-center p-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-dark-border/50 hover:bg-dark-hover/30 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-dark-surface border border-dark-border flex items-center justify-center shrink-0 overflow-hidden">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image className="w-4 h-4 text-text-muted" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.name}</p>
                        {p.sku && (
                          <p className="text-[11px] text-text-muted" dir="ltr">
                            SKU: {p.sku}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm font-medium">
                    {p.price} {p.currency}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-sm ${p.stock_quantity <= 0 ? "text-error" : p.stock_quantity < 5 ? "text-warning" : "text-text-secondary"}`}
                    >
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`badge text-[10px] ${p.is_active ? "badge-success" : "badge-neutral"}`}
                    >
                      {p.is_active ? "نشط" : "مخفي"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setShowForm(true);
                        }}
                        className="p-1.5 hover:bg-dark-hover rounded-lg transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-text-muted" />
                      </button>
                      <button
                        onClick={() => setDeleteProductId(p.id)}
                        className="p-1.5 hover:bg-error/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-error/60" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 flex items-center justify-between border-t border-dark-border">
            <span className="text-text-muted text-xs">
              {data?.total || 0} منتج
            </span>
            {(data?.total || 0) > PAGE_SIZE && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs bg-dark-surface border border-dark-border hover:border-dark-hover disabled:opacity-40 transition-all"
                >
                  السابق
                </button>
                <span className="text-xs text-text-secondary">
                  {page} / {Math.ceil((data?.total || 0) / PAGE_SIZE)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil((data?.total || 0) / PAGE_SIZE)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-dark-surface border border-dark-border hover:border-dark-hover disabled:opacity-40 transition-all"
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductFormModal
          storeId={storeId}
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["products", storeId] });
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteProductId}
        title="حذف المنتج"
        message="هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        onConfirm={() => {
          if (deleteProductId) deleteMutation.mutate(deleteProductId);
          setDeleteProductId(null);
        }}
        onCancel={() => setDeleteProductId(null)}
      />
    </div>
  );
}

/* ── Product Form Modal ── */
function ProductFormModal({
  storeId,
  product,
  onClose,
  onSuccess,
}: {
  storeId: string;
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [description, setDescription] = useState(product?.description || "");
  const [stock, setStock] = useState(
    product?.stock_quantity?.toString() || "10",
  );
  const [categoryId, setCategoryId] = useState(product?.category_id || "");
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories", storeId],
    queryFn: async () => (await categoriesApi.list(storeId)).data,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب ان يكون أقل من 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("الرجاء اختيار صورة");
      return;
    }
    setUploading(true);
    try {
      const res = await uploadsApi.uploadImage(file, "products");
      setImageUrl(res.data.url || res.data.file_url || "");
      toast.success("تم رفع الصورة");
    } catch {
      toast.error("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !price) return toast.error("الاسم والسعر مطلوبان");
    setSaving(true);
    try {
      const data: Record<string, unknown> = {
        name,
        price: parseFloat(price),
        description,
        stock_quantity: parseInt(stock),
        is_active: isActive,
        category_id: categoryId || null,
      };
      if (imageUrl) data.image_url = imageUrl;
      if (product) {
        await productsApi.update(product.id, data);
        toast.success("تم تحديث المنتج");
      } else {
        await productsApi.create(storeId, data);
        toast.success("تم إضافة المنتج");
      }
      onSuccess();
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold">
            {product ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-dark-hover rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              صورة المنتج
            </label>
            <div className="flex items-start gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-dark-border hover:border-primary/40 bg-dark-surface flex items-center justify-center cursor-pointer transition-colors overflow-hidden shrink-0"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary-light" />
                ) : imageUrl ? (
                  <img
                    src={imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="w-5 h-5 text-text-muted mx-auto mb-1" />
                    <span className="text-[10px] text-text-muted">
                      رفع صورة
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-text-muted">
                  JPG, PNG أو WebP — حتى 5MB
                </p>
                {imageUrl && (
                  <button
                    onClick={() => setImageUrl("")}
                    className="text-xs text-error hover:underline"
                  >
                    إزالة الصورة
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              اسم المنتج *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="مثال: حقيبة جلد فاخرة"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                السعر (ر.س) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-field"
                placeholder="199"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                المخزون
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="input-field"
                placeholder="10"
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              الوصف
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-20 resize-none"
              placeholder="وصف مختصر للمنتج..."
            />
          </div>
          {/* Category Dropdown */}
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              التصنيف
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-field"
            >
              <option value="">بدون تصنيف</option>
              {(categoriesData?.items || categoriesData || []).map(
                (cat: Category) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ),
              )}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-dark-border accent-primary"
            />
            <span className="text-sm text-text-secondary">
              نشط (ظاهر في المتجر)
            </span>
          </label>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {product ? "حفظ التعديلات" : "إضافة المنتج"}
          </button>
          <button onClick={onClose} className="btn-outline px-6">
            إلغاء
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB: Categories
   ══════════════════════════════════════════════════════════ */
function CategoriesTab({ storeId }: { storeId: string }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["categories", storeId],
    queryFn: async () => (await categoriesApi.list(storeId)).data,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      categoriesApi.create(storeId, { name: newName, description: newDesc }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowForm(false);
      setNewName("");
      setNewDesc("");
      toast.success("تم إضافة التصنيف");
    },
    onError: () => toast.error("فشل الإضافة"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      catId,
      data,
    }: {
      catId: string;
      data: Record<string, unknown>;
    }) => categoriesApi.update(catId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCat(null);
      toast.success("تم تحديث التصنيف");
    },
    onError: () => toast.error("فشل التحديث"),
  });

  const deleteMutation = useMutation({
    mutationFn: (catId: string) => categoriesApi.delete(catId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("تم الحذف");
    },
  });

  const categories: Category[] = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">التصنيفات ({categories.length})</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> إضافة تصنيف
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass-card p-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input-field text-sm"
              placeholder="اسم التصنيف *"
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="input-field text-sm"
              placeholder="وصف اختياري"
            />
            <div className="flex gap-2">
              <button
                onClick={() => newName && createMutation.mutate()}
                disabled={!newName || createMutation.isPending}
                className="btn-primary text-sm flex-1 flex items-center justify-center gap-2"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}{" "}
                إضافة
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="btn-outline text-sm px-4"
              >
                إلغاء
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Layers className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">لا توجد تصنيفات بعد</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="glass-card p-4 group">
              {editingCat === cat.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-field text-sm"
                    placeholder="اسم التصنيف"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="input-field text-sm"
                    placeholder="الوصف"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        editName &&
                        updateMutation.mutate({
                          catId: cat.id,
                          data: {
                            name: editName,
                            description: editDesc || null,
                          },
                        })
                      }
                      disabled={!editName || updateMutation.isPending}
                      className="btn-primary text-xs flex-1 flex items-center justify-center gap-1.5"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Save className="w-3 h-3" />
                      )}{" "}
                      حفظ
                    </button>
                    <button
                      onClick={() => setEditingCat(null)}
                      className="btn-outline text-xs px-3"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-text-muted mt-1">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => {
                        setEditingCat(cat.id);
                        setEditName(cat.name);
                        setEditDesc(cat.description || "");
                      }}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-primary-light/60" />
                    </button>
                    <button
                      onClick={() => setDeleteCatId(cat.id)}
                      className="p-1.5 hover:bg-error/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-error/60" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteCatId}
        title="حذف التصنيف"
        message="هل أنت متأكد من حذف هذا التصنيف؟ سيتم إزالته من جميع المنتجات المرتبطة."
        confirmLabel="حذف"
        onConfirm={() => {
          if (deleteCatId) deleteMutation.mutate(deleteCatId);
          setDeleteCatId(null);
        }}
        onCancel={() => setDeleteCatId(null)}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB: Orders
   ══════════════════════════════════════════════════════════ */
const ORDER_STATUSES = [
  {
    value: "pending",
    label: "قيد الانتظار",
    class: "badge-warning",
    next: "confirmed",
  },
  {
    value: "confirmed",
    label: "مؤكد",
    class: "badge-primary",
    next: "shipped",
  },
  {
    value: "shipped",
    label: "تم الشحن",
    class: "badge-info",
    next: "delivered",
  },
  {
    value: "delivered",
    label: "تم التوصيل",
    class: "badge-success",
    next: null,
  },
  { value: "cancelled", label: "ملغي", class: "badge-neutral", next: null },
] as const;

function OrdersTab({ storeId }: { storeId: string }) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderPage, setOrderPage] = useState(1);
  const ORDER_PAGE_SIZE = 20;

  // Reset page when filter changes
  useEffect(() => {
    setOrderPage(1);
  }, [statusFilter]);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", storeId, statusFilter, orderPage],
    queryFn: async () =>
      (
        await ordersApi.list(storeId, {
          page: orderPage,
          page_size: ORDER_PAGE_SIZE,
          status: statusFilter || undefined,
        })
      ).data,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      ordersApi.update(orderId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", storeId] });
      queryClient.invalidateQueries({ queryKey: ["order-summary", storeId] });
      toast.success("تم تحديث حالة الطلب");
    },
    onError: () => toast.error("فشل تحديث الحالة"),
  });

  const orders: Order[] = data?.items || [];

  const statusLabels: Record<string, { label: string; class: string }> =
    Object.fromEntries(
      ORDER_STATUSES.map((s) => [s.value, { label: s.label, class: s.class }]),
    );

  const getNextStatus = (current: string) =>
    ORDER_STATUSES.find((s) => s.value === current)?.next || null;

  const getNextStatusLabel = (current: string) => {
    const next = getNextStatus(current);
    return next ? ORDER_STATUSES.find((s) => s.value === next)?.label : null;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {[
          { v: "", l: "الكل" },
          { v: "pending", l: "قيد الانتظار" },
          { v: "confirmed", l: "مؤكد" },
          { v: "shipped", l: "تم الشحن" },
          { v: "delivered", l: "مكتمل" },
        ].map((f) => (
          <button
            key={f.v}
            onClick={() => setStatusFilter(f.v)}
            className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${statusFilter === f.v ? "bg-primary text-white" : "bg-dark-surface border border-dark-border text-text-secondary hover:border-dark-hover"}`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <p className="text-text-secondary">
            لا توجد طلبات {statusFilter ? "بهذه الحالة " : ""}بعد
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {/* ── Mobile: Card Layout ── */}
          <div className="md:hidden divide-y divide-dark-border/50">
            {orders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              const nextLabel = getNextStatusLabel(order.status);
              return (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-primary-light">{order.order_number}</span>
                    <span className={`badge text-[10px] ${statusLabels[order.status]?.class || "badge-neutral"}`}>
                      {statusLabels[order.status]?.label || order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{order.customer_name}</span>
                    <span className="font-medium">{order.total} {order.currency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      {new Date(order.created_at).toLocaleDateString("ar-SA")}
                    </span>
                    {nextStatus && nextLabel ? (
                      <button
                        onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: nextStatus })}
                        disabled={updateStatusMutation.isPending}
                        className="text-[11px] px-3 py-1.5 rounded-lg bg-primary/10 text-primary-light hover:bg-primary/20 transition-colors disabled:opacity-50"
                      >
                        {updateStatusMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin inline" /> : `← ${nextLabel}`}
                      </button>
                    ) : order.status === "cancelled" ? (
                      <span className="text-[10px] text-text-muted">ملغي</span>
                    ) : (
                      <span className="text-[10px] text-success">✓ مكتمل</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Desktop: Table Layout ── */}
          <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border text-text-muted text-xs">
                <th className="text-right p-3 font-medium w-6"></th>
                <th className="text-right p-3 font-medium">رقم الطلب</th>
                <th className="text-right p-3 font-medium">العميل</th>
                <th className="text-right p-3 font-medium">المبلغ</th>
                <th className="text-right p-3 font-medium">الحالة</th>
                <th className="text-right p-3 font-medium">التاريخ</th>
                <th className="text-center p-3 font-medium">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isExpanded = expandedOrder === order.id;
                const nextStatus = getNextStatus(order.status);
                const nextLabel = getNextStatusLabel(order.status);
                return (
                  <Fragment key={order.id}>
                    <tr
                      onClick={() =>
                        setExpandedOrder(isExpanded ? null : order.id)
                      }
                      className={`border-b border-dark-border/50 hover:bg-dark-hover/30 transition-colors cursor-pointer ${isExpanded ? "bg-dark-hover/20" : ""}`}
                    >
                      <td className="p-3 text-text-muted">
                        <motion.span
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          className="inline-block text-xs"
                        >
                          ◀
                        </motion.span>
                      </td>
                      <td className="p-3 font-mono text-sm text-primary-light">
                        {order.order_number}
                      </td>
                      <td className="p-3">
                        <p className="text-sm font-medium">
                          {order.customer_name}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {order.customer_email}
                        </p>
                      </td>
                      <td className="p-3 text-sm font-medium">
                        {order.total} {order.currency}
                      </td>
                      <td className="p-3">
                        <span
                          className={`badge text-[10px] ${statusLabels[order.status]?.class || "badge-neutral"}`}
                        >
                          {statusLabels[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-text-muted">
                        {new Date(order.created_at).toLocaleDateString("ar-SA")}
                      </td>
                      <td
                        className="p-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {nextStatus && nextLabel ? (
                          <button
                            onClick={() =>
                              updateStatusMutation.mutate({
                                orderId: order.id,
                                status: nextStatus,
                              })
                            }
                            disabled={updateStatusMutation.isPending}
                            className="text-[11px] px-3 py-1.5 rounded-lg bg-primary/10 text-primary-light hover:bg-primary/20 transition-colors disabled:opacity-50"
                          >
                            {updateStatusMutation.isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin inline" />
                            ) : (
                              `← ${nextLabel}`
                            )}
                          </button>
                        ) : order.status === "cancelled" ? (
                          <span className="text-[10px] text-text-muted">
                            ملغي
                          </span>
                        ) : (
                          <span className="text-[10px] text-success">
                            ✓ مكتمل
                          </span>
                        )}
                      </td>
                    </tr>
                    {/* Expanded Order Details */}
                    {isExpanded && (
                      <tr key={`${order.id}-detail`}>
                        <td colSpan={7} className="p-0">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-dark-surface/50 border-b border-dark-border/50"
                          >
                            <div className="p-4 grid md:grid-cols-3 gap-4">
                              {/* Order Items */}
                              <div className="md:col-span-2">
                                <p className="text-xs font-medium text-text-muted mb-2">
                                  المنتجات
                                </p>
                                {order.items && order.items.length > 0 ? (
                                  <div className="space-y-2">
                                    {order.items.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center gap-3 bg-dark-bg/50 rounded-lg p-2.5"
                                      >
                                        <div className="w-9 h-9 rounded-lg bg-dark-hover border border-dark-border flex items-center justify-center shrink-0 overflow-hidden">
                                          {item.product_image ? (
                                            <img
                                              src={item.product_image}
                                              alt=""
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <Package className="w-3.5 h-3.5 text-text-muted" />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm truncate">
                                            {item.product_name}
                                          </p>
                                          <p className="text-[11px] text-text-muted">
                                            {item.quantity} × {item.unit_price}{" "}
                                            {order.currency}
                                          </p>
                                        </div>
                                        <span className="text-sm font-medium shrink-0">
                                          {item.total_price} {order.currency}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-text-muted">
                                    لا توجد تفاصيل
                                  </p>
                                )}
                              </div>
                              {/* Order Info */}
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs text-text-muted mb-1">
                                    ملخص الطلب
                                  </p>
                                  <div className="bg-dark-bg/50 rounded-lg p-3 space-y-1.5 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-text-muted">
                                        المجموع الفرعي
                                      </span>
                                      <span>
                                        {order.subtotal} {order.currency}
                                      </span>
                                    </div>
                                    {order.shipping_cost > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-text-muted">
                                          الشحن
                                        </span>
                                        <span>
                                          {order.shipping_cost} {order.currency}
                                        </span>
                                      </div>
                                    )}
                                    {order.tax_amount > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-text-muted">
                                          الضريبة
                                        </span>
                                        <span>
                                          {order.tax_amount} {order.currency}
                                        </span>
                                      </div>
                                    )}
                                    {order.discount_amount > 0 && (
                                      <div className="flex justify-between text-success">
                                        <span>خصم</span>
                                        <span>
                                          -{order.discount_amount}{" "}
                                          {order.currency}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between font-bold pt-1.5 border-t border-dark-border">
                                      <span>الإجمالي</span>
                                      <span>
                                        {order.total} {order.currency}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {order.customer_phone && (
                                  <div>
                                    <p className="text-xs text-text-muted">
                                      الهاتف
                                    </p>
                                    <p className="text-sm" dir="ltr">
                                      {order.customer_phone}
                                    </p>
                                  </div>
                                )}
                                {order.tracking_number && (
                                  <div>
                                    <p className="text-xs text-text-muted">
                                      رقم التتبع
                                    </p>
                                    <p className="text-sm font-mono" dir="ltr">
                                      {order.tracking_number}
                                    </p>
                                  </div>
                                )}
                                {order.customer_notes && (
                                  <div>
                                    <p className="text-xs text-text-muted">
                                      ملاحظات العميل
                                    </p>
                                    <p className="text-sm text-text-secondary">
                                      {order.customer_notes}
                                    </p>
                                  </div>
                                )}
                                {/* Status change dropdown */}
                                <div>
                                  <p className="text-xs text-text-muted mb-1.5">
                                    تغيير الحالة
                                  </p>
                                  <select
                                    value={order.status}
                                    onChange={(e) =>
                                      updateStatusMutation.mutate({
                                        orderId: order.id,
                                        status: e.target.value,
                                      })
                                    }
                                    disabled={updateStatusMutation.isPending}
                                    className="input-field text-sm py-2"
                                  >
                                    {ORDER_STATUSES.map((s) => (
                                      <option key={s.value} value={s.value}>
                                        {s.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          </div>
          <div className="p-3 flex items-center justify-between border-t border-dark-border">
            <span className="text-text-muted text-xs">
              {data?.total || 0} طلب
            </span>
            {(data?.total || 0) > ORDER_PAGE_SIZE && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                  disabled={orderPage === 1}
                  className="px-3 py-1.5 rounded-lg text-xs bg-dark-surface border border-dark-border hover:border-dark-hover disabled:opacity-40 transition-all"
                >
                  السابق
                </button>
                <span className="text-xs text-text-secondary">
                  {orderPage} /{" "}
                  {Math.ceil((data?.total || 0) / ORDER_PAGE_SIZE)}
                </span>
                <button
                  onClick={() => setOrderPage((p) => p + 1)}
                  disabled={
                    orderPage >= Math.ceil((data?.total || 0) / ORDER_PAGE_SIZE)
                  }
                  className="px-3 py-1.5 rounded-lg text-xs bg-dark-surface border border-dark-border hover:border-dark-hover disabled:opacity-40 transition-all"
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB: Design
   ══════════════════════════════════════════════════════════ */
function DesignTab({ store, storeId }: { store: Store; storeId: string }) {
  const [previewDevice, setPreviewDevice] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">تصميم الموقع</h3>
        <div className="flex gap-2">
          <div className="flex items-center gap-0.5 bg-dark-bg rounded-lg p-0.5 border border-dark-border">
            {[
              { key: "desktop" as const, icon: Monitor },
              { key: "tablet" as const, icon: Tablet },
              { key: "mobile" as const, icon: Smartphone },
            ].map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPreviewDevice(key)}
                className={`p-1.5 rounded-md transition-colors ${previewDevice === key ? "bg-primary text-white" : "text-text-muted hover:text-text-primary"}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              navigate(
                `/stores/ai-builder?name=${encodeURIComponent(store.name)}&type=${store.store_type}&storeId=${storeId}`,
              )
            }
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Bot className="w-4 h-4" /> تعديل بالذكاء الاصطناعي
          </button>
          <Link
            to={`/stores/${storeId}/edit`}
            className="btn-outline flex items-center gap-2 text-sm"
          >
            <Edit3 className="w-4 h-4" /> محرر السحب والإفلات
          </Link>
        </div>
      </div>

      <div className="glass-card p-4">
        <div
          className="rounded-xl overflow-hidden border border-dark-border bg-white flex justify-center"
          style={{ height: "500px" }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width:
                previewDevice === "mobile"
                  ? "375px"
                  : previewDevice === "tablet"
                    ? "768px"
                    : "100%",
            }}
          >
            <StorePreviewIframe
              storeName={store.name}
              storeType={store.store_type}
              previewHtml={
                (store.config as Record<string, unknown>)?.preview_html as
                  | string
                  | undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TAB: Settings
   ══════════════════════════════════════════════════════════ */
function SettingsTab({ store, storeId }: { store: Store; storeId: string }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const storeConfig = (store.config || {}) as Record<string, string>;
  const [storeName, setStoreName] = useState(store.name);
  const [currency, setCurrency] = useState(storeConfig.currency || "SAR");
  const [metaTitle, setMetaTitle] = useState(storeConfig.meta_title || "");
  const [metaDesc, setMetaDesc] = useState(storeConfig.meta_description || "");
  const [contactEmail, setContactEmail] = useState(
    storeConfig.contact_email || "",
  );
  const [contactPhone, setContactPhone] = useState(
    storeConfig.contact_phone || "",
  );
  const [socialTwitter, setSocialTwitter] = useState(
    storeConfig.social_twitter || "",
  );
  const [socialInstagram, setSocialInstagram] = useState(
    storeConfig.social_instagram || "",
  );
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!storeName) return;
    setSaving(true);
    try {
      await storesApi.update(storeId, {
        name: storeName,
        config: {
          ...store.config,
          currency,
          meta_title: metaTitle,
          meta_description: metaDesc,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          social_twitter: socialTwitter,
          social_instagram: socialInstagram,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["store", storeId] });
      toast.success("تم حفظ الإعدادات");
    } catch {
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await storesApi.delete(storeId);
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast.success("تم حذف المتجر");
      navigate("/dashboard");
    } catch {
      toast.error("فشل الحذف");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* General */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary-light" /> إعدادات عامة
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              اسم الموقع
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                نوع المشروع
              </label>
              <input
                type="text"
                value={store.store_type}
                disabled
                className="input-field opacity-60 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary mb-1.5 block">
                العملة
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-field"
              >
                <option value="SAR">ر.س — ريال سعودي</option>
                <option value="AED">د.إ — درهم إماراتي</option>
                <option value="KWD">د.ك — دينار كويتي</option>
                <option value="QAR">ر.ق — ريال قطري</option>
                <option value="BHD">د.ب — دينار بحريني</option>
                <option value="OMR">ر.ع — ريال عماني</option>
                <option value="EGP">ج.م — جنيه مصري</option>
                <option value="USD">$ — دولار</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary-light" /> تحسين محركات البحث
          (SEO)
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              عنوان الصفحة (Meta Title)
            </label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="input-field"
              placeholder={store.name}
              maxLength={60}
            />
            <p className="text-[11px] text-text-muted mt-1">
              {metaTitle.length}/60 حرف
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              وصف الصفحة (Meta Description)
            </label>
            <textarea
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              className="input-field min-h-20 resize-none"
              placeholder="وصف مختصر لمتجرك يظهر في نتائج البحث..."
              maxLength={160}
            />
            <p className="text-[11px] text-text-muted mt-1">
              {metaDesc.length}/160 حرف
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-primary-light" /> معلومات التواصل
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="input-field"
              placeholder="info@example.com"
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="input-field"
              placeholder="+966 5x xxx xxxx"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="glass-card p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary-light" /> روابط التواصل
          الاجتماعي
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              Instagram
            </label>
            <input
              type="text"
              value={socialInstagram}
              onChange={(e) => setSocialInstagram(e.target.value)}
              className="input-field"
              placeholder="@username"
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary mb-1.5 block">
              X (Twitter)
            </label>
            <input
              type="text"
              value={socialTwitter}
              onChange={(e) => setSocialTwitter(e.target.value)}
              className="input-field"
              placeholder="@username"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 w-full justify-center py-3"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}{" "}
        حفظ جميع الإعدادات
      </button>

      {/* Danger Zone */}
      <div className="glass-card p-6 border-error/20">
        <h3 className="font-semibold mb-2 text-error flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> منطقة الخطر
        </h3>
        <p className="text-text-muted text-sm mb-4">
          حذف الموقع سيزيل جميع البيانات بشكل نهائي.
        </p>
        <button
          onClick={() => setShowDelete(true)}
          className="btn-outline border-error/30 text-error hover:bg-error/10 flex items-center gap-2 text-sm"
        >
          <Trash2 className="w-4 h-4" /> حذف الموقع
        </button>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="تأكيد حذف الموقع"
        message={`هل أنت متأكد من حذف "${store.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف نهائياً"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Helper: Mini Activity Chart
   ══════════════════════════════════════════════════════════ */
function MiniActivityChart({
  totalOrders,
  totalRevenue,
}: {
  totalOrders: number;
  totalRevenue: number;
}) {
  // Generate pseudo-random daily data based on totals
  const days = ["سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];
  const seed = totalOrders + Math.floor(totalRevenue);
  const bars = days.map((day, i) => {
    const factor = [0.4, 0.7, 1.0, 0.6, 0.8, 0.9, 0.5][i];
    const value = Math.max(
      1,
      Math.round(
        ((totalOrders || 3) / 7) * factor * (1 + (seed % (i + 2)) * 0.1),
      ),
    );
    return { day, value };
  });
  const maxVal = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div>
      <div className="flex items-end gap-2 h-32">
        {bars.map((bar) => (
          <div
            key={bar.day}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <span className="text-[10px] text-text-muted">{bar.value}</span>
            <div
              className="w-full rounded-t-md bg-linear-to-t from-primary/60 to-primary transition-all duration-500"
              style={{
                height: `${(bar.value / maxVal) * 100}%`,
                minHeight: "4px",
              }}
            />
            <span className="text-[10px] text-text-muted">{bar.day}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-border">
        <div className="text-xs text-text-muted">
          المتوسط اليومي:{" "}
          <span className="text-text-primary font-medium">
            {totalOrders > 0 ? (totalOrders / 7).toFixed(1) : "0"} طلب
          </span>
        </div>
        <div className="text-xs text-text-muted">
          متوسط الإيراد:{" "}
          <span className="text-text-primary font-medium">
            {totalRevenue > 0 ? (totalRevenue / 7).toFixed(0) : "0"} ر.س/يوم
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Helper: Store Preview Iframe
   ══════════════════════════════════════════════════════════ */
function StorePreviewIframe({
  storeName,
  storeType,
  previewHtml,
}: {
  storeName: string;
  storeType: string;
  previewHtml?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        const html =
          previewHtml ||
          getTemplateHTML(
            storeType === "fashion"
              ? "fashion-luxury"
              : storeType === "electronics"
                ? "electronics-modern"
                : storeType === "beauty"
                  ? "beauty-glow"
                  : storeType === "food"
                    ? "food-gourmet"
                    : "simple-shop",
            storeName,
          );
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [storeName, storeType, previewHtml]);
  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full border-0"
      sandbox="allow-scripts"
      title="Store Preview"
    />
  );
}
