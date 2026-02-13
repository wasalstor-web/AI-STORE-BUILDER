/**
 * Shopping Cart — View and manage cart items.
 */

import { Link, useOutletContext, useParams } from "react-router-dom";
import { ShoppingBag, Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useCartStore } from "../../stores/cartStore";
import type { PublicStore } from "../../types";

function formatPrice(price: number, currency = "SAR") {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export default function CartPage() {
  const { slug } = useParams<{ slug: string }>();
  const context = useOutletContext<{ store: PublicStore }>();
  const store = context?.store;
  const { items, updateQuantity, removeItem, subtotal, taxAmount, total } = useCartStore();

  if (!store || !slug) return null;
  const primaryColor = store.primary_color || "#7c3aed";

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">السلة فارغة</h2>
        <p className="text-gray-500 mb-8">لم تضف أي منتجات بعد</p>
        <Link
          to={`/store/${slug}/products`}
          className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 shadow-lg"
          style={{ backgroundColor: primaryColor }}
        >
          تصفح المنتجات
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        سلة التسوق <span className="text-gray-400 text-lg font-normal">({items.length} منتج)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Cart Items ── */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl">
              {/* Image */}
              <Link
                to={`/store/${slug}/product/${item.product.slug}`}
                className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-50"
              >
                {item.product.image_url ? (
                  <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                )}
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link to={`/store/${slug}/product/${item.product.slug}`}>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 hover:text-gray-600 transition-colors">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-400 mt-0.5">
                  {formatPrice(item.product.price, item.product.currency)} للقطعة
                </p>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">
                      {formatPrice(item.product.price * item.quantity, item.product.currency)}
                    </span>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">ملخص الطلب</h3>

            <div className="space-y-3 text-sm">
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
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-base font-bold text-gray-900">الإجمالي</span>
                <span className="text-base font-bold text-gray-900">{formatPrice(total())}</span>
              </div>
            </div>

            <Link
              to={`/store/${slug}/checkout`}
              className="flex items-center justify-center gap-2 w-full text-white py-3 px-6 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-lg mt-6"
              style={{ backgroundColor: primaryColor }}
            >
              إتمام الشراء
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link
              to={`/store/${slug}/products`}
              className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3 transition-colors"
            >
              متابعة التسوق
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
