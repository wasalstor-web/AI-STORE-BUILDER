/**
 * Order Confirmation + Tracking Page.
 * Shows order details after checkout, and allows tracking by order number + email.
 */

import { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useOutletContext,
} from "react-router-dom";
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Clock,
  ShoppingBag,
  Copy,
  Check,
  Search,
  Loader2,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { storefrontApi } from "../../lib/api";
import type { PublicStore, PublicOrderTracking } from "../../types";

function formatPrice(price: number, currency = "SAR") {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  pending: {
    label: "قيد المراجعة",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  confirmed: {
    label: "تم التأكيد",
    icon: CheckCircle,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  processing: {
    label: "جاري التحضير",
    icon: Package,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  shipped: {
    label: "تم الشحن",
    icon: Truck,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  delivered: {
    label: "تم التوصيل",
    icon: MapPin,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  cancelled: {
    label: "ملغي",
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50",
  },
};

const STATUS_STEPS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

export default function OrderConfirmation() {
  const { slug, orderNumber: paramOrder } = useParams<{
    slug: string;
    orderNumber: string;
  }>();
  const [searchParams] = useSearchParams();
  const context = useOutletContext<{ store: PublicStore }>();
  const store = context?.store;
  const primaryColor = store?.primary_color || "#7c3aed";

  const emailFromQuery = searchParams.get("email") || "";

  const [order, setOrder] = useState<PublicOrderTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // For tracking-only mode (no orderNumber param → user types it)
  const [trackForm, setTrackForm] = useState({ orderNumber: "", email: "" });
  const isTrackMode = !paramOrder;

  // If came from checkout — auto-fetch
  useEffect(() => {
    if (paramOrder && emailFromQuery && slug) {
      fetchOrder(paramOrder, emailFromQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramOrder, emailFromQuery, slug]);

  const fetchOrder = async (on: string, email: string) => {
    if (!slug) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await storefrontApi.trackOrder(slug, on, email);
      setOrder(res.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || "لم يتم العثور على الطلب");
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackForm.orderNumber || !trackForm.email) {
      setError("يرجى إدخال رقم الطلب والبريد الإلكتروني");
      return;
    }
    fetchOrder(trackForm.orderNumber, trackForm.email);
  };

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.order_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  if (!store || !slug) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link
          to={`/store/${slug}`}
          className="hover:text-gray-600 transition-colors"
        >
          الرئيسية
        </Link>
        <ChevronRight className="w-3 h-3 rotate-180" />
        <span className="text-gray-900 font-medium">
          {isTrackMode ? "تتبع الطلب" : "تأكيد الطلب"}
        </span>
      </nav>

      {/* ── Track mode: search form ── */}
      {isTrackMode && !order && (
        <div className="max-w-md mx-auto text-center">
          <div
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: primaryColor + "15" }}
          >
            <Search className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تتبع طلبك</h1>
          <p className="text-gray-500 mb-8 text-sm">
            أدخل رقم الطلب والبريد الإلكتروني لمتابعة حالة طلبك
          </p>

          <form onSubmit={handleTrack} className="space-y-4 text-right">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                رقم الطلب
              </label>
              <input
                type="text"
                value={trackForm.orderNumber}
                onChange={(e) =>
                  setTrackForm((p) => ({ ...p, orderNumber: e.target.value }))
                }
                placeholder="ORD-XXXXXX"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={
                  { "--tw-ring-color": primaryColor } as React.CSSProperties
                }
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={trackForm.email}
                onChange={(e) =>
                  setTrackForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={
                  { "--tw-ring-color": primaryColor } as React.CSSProperties
                }
                dir="ltr"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" /> تتبع الطلب
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && !isTrackMode && (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-300" />
        </div>
      )}

      {/* ── Error for confirmation mode ── */}
      {error && !isTrackMode && (
        <div className="max-w-md mx-auto text-center py-16">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">خطأ</h2>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      )}

      {/* ── Order Details ── */}
      {order && (
        <div className="space-y-6">
          {/* Success banner */}
          {!isTrackMode && (
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                تم استلام طلبك بنجاح!
              </h1>
              <p className="text-gray-500 text-sm">
                شكراً لثقتك بنا. سنبدأ بتجهيز طلبك فوراً.
              </p>
            </div>
          )}

          {/* Order number card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">رقم الطلب</p>
              <p
                className="text-lg font-bold text-gray-900 tracking-wide"
                dir="ltr"
              >
                {order.order_number}
              </p>
            </div>
            <button
              onClick={copyOrderNumber}
              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              title="نسخ"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-500" />
              ) : (
                <Copy className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>

          {/* Status bar */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">حالة الطلب</h3>
            {order.status === "cancelled" ? (
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-700">
                  تم إلغاء الطلب
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, idx) => {
                  const cfg = STATUS_CONFIG[step];
                  const isActive = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div
                      key={step}
                      className="flex-1 flex flex-col items-center relative"
                    >
                      {idx > 0 && (
                        <div
                          className={`absolute top-4 -right-1/2 w-full h-0.5 ${isActive ? "" : "bg-gray-200"}`}
                          style={
                            isActive
                              ? { backgroundColor: primaryColor }
                              : undefined
                          }
                        />
                      )}
                      <div
                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isCurrent ? cfg.bg : isActive ? "" : "bg-gray-100"
                        }`}
                        style={
                          isActive && !isCurrent
                            ? { backgroundColor: primaryColor + "20" }
                            : undefined
                        }
                      >
                        <cfg.icon
                          className={`w-4 h-4 ${isCurrent ? cfg.color : isActive ? "" : "text-gray-300"}`}
                          style={
                            isActive && !isCurrent
                              ? { color: primaryColor }
                              : undefined
                          }
                        />
                      </div>
                      <p
                        className={`text-[10px] mt-1.5 text-center ${isCurrent ? "font-bold text-gray-900" : "text-gray-400"}`}
                      >
                        {cfg.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              تفاصيل الطلب
            </h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-gray-400">×{item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-4 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>المجموع الفرعي</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>ضريبة القيمة المضافة</span>
                <span>{formatPrice(order.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>الشحن</span>
                <span className="text-emerald-600 font-medium">
                  {order.shipping_cost > 0
                    ? formatPrice(order.shipping_cost)
                    : "مجاني"}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between">
                <span className="font-bold text-gray-900">الإجمالي</span>
                <span className="font-bold text-gray-900">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/store/${slug}/products`}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              مواصلة التسوق
            </Link>
            <Link
              to={`/store/${slug}`}
              className="flex-1 flex items-center justify-center gap-2 text-white rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
