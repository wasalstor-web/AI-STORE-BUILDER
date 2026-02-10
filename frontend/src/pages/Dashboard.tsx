import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { storesApi, tenantsApi, productsApi, ordersApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import {
  Store,
  PlusCircle,
  Package,
  Eye,
  Sparkles,
  ArrowUpLeft,
  Clock,
  Zap,
  LayoutGrid,
  Palette,
  Bot,
  BarChart3,
  ShoppingCart,
  Star,
  Activity,
  Bell,
  Layers,
  Rocket,
  Crown,
  Code2,
  ChevronLeft,
} from "lucide-react";
import type { Store as StoreType, StoreListResponse, Tenant, OrderSummary } from "../types";

const storeTypeLabels: Record<string, string> = {
  fashion: "أزياء",
  electronics: "إلكترونيات",
  beauty: "تجميل",
  food: "أغذية",
  general: "عام",
  jewelry: "مجوهرات",
  sports: "رياضة",
  kids: "أطفال",
  home: "ديكور",
  perfume: "عطور",
  health: "صحة",
  auto: "سيارات",
};

const storeTypeEmojis: Record<string, string> = {
  fashion: "👗",
  electronics: "📱",
  beauty: "💄",
  food: "🍽️",
  general: "🏪",
  jewelry: "💎",
  sports: "⚽",
  kids: "🧸",
  home: "🏠",
  perfume: "🌹",
  health: "🌿",
  auto: "🚗",
};

const storeTypeColors: Record<string, string> = {
  fashion: "from-amber-500/20 to-yellow-600/20",
  electronics: "from-cyan-500/20 to-blue-600/20",
  beauty: "from-pink-500/20 to-rose-600/20",
  food: "from-orange-500/20 to-red-500/20",
  general: "from-violet-500/20 to-purple-600/20",
  jewelry: "from-yellow-500/20 to-amber-600/20",
  sports: "from-green-500/20 to-emerald-600/20",
  kids: "from-indigo-400/20 to-purple-500/20",
  home: "from-amber-600/20 to-orange-700/20",
  perfume: "from-purple-600/20 to-fuchsia-600/20",
  health: "from-green-500/20 to-teal-600/20",
  auto: "from-red-500/20 to-rose-600/20",
};

// Activity feed — dynamically generated from stores data
function buildActivity(stores: StoreType[]) {
  const items: Array<{
    icon: typeof Bell;
    text: string;
    time: string;
    color: string;
    bg: string;
  }> = [];

  // Recent stores
  const sorted = [...stores].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  for (const store of sorted.slice(0, 3)) {
    const date = new Date(store.created_at);
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const time =
      diffHours < 1
        ? "الآن"
        : diffHours < 24
          ? `منذ ${diffHours} ساعة`
          : date.toLocaleDateString("ar-SA");
    items.push({
      icon: Store,
      text: `تم إنشاء متجر "${store.name}"`,
      time,
      color: store.status === "active" ? "text-success" : "text-primary-light",
      bg: store.status === "active" ? "bg-success/10" : "bg-primary/10",
    });
  }

  // System activity (always show)
  items.push(
    {
      icon: Bell,
      text: "نظام AI Builder جاهز للعمل",
      time: "الآن",
      color: "text-primary-light",
      bg: "bg-primary/10",
    },
    {
      icon: Palette,
      text: "12 قالب احترافي متاح",
      time: "النظام",
      color: "text-success",
      bg: "bg-success/10",
    },
  );

  return items.slice(0, 5);
}

const proFeatures = [
  { icon: Layers, label: "21+ قسم للسحب والإفلات", available: true },
  { icon: Palette, label: "12 قالب احترافي", available: true },
  { icon: Bot, label: "بناء بالذكاء الاصطناعي", available: true },
  { icon: Code2, label: "تصدير HTML كامل", available: true },
  { icon: BarChart3, label: "نطاق مخصص", available: false },
  { icon: BarChart3, label: "تحليلات متقدمة", available: false },
];

export default function Dashboard() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "لوحة التحكم | ويب فلو";
  }, []);

  const { data: storesData, isLoading: storesLoading } =
    useQuery<StoreListResponse>({
      queryKey: ["stores"],
      queryFn: async () => (await storesApi.list()).data,
    });

  const { data: tenant } = useQuery<Tenant>({
    queryKey: ["tenant"],
    queryFn: async () => (await tenantsApi.current()).data,
  });

  const stores = storesData?.stores || [];
  const totalStores = storesData?.total || 0;
  const activeStores = stores.filter(
    (s: StoreType) => s.status === "active",
  ).length;

  // Aggregate products count across all active stores
  const { data: aggregateProducts } = useQuery({
    queryKey: ["aggregate-products", stores.map((s: StoreType) => s.id)],
    queryFn: async () => {
      const activeIds = stores
        .filter((s: StoreType) => s.status === "active")
        .map((s: StoreType) => s.id);
      if (activeIds.length === 0) return 0;
      const results = await Promise.all(
        activeIds.map((id: string) =>
          productsApi.list(id, { page: 1, page_size: 1 }).then((r) => r.data?.total || 0)
        )
      );
      return results.reduce((sum: number, v: number) => sum + v, 0);
    },
    enabled: stores.length > 0,
  });

  // Aggregate orders data across all active stores
  const { data: aggregateOrders } = useQuery<{ total: number; revenue: number; pending: number }>({
    queryKey: ["aggregate-orders", stores.map((s: StoreType) => s.id)],
    queryFn: async () => {
      const activeIds = stores
        .filter((s: StoreType) => s.status === "active")
        .map((s: StoreType) => s.id);
      if (activeIds.length === 0) return { total: 0, revenue: 0, pending: 0 };
      const results = await Promise.all(
        activeIds.map((id: string) =>
          ordersApi.summary(id).then((r) => r.data as OrderSummary).catch(() => ({
            total_orders: 0,
            total_revenue: 0,
            pending_orders: 0,
            completed_orders: 0,
          }))
        )
      );
      return {
        total: results.reduce((sum, r) => sum + r.total_orders, 0),
        revenue: results.reduce((sum, r) => sum + r.total_revenue, 0),
        pending: results.reduce((sum, r) => sum + r.pending_orders, 0),
      };
    },
    enabled: stores.length > 0,
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "صباح الخير" : hour < 18 ? "مساء الخير" : "مساء النور";
  const emoji = hour < 12 ? "☀️" : hour < 18 ? "🌤️" : "🌙";

  const totalProducts = aggregateProducts ?? 0;
  const totalOrders = aggregateOrders?.total ?? 0;
  const totalRevenue = aggregateOrders?.revenue ?? 0;

  const stats = [
    {
      label: "إجمالي المتاجر",
      value: totalStores,
      icon: Store,
      gradient: "from-primary to-primary-dark",
      trend: totalStores > 0 ? `${activeStores} نشط` : "جديد",
      up: true,
    },
    {
      label: "متاجر نشطة",
      value: activeStores,
      icon: Zap,
      gradient: "from-success to-emerald-600",
      trend: `${activeStores}/${totalStores}`,
      up: true,
    },
    {
      label: "المنتجات",
      value: totalProducts,
      icon: Package,
      gradient: "from-accent to-orange-600",
      trend: totalProducts > 0 ? `${totalProducts} منتج` : "—",
      up: totalProducts > 0,
    },
    {
      label: "الطلبات",
      value: totalOrders,
      icon: ShoppingCart,
      gradient: "from-violet-500 to-purple-600",
      trend: totalOrders > 0 ? `${totalOrders} طلب` : "—",
      up: totalOrders > 0,
    },
    {
      label: "الإيرادات",
      value: totalRevenue > 0 ? `${totalRevenue.toFixed(0)}` : "0",
      icon: Star,
      gradient: "from-yellow-500 to-amber-600",
      trend: totalRevenue > 0 ? "ر.س" : "—",
      up: totalRevenue > 0,
    },
    {
      label: "الزيارات",
      value: "قريباً",
      icon: Eye,
      gradient: "from-blue-400 to-blue-600",
      trend: "—",
      up: true,
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* ── Hero Welcome ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-white/6 bg-[#0e1015]"
      >
        {/* Gradient BG */}
        <div className="absolute inset-0 bg-linear-to-bl from-violet-600/10 via-transparent to-blue-600/5" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-violet-600/8 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-blue-500/8 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/3 rounded-full blur-[100px]" />

        <div className="relative p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{emoji}</span>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  {greeting}، {user?.full_name?.split(" ")[0]}
                </h1>
              </div>
              <p className="text-text-secondary text-sm lg:text-base max-w-lg">
                {totalStores === 0
                  ? "ابدأ رحلتك — أنشئ أول متجر لك بالذكاء الاصطناعي واختر من 12 قالب احترافي 🚀"
                  : `عندك ${totalStores} متجر • ${activeStores} نشط — استمر في البناء والتطوير`}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="dot-live" />
                  النظام يعمل
                </span>
                <span className="text-[10px] flex items-center gap-1.5 px-2 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <Zap className="w-3 h-3" />
                  AI Builder Pro
                </span>
              </div>
            </div>
            <div className="flex gap-2.5 shrink-0">
              <Link
                to="/stores/create"
                className="bg-linear-to-l from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm px-5 py-3 rounded-xl flex items-center gap-2 transition-all font-semibold shadow-lg shadow-violet-600/20 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4" />
                إنشاء متجر
              </Link>
              <Link
                to="/stores/ai-builder"
                className="bg-white/6 hover:bg-white/10 text-white text-sm px-5 py-3 rounded-xl flex items-center gap-2 transition-all font-semibold border border-white/8 hover:-translate-y-0.5"
              >
                <Bot className="w-4 h-4" />
                بناء بالـ AI
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-4 group hover:border-violet-500/20 transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-9 h-9 rounded-xl bg-linear-to-br ${stat.gradient} flex items-center justify-center`}
              >
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${stat.up ? "text-success bg-success/10" : "text-danger bg-danger/10"}`}
              >
                {stat.trend}
              </span>
            </div>
            <p className="text-xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-[11px] text-text-muted mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Stores + Activity */}
        <div className="space-y-6">
          {/* Stores List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-violet-400" />
                <h2 className="text-lg font-bold">متاجرك</h2>
                {totalStores > 0 && (
                  <span className="text-[10px] text-text-muted bg-dark-hover px-2 py-0.5 rounded-full">
                    {totalStores}
                  </span>
                )}
              </div>
              <Link
                to="/stores/create"
                className="text-primary-light text-sm hover:underline flex items-center gap-1 font-medium"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                إضافة متجر
              </Link>
            </div>

            {storesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-card p-5 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-dark-hover rounded-xl" />
                      <div className="flex-1">
                        <div className="h-4 bg-dark-hover rounded w-2/5 mb-2" />
                        <div className="h-3 bg-dark-hover rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stores.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-10 text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-br from-violet-600/3 to-blue-600/3" />
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-5">
                    <Rocket className="w-10 h-10 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">ابدأ رحلتك الآن</h3>
                  <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
                    أنشئ متجرك الأول بثوانٍ — اختر من 12 قالب احترافي جاهز أو دع
                    الذكاء الاصطناعي يبنيه لك ✨
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Link
                      to="/stores/create"
                      className="btn-primary px-6 py-3 flex items-center gap-2 text-sm font-semibold"
                    >
                      <Palette className="w-4 h-4" />
                      اختر قالب
                    </Link>
                    <Link
                      to="/stores/ai-builder"
                      className="btn-outline px-6 py-3 flex items-center gap-2 text-sm font-semibold"
                    >
                      <Bot className="w-4 h-4" />
                      بناء بالـ AI
                    </Link>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-6 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" /> 21+ قسم
                    </span>
                    <span className="flex items-center gap-1">
                      <Palette className="w-3 h-3" /> 12 قالب
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI مدمج
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {stores.map((store: StoreType, i: number) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={`/stores/${store.id}`}
                      className="glass-card p-4 flex items-center gap-4 hover:border-violet-500/20 transition-all group hover:-translate-y-0.5"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-linear-to-br ${storeTypeColors[store.store_type] || storeTypeColors.general} flex items-center justify-center text-2xl shrink-0`}
                      >
                        {storeTypeEmojis[store.store_type] || "🏪"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold truncate group-hover:text-violet-400 transition-colors">
                            {store.name}
                          </h3>
                          <span
                            className={`badge text-[10px] ${
                              store.status === "active"
                                ? "badge-success"
                                : store.status === "pending"
                                  ? "badge-warning"
                                  : store.status === "generating"
                                    ? "badge-accent"
                                    : "badge-neutral"
                            }`}
                          >
                            {store.status === "active"
                              ? "نشط"
                              : store.status === "pending"
                                ? "معلّق"
                                : store.status === "generating"
                                  ? "جاري الإنشاء"
                                  : store.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span>
                            {storeTypeLabels[store.store_type] ||
                              store.store_type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(store.created_at).toLocaleDateString(
                              "ar-SA",
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-text-muted">
                          إدارة
                        </span>
                        <ChevronLeft className="w-4 h-4 text-text-muted group-hover:text-violet-400 transition-colors" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-blue-400" />
              <h2 className="text-lg font-bold">آخر التحديثات</h2>
            </div>
            <div className="space-y-2">
              {buildActivity(stores).map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="glass-card p-3.5 flex items-center gap-3"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}
                  >
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.text}</p>
                  </div>
                  <span className="text-[10px] text-text-muted shrink-0">
                    {item.time}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card overflow-hidden"
          >
            <div className="bg-linear-to-br from-violet-600/10 to-blue-600/10 p-5 border-b border-white/6">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-violet-400" />
                <h3 className="font-bold text-sm">خطتك الحالية</h3>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold">
                  {tenant?.plan === "free" ? "مجانية" : "احترافية"}
                </span>
                {tenant?.plan === "free" && (
                  <span className="text-xs text-text-muted">3 متاجر</span>
                )}
              </div>
              <div className="w-full h-2 bg-dark-hover/50 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-linear-to-l from-violet-600 to-blue-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min((totalStores / 3) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-text-muted mt-2">
                {totalStores} / 3 متاجر مستخدمة
              </p>
            </div>
            <div className="p-4">
              <p className="text-xs text-text-muted mb-3">مميزاتك:</p>
              <div className="space-y-2">
                {proFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <f.icon
                      className={`w-3.5 h-3.5 ${f.available ? "text-success" : "text-text-muted"}`}
                    />
                    <span
                      className={
                        f.available ? "" : "text-text-muted line-through"
                      }
                    >
                      {f.label}
                    </span>
                    {!f.available && (
                      <span className="text-[9px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded mr-auto">
                        Pro
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <ArrowUpLeft className="w-4 h-4 text-violet-400" />
              إجراءات سريعة
            </h3>
            <div className="space-y-1.5">
              {[
                {
                  label: "إنشاء متجر جديد",
                  icon: PlusCircle,
                  to: "/stores/create",
                  color: "text-violet-400",
                },
                {
                  label: "بناء بالذكاء الاصطناعي",
                  icon: Bot,
                  to: "/stores/ai-builder",
                  color: "text-blue-400",
                },
                {
                  label: "معرض القوالب",
                  icon: Palette,
                  to: "/stores/create",
                  color: "text-amber-400",
                },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-dark-hover transition-colors text-sm group"
                >
                  <link.icon className={`w-4 h-4 ${link.color}`} />
                  <span className="group-hover:text-text-primary transition-colors">
                    {link.label}
                  </span>
                  <ChevronLeft className="w-3.5 h-3.5 text-text-muted mr-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* AI Tip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-violet-500/15 bg-linear-to-br from-violet-600/5 to-blue-600/5 p-5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-sm font-bold text-violet-400">
                  نصيحة اليوم
                </span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                جرّب كتابة "أبي متجر أزياء فاخر بألوان ذهبية مع عروض وتقييمات
                عملاء" في AI Builder — شوف كيف يبني لك متجر كامل في ثوانٍ! ✨
              </p>
              <Link
                to="/stores/ai-builder"
                className="text-violet-400 text-xs font-semibold hover:underline flex items-center gap-1"
              >
                جرّب الآن
                <ChevronLeft className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>

          {/* Builder Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-5"
          >
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              إحصائيات البلدر
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: "12",
                  label: "قالب جاهز",
                  Icon: Palette,
                  color: "text-violet-400",
                  bg: "bg-violet-500/10",
                },
                {
                  value: "21+",
                  label: "قسم متاح",
                  Icon: Layers,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                },
                {
                  value: "12",
                  label: "نوع متجر",
                  Icon: Store,
                  color: "text-success",
                  bg: "bg-success/10",
                },
                {
                  value: "∞",
                  label: "تخصيص AI",
                  Icon: Bot,
                  color: "text-warning",
                  bg: "bg-warning/10",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-dark-hover/50 rounded-xl p-3 text-center"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mx-auto mb-1`}
                  >
                    <item.Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <p className="text-lg font-bold">{item.value}</p>
                  <p className="text-[10px] text-text-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
