/**
 * Product Detail — Full product page with gallery, description, add to cart.
 */

import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  ShoppingBag,
  Minus,
  Plus,
  ChevronRight,
  Truck,
  Shield,
  RotateCcw,
  Check,
  Loader2,
  Heart,
} from "lucide-react";
import { storefrontApi } from "../../lib/api";
import { useCartStore } from "../../stores/cartStore";
import type { PublicStore, PublicProduct } from "../../types";

function formatPrice(price: number, currency = "SAR") {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export default function ProductDetail() {
  const { slug, productSlug } = useParams<{
    slug: string;
    productSlug: string;
  }>();
  const context = useOutletContext<{ store: PublicStore }>();
  const store = context?.store;
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (!slug || !productSlug) return;
    setLoading(true);
    storefrontApi
      .getProduct(slug, productSlug)
      .then((res) => setProduct(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, productSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!product || !store || !slug) {
    return (
      <div className="text-center py-32">
        <p className="text-gray-500 text-lg">المنتج غير موجود</p>
        <Link
          to={`/store/${slug}/products`}
          className="text-sm mt-2 inline-block hover:underline"
          style={{ color: store?.primary_color }}
        >
          العودة للمنتجات
        </Link>
      </div>
    );
  }

  const primaryColor = store.primary_color || "#7c3aed";
  const images = product.image_url
    ? [product.image_url, ...(product.images || [])]
    : product.images || [];
  const discount = product.compare_at_price
    ? Math.round(
        ((product.compare_at_price - product.price) /
          product.compare_at_price) *
          100,
      )
    : 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link
          to={`/store/${slug}`}
          className="hover:text-gray-600 transition-colors"
        >
          الرئيسية
        </Link>
        <ChevronRight className="w-3 h-3 rotate-180" />
        <Link
          to={`/store/${slug}/products`}
          className="hover:text-gray-600 transition-colors"
        >
          المنتجات
        </Link>
        {product.category_name && (
          <>
            <ChevronRight className="w-3 h-3 rotate-180" />
            <span className="text-gray-600">{product.category_name}</span>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* ── Image Gallery ── */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
            {images.length > 0 ? (
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ShoppingBag className="w-16 h-16" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    i === selectedImage
                      ? "border-current opacity-100"
                      : "border-transparent opacity-60 hover:opacity-80"
                  }`}
                  style={{ color: primaryColor }}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div>
          {product.category_name && (
            <p
              className="text-sm font-medium mb-2"
              style={{ color: primaryColor }}
            >
              {product.category_name}
            </p>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.compare_at_price && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.compare_at_price, product.currency)}
                </span>
                <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">
                  وفر {discount}%
                </span>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-6">
            {product.in_stock ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">
                  متوفر في المخزون
                </span>
              </>
            ) : (
              <span className="text-sm font-medium text-red-500">
                غير متوفر حالياً
              </span>
            )}
          </div>

          {/* Description */}
          {product.short_description && (
            <p className="text-gray-600 leading-relaxed mb-6">
              {product.short_description}
            </p>
          )}

          {/* Quantity + Add to Cart */}
          {product.in_stock && (
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {/* Quantity Selector */}
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  aria-label="أنقص الكمية"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-semibold text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(99, quantity + 1))}
                  className="p-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  aria-label="زد الكمية"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 text-white py-3 px-6 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    تمت الإضافة!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    أضف إلى السلة
                  </>
                )}
              </button>

              {/* Wishlist */}
              <button
                className="p-3 border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-200 transition-all"
                aria-label="أضف للمفضلة"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Truck, label: "شحن سريع", desc: "2-5 أيام عمل" },
              { icon: Shield, label: "دفع آمن", desc: "بيانات مشفرة" },
              { icon: RotateCcw, label: "إرجاع سهل", desc: "خلال 14 يوم" },
            ].map((badge) => (
              <div
                key={badge.label}
                className="text-center p-3 bg-gray-50 rounded-xl"
              >
                <badge.icon className="w-5 h-5 mx-auto text-gray-500 mb-1" />
                <p className="text-xs font-semibold text-gray-700">
                  {badge.label}
                </p>
                <p className="text-[10px] text-gray-400">{badge.desc}</p>
              </div>
            ))}
          </div>

          {/* Full Description */}
          {product.description && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                وصف المنتج
              </h3>
              <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Related Products ── */}
      {product.related_products && product.related_products.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            منتجات ذات صلة
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {product.related_products.map((rel) => (
              <Link
                key={rel.id}
                to={`/store/${slug}/product/${rel.slug}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden bg-gray-50">
                  {rel.image_url ? (
                    <img
                      src={rel.image_url}
                      alt={rel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
                    {rel.name}
                  </h3>
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(rel.price, rel.currency)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
