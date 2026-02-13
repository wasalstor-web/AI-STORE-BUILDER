/**
 * Dashboard — Professional merchant admin panel.
 * Upgraded: real analytics, charts, recent orders, store health, top products.
 */

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { storesApi, dashboardApi, analyticsApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  Store as StoreIcon,
  PlusCircle,
  Package,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  LayoutGrid,
  Bot,
  ShoppingCart,
  TrendingUp,
  Crown,
  ChevronLeft,
  Users,
  Ticket,
  Eye,
  Megaphone,
  BarChart3,
  CheckCircle2,
  Circle,
  AlertCircle,
  ShoppingBag,
  RefreshCw,
  Wallet,
  Star,
} from "lucide-react";
import type {
  Store as StoreType,
  StoreListResponse,
  FullAnalytics,
} from "../types";

/* ── Helpers ── */
const storeTypeConfig: Record<
  string,
  { label: string; emoji: string; color: string }
> = {
  fashion: { label: "أزياء", emoji: "👗", color: "from-pink-500 to-rose-500" },
  electronics: {
    label: "إلكترونيات",
    emoji: "📱",
    color: "from-blue-500 to-cyan-500",
  },
  beauty: {
    label: "تجميل",
    emoji: "💄",
    color: "from-fuchsia-500 to-pink-500",
  },
  food: { label: "أغذية", emoji: "🍔", color: "from-orange-500 to-amber-500" },
  general: {
    label: "عام",
    emoji: "🏪",
    color: "from-violet-500 to-purple-500",
  },
  jewelry: {
    label: "مجوهرات",
    emoji: "💎",
    color: "from-amber-500 to-yellow-500",
  },
  sports: {
    label: "رياضة",
    emoji: "⚽",
    color: "from-emerald-500 to-green-500",
  },
  kids: { label: "أطفال", emoji: "🧸", color: "from-teal-500 to-cyan-500" },
  home: { label: "ديكور", emoji: "🏠", color: "from-indigo-500 to-violet-500" },
  perfume: { label: "عطور", emoji: "🌸", color: "from-rose-500 to-pink-500" },
  health: { label: "صحة", emoji: "💊", color: "from-green-500 to-emerald-500" },
  auto: { label: "سيارات", emoji: "🚗", color: "from-slate-500 to-gray-500" },
  restaurant: {
    label: "مطعم",
    emoji: "🍽️",
    color: "from-red-500 to-orange-500",
  },
  portfolio: {
    label: "معرض أعمال",
    emoji: "🎨",
    color: "from-purple-500 to-violet-500",
  },
  blog: { label: "مدونة", emoji: "✍️", color: "from-sky-500 to-blue-500" },
  realestate: {
    label: "عقارات",
    emoji: "🏢",
    color: "from-stone-500 to-amber-500",
  },
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatNum(n: number) {
  return new Intl.NumberFormat("ar-SA").format(n);
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "صباح الخير";
  if (h < 17) return "مساء الخير";
  return "مساء النور";
}

/* ── Animation Variants ── */
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

export default function Dashboard() {
  const { user } = useAuth();

  const { data: storesData } = useQuery<StoreListResponse>({
    queryKey: ["stores"],
    queryFn: () => storesApi.list().then((r) => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => dashboardApi.stats().then((r) => r.data),
  });

  const firstStore = storesData?.stores?.[0];
  const { data: analytics } = useQuery<FullAnalytics>({
    queryKey: ["analytics", firstStore?.id],
    queryFn: () => analyticsApi.get(firstStore!.id, "30d").then((r) => r.data),
    enabled: !!firstStore?.id,
  });

  const stores = storesData?.stores || [];
  const hasStores = stores.length > 0;

  const healthChecks = firstStore
    ? [
        { label: "إنشاء المتجر", done: true },
        { label: "إضافة المنتجات", done: (stats?.total_products || 0) > 0 },
        { label: "استقبال أول طلب", done: (stats?.total_orders || 0) > 0 },
        {
          label: "تفعيل بوابة الدفع",
          done: !!firstStore.config?.payment_gateway,
        },
        { label: "ربط الدومين", done: !!firstStore.config?.custom_domain },
      ]
    : [];
  const healthScore = healthChecks.filter((c) => c.done).length;

  return (
    <div className="space-y-6">
      {/* ── Email Verification Banner ── */}
      {user && !user.email_verified && (
        <motion.div
          {...fadeUp}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-amber-200 font-medium">
              يرجى تفعيل بريدك الإلكتروني
            </p>
            <p className="text-xs text-amber-300/60 mt-0.5">
              تحقق من بريدك لتفعيل جميع الميزات
            </p>
          </div>
          <Link
            to="/verify-email"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 whitespace-nowrap"
          >
            تفعيل الآن ←
          </Link>
        </motion.div>
      )}

      {/* ── Welcome ── */}
      <motion.div {...fadeUp} className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            {getGreeting()}،{" "}
            <span className="text-primary">
              {user?.full_name?.split(" ")[0]}
            </span>
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {hasStores
              ? `لديك ${stores.length} متجر — إليك ملخص أداءك`
              : "ابدأ بإنشاء متجرك الأول بالذكاء الاصطناعي"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/stores/ai-builder"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-accent rounded-xl text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
          >
            <Sparkles className="w-4 h-4" />
            بناء بالذكاء الاصطناعي
          </Link>
          <Link
            to="/stores/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-dark-card border border-dark-border rounded-xl text-white text-sm font-medium hover:bg-dark-border/50 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            متجر جديد
          </Link>
        </div>
      </motion.div>

      {/* ── Stats Cards ── */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            label: "الإيرادات",
            value: formatPrice(stats?.total_revenue || 0),
            change: analytics?.overview?.revenue_change || 0,
            icon: Wallet,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "الطلبات",
            value: formatNum(stats?.total_orders || 0),
            change: analytics?.overview?.orders_change || 0,
            icon: ShoppingCart,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "المنتجات",
            value: formatNum(stats?.total_products || 0),
            change: null,
            icon: Package,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
          },
          {
            label: "العملاء",
            value: formatNum(analytics?.overview?.total_customers || 0),
            change: null,
            icon: Users,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className="bg-dark-card border border-dark-border rounded-2xl p-5 hover:border-dark-border/80 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {stat.change !== null && stat.change !== 0 && (
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold ${Number(stat.change) > 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {Number(stat.change) > 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(Number(stat.change))}%
                </span>
              )}
            </div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-text-muted mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Revenue Chart ── */}
        <motion.div
          {...fadeUp}
          className="lg:col-span-2 bg-dark-card border border-dark-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white font-bold">الإيرادات</h3>
              <p className="text-xs text-text-muted mt-0.5">آخر 30 يوم</p>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-text-muted">الإيرادات</span>
            </div>
          </div>
          <div className="h-48 flex items-end gap-1">
            {(
              analytics?.revenue_chart ||
              Array.from({ length: 30 }, () => ({
                revenue: 0,
                orders: 0,
                date: "",
              }))
            ).map((point, i) => {
              const maxRev = Math.max(
                ...(analytics?.revenue_chart?.map((p) => Number(p.revenue)) || [
                  1,
                ]),
                1,
              );
              const height =
                Number(point.revenue) > 0
                  ? Math.max((Number(point.revenue) / maxRev) * 100, 4)
                  : 2;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end group relative"
                >
                  <div
                    className="w-full bg-gradient-to-t from-primary/80 to-primary rounded-t-sm transition-all hover:from-primary hover:to-accent cursor-pointer min-h-[2px]"
                    style={{ height: `${height}%` }}
                  />
                  {Number(point.revenue) > 0 && (
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-dark-bg border border-dark-border rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap z-10 shadow-xl">
                      {formatPrice(Number(point.revenue))}
                      <br />
                      <span className="text-text-muted">
                        {point.orders} طلب
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-text-muted">
            <span>قبل 30 يوم</span>
            <span>اليوم</span>
          </div>
        </motion.div>

        {/* ── Store Health ── */}
        <motion.div
          {...fadeUp}
          className="bg-dark-card border border-dark-border rounded-2xl p-6"
        >
          <h3 className="text-white font-bold mb-1">صحة المتجر</h3>
          <p className="text-xs text-text-muted mb-4">
            {healthChecks.length > 0
              ? `${healthScore}/${healthChecks.length} مكتمل`
              : "أنشئ متجراً للبدء"}
          </p>
          {healthChecks.length > 0 && (
            <div className="relative w-24 h-24 mx-auto mb-5">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  className="stroke-dark-border"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="3"
                  strokeDasharray={`${(healthScore / healthChecks.length) * 97.4} 97.4`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                {Math.round((healthScore / healthChecks.length) * 100)}%
              </span>
            </div>
          )}
          <div className="space-y-3">
            {healthChecks.map((check) => (
              <div key={check.label} className="flex items-center gap-2.5">
                {check.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-dark-border flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${check.done ? "text-text-muted line-through" : "text-white"}`}
                >
                  {check.label}
                </span>
              </div>
            ))}
          </div>
          {!hasStores && (
            <Link
              to="/stores/ai-builder"
              className="flex items-center justify-center gap-2 w-full mt-5 py-2.5 bg-gradient-to-r from-primary to-accent rounded-xl text-white text-sm font-bold hover:opacity-90 transition-all"
            >
              <Sparkles className="w-4 h-4" /> ابدأ الآن
            </Link>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Top Products ── */}
        <motion.div
          {...fadeUp}
          className="bg-dark-card border border-dark-border rounded-2xl p-6"
        >
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> الأكثر مبيعاً
          </h3>
          {analytics?.top_products?.length ? (
            <div className="space-y-3">
              {analytics.top_products.map((p, i) => (
                <div key={p.product_id} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-dark-border flex items-center justify-center text-[10px] font-bold text-text-muted flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-dark-border overflow-hidden flex-shrink-0">
                    {p.product_image ? (
                      <img
                        src={p.product_image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-3 h-3 text-text-muted" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {p.product_name}
                    </p>
                    <p className="text-[10px] text-text-muted">
                      {p.total_sold} مبيع
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">
                    {formatPrice(Number(p.total_revenue))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-8 h-8 text-dark-border mx-auto mb-2" />
              <p className="text-xs text-text-muted">لا توجد مبيعات بعد</p>
            </div>
          )}
        </motion.div>

        {/* ── Order Status ── */}
        <motion.div
          {...fadeUp}
          className="bg-dark-card border border-dark-border rounded-2xl p-6"
        >
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" /> حالة الطلبات
          </h3>
          {analytics?.order_status ? (
            <div className="space-y-3">
              {[
                {
                  key: "pending",
                  label: "قيد الانتظار",
                  color: "bg-amber-500",
                  count: analytics.order_status.pending,
                },
                {
                  key: "confirmed",
                  label: "مؤكد",
                  color: "bg-blue-500",
                  count: analytics.order_status.confirmed,
                },
                {
                  key: "processing",
                  label: "جاري التحضير",
                  color: "bg-violet-500",
                  count: analytics.order_status.processing,
                },
                {
                  key: "shipped",
                  label: "تم الشحن",
                  color: "bg-indigo-500",
                  count: analytics.order_status.shipped,
                },
                {
                  key: "delivered",
                  label: "تم التوصيل",
                  color: "bg-emerald-500",
                  count: analytics.order_status.delivered,
                },
                {
                  key: "cancelled",
                  label: "ملغي",
                  color: "bg-red-500",
                  count: analytics.order_status.cancelled,
                },
              ].map((s) => {
                const total = Object.values(analytics.order_status).reduce(
                  (a, b) => a + b,
                  0,
                );
                const pct = total > 0 ? (s.count / total) * 100 : 0;
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${s.color} flex-shrink-0`}
                    />
                    <span className="text-xs text-text-muted flex-1">
                      {s.label}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {s.count}
                    </span>
                    <div className="w-16 h-1.5 bg-dark-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="w-8 h-8 text-dark-border mx-auto mb-2" />
              <p className="text-xs text-text-muted">لا توجد طلبات بعد</p>
            </div>
          )}
        </motion.div>

        {/* ── Quick Actions ── */}
        <motion.div
          {...fadeUp}
          className="bg-dark-card border border-dark-border rounded-2xl p-6"
        >
          <h3 className="text-white font-bold mb-4">إجراءات سريعة</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "بناء بالـ AI",
                icon: Bot,
                to: "/stores/ai-builder",
                gradient: "from-primary to-accent",
              },
              {
                label: "متجر جديد",
                icon: PlusCircle,
                to: "/stores/create",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                label: "المنتجات",
                icon: Package,
                to: firstStore ? `/stores/${firstStore.id}` : "/stores/create",
                gradient: "from-violet-500 to-purple-500",
              },
              {
                label: "الطلبات",
                icon: ShoppingBag,
                to: firstStore ? `/stores/${firstStore.id}` : "/stores/create",
                gradient: "from-emerald-500 to-green-500",
              },
              {
                label: "العملاء",
                icon: Users,
                to: firstStore ? `/stores/${firstStore.id}` : "/stores/create",
                gradient: "from-amber-500 to-orange-500",
              },
              {
                label: "التسويق",
                icon: Megaphone,
                to: firstStore ? `/stores/${firstStore.id}` : "/stores/create",
                gradient: "from-pink-500 to-rose-500",
              },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-dark-bg/50 hover:bg-dark-border/30 border border-transparent hover:border-dark-border transition-all group"
              >
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[11px] text-text-muted group-hover:text-white transition-colors">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Store List ── */}
      <motion.div {...fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" /> متاجرك
          </h2>
        </div>
        {stores.length === 0 ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
              <StoreIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              أنشئ متجرك الأول
            </h3>
            <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
              استخدم الذكاء الاصطناعي لبناء متجر إلكتروني احترافي في دقائق
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/stores/ai-builder"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent rounded-xl text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                <Sparkles className="w-4 h-4" /> بناء بالـ AI
              </Link>
              <Link
                to="/stores/create"
                className="flex items-center gap-2 px-6 py-3 bg-dark-border/50 rounded-xl text-white text-sm font-medium hover:bg-dark-border transition-all"
              >
                <LayoutGrid className="w-4 h-4" /> اختر قالب
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store: StoreType) => {
              const cfg =
                storeTypeConfig[store.store_type] || storeTypeConfig.general;
              const isActive =
                store.status === "published" || store.status === "active";
              return (
                <Link
                  key={store.id}
                  to={`/stores/${store.id}`}
                  className="bg-dark-card border border-dark-border rounded-2xl p-5 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-lg`}
                    >
                      {cfg.emoji}
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-500/10 text-emerald-400" : store.status === "generating" ? "bg-amber-500/10 text-amber-400" : "bg-gray-500/10 text-gray-400"}`}
                    >
                      {isActive
                        ? "نشط"
                        : store.status === "generating"
                          ? "جاري الإنشاء"
                          : "مسودة"}
                    </span>
                  </div>
                  <h3 className="text-white font-bold truncate group-hover:text-primary transition-colors">
                    {store.name}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">{cfg.label}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-border">
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {store.slug}
                    </span>
                    <ChevronLeft className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              );
            })}
            <Link
              to="/stores/ai-builder"
              className="bg-dark-card border-2 border-dashed border-dark-border rounded-2xl p-5 hover:border-primary/30 transition-all flex flex-col items-center justify-center gap-3 min-h-[160px] group"
            >
              <div className="w-11 h-11 rounded-xl bg-dark-border/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <PlusCircle className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm text-text-muted group-hover:text-white transition-colors font-medium">
                إضافة متجر جديد
              </span>
            </Link>
          </div>
        )}
      </motion.div>

      {/* ── Platform Features ── */}
      <motion.div
        {...fadeUp}
        className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">
              ويب فلو — منصة بناء المتاجر بالذكاء الاصطناعي
            </h3>
            <p className="text-xs text-text-muted">
              كل ما تحتاجه لإطلاق متجرك الإلكتروني
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Bot, label: "بناء بالـ AI", desc: "تصميم ذكي فوري" },
            { icon: ShoppingCart, label: "إدارة الطلبات", desc: "تتبع كامل" },
            { icon: Users, label: "إدارة العملاء", desc: "قاعدة بيانات ذكية" },
            { icon: Ticket, label: "كوبونات خصم", desc: "تسويق فعال" },
            { icon: Star, label: "التقييمات", desc: "آراء العملاء" },
            { icon: BarChart3, label: "تحليلات متقدمة", desc: "رسوم بيانية" },
            { icon: Megaphone, label: "التسويق", desc: "حملات ذكية" },
            { icon: RefreshCw, label: "تحديثات مستمرة", desc: "ميزات جديدة" },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-dark-card/50 rounded-xl p-3 border border-dark-border/50"
            >
              <f.icon className="w-4 h-4 text-primary mb-1.5" />
              <p className="text-xs font-semibold text-white">{f.label}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
