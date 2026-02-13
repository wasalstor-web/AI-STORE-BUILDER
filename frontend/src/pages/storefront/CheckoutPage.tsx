/**
 * Checkout Page — Customer info form and order submission.
 */

import { useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import {
  CreditCard,
  Truck,
  Lock,
  Loader2,
  ChevronRight,
  ShoppingBag,
  Wallet,
  Banknote,
  Smartphone,
} from "lucide-react";
import { useCartStore } from "../../stores/cartStore";
import { storefrontApi } from "../../lib/api";
import type { PublicStore } from "../../types";

function formatPrice(price: number, currency = "SAR") {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "الدفع عند الاستلام",
    icon: Banknote,
    desc: "ادفع نقداً عند التوصيل",
  },
  { id: "mada", label: "مدى", icon: CreditCard, desc: "بطاقة مدى المصرفية" },
  {
    id: "visa",
    label: "فيزا / ماستركارد",
    icon: CreditCard,
    desc: "بطاقات الائتمان",
  },
  {
    id: "stc_pay",
    label: "STC Pay",
    icon: Smartphone,
    desc: "الدفع عبر STC Pay",
  },
];

const CITIES = [
  "الرياض",
  "جدة",
  "مكة المكرمة",
  "المدينة المنورة",
  "الدمام",
  "الخبر",
  "الظهران",
  "تبوك",
  "بريدة",
  "الطائف",
  "أبها",
  "خميس مشيط",
  "حائل",
  "نجران",
  "جازان",
  "الأحساء",
  "ينبع",
];

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const context = useOutletContext<{ store: PublicStore }>();
  const store = context?.store;
  const { items, subtotal, taxAmount, total, clearCart } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    district: "",
    street: "",
    notes: "",
  });

  if (!store || !slug) return null;
  const primaryColor = store.primary_color || "#7c3aed";

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">السلة فارغة</h2>
        <Link
          to={`/store/${slug}/products`}
          className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold text-sm mt-4 shadow-lg"
          style={{ backgroundColor: primaryColor }}
        >
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.phone || !form.city) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);
    try {
      const res = await storefrontApi.checkout(slug, {
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        shipping_address: {
          city: form.city,
          district: form.district,
          street: form.street,
        },
        payment_method: paymentMethod,
        customer_notes: form.notes || undefined,
      });

      const orderNumber = res.data.order_number;
      clearCart();
      navigate(
        `/store/${slug}/order/${orderNumber}?email=${encodeURIComponent(form.email)}`,
      );
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr?.response?.data?.detail || "حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link
          to={`/store/${slug}/cart`}
          className="hover:text-gray-600 transition-colors"
        >
          السلة
        </Link>
        <ChevronRight className="w-3 h-3 rotate-180" />
        <span className="text-gray-900 font-medium">إتمام الشراء</span>
      </nav>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Form ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5" style={{ color: primaryColor }} />
                معلومات التوصيل
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="محمد أحمد"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={
                      { "--tw-ring-color": primaryColor } as React.CSSProperties
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={
                      { "--tw-ring-color": primaryColor } as React.CSSProperties
                    }
                    required
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    رقم الجوال *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateForm("phone", e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={
                      { "--tw-ring-color": primaryColor } as React.CSSProperties
                    }
                    required
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    المدينة *
                  </label>
                  <select
                    value={form.city}
                    onChange={(e) => updateForm("city", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer"
                    style={
                      { "--tw-ring-color": primaryColor } as React.CSSProperties
                    }
                    required
                  >
                    <option value="">اختر المدينة</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    الحي
                  </label>
                  <input
                    type="text"
                    value={form.district}
                    onChange={(e) => updateForm("district", e.target.value)}
                    placeholder="اسم الحي"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={
                      { "--tw-ring-color": primaryColor } as React.CSSProperties
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    العنوان التفصيلي
                  </label>
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => updateForm("street", e.target.value)}
                    placeholder="رقم المبنى، الشارع"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={
                      { "--tw-ring-color": primaryColor } as React.CSSProperties
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm("notes", e.target.value)}
                  placeholder="ملاحظات إضافية للتوصيل..."
                  rows={2}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none"
                  style={
                    { "--tw-ring-color": primaryColor } as React.CSSProperties
                  }
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5" style={{ color: primaryColor }} />
                طريقة الدفع
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-right ${
                      paymentMethod === method.id
                        ? "border-current bg-opacity-5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={
                      paymentMethod === method.id
                        ? {
                            borderColor: primaryColor,
                            backgroundColor: primaryColor + "08",
                          }
                        : undefined
                    }
                  >
                    <method.icon
                      className="w-5 h-5 flex-shrink-0"
                      style={{
                        color:
                          paymentMethod === method.id
                            ? primaryColor
                            : "#9ca3af",
                      }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {method.label}
                      </p>
                      <p className="text-xs text-gray-400">{method.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                ملخص الطلب
              </h3>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع الفرعي</span>
                  <span>{formatPrice(subtotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ضريبة القيمة المضافة (15%)</span>
                  <span>{formatPrice(taxAmount())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>الشحن</span>
                  <span className="text-emerald-600 font-medium">مجاني</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="text-base font-bold text-gray-900">
                    الإجمالي
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    {formatPrice(total())}
                  </span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 w-full text-white py-3 px-6 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-lg mt-6 disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    تأكيد الطلب — {formatPrice(total())}
                  </>
                )}
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                بياناتك محمية ومشفرة بالكامل
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
