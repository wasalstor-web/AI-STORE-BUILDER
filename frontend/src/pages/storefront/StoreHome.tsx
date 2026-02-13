/**
 * Storefront Home — Hero, Categories, Featured Products.
 */

import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Star, Sparkles } from "lucide-react";
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

function ProductCard({
  product,
  slug,
}: {
  product: PublicProduct;
  slug: string;
}) {
  const { addItem } = useCartStore();
  const discount = product.compare_at_price
    ? Math.round(
        ((product.compare_at_price - product.price) /
          product.compare_at_price) *
          100,
      )
    : 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Image */}
      <Link
        to={`/store/${slug}/product/${product.slug}`}
        className="block relative aspect-square overflow-hidden bg-gray-50"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingBag className="w-12 h-12" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            -{discount}%
          </span>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg">
              نفذت الكمية
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        {product.category_name && (
          <p className="text-xs text-gray-400 mb-1">{product.category_name}</p>
        )}
        <Link to={`/store/${slug}/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 hover:text-gray-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.compare_at_price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.compare_at_price, product.currency)}
              </span>
            )}
          </div>
          {product.in_stock && (
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem(product);
              }}
              className="p-2 rounded-xl text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
              style={{ backgroundColor: "var(--store-primary, #7c3aed)" }}
              aria-label="أضف للسلة"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StoreHome() {
  const { slug } = useParams<{ slug: string }>();
  const context = useOutletContext<{ store: PublicStore }>();
  const store = context?.store;

  if (!store || !slug) return null;

  return (
    <div>
      {/* ── Hero Section ── */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: store.primary_color || "#7c3aed" }}
      >
        <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight mb-4">
              {store.hero_title}
            </h1>
            {store.hero_subtitle && (
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                {store.hero_subtitle}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/store/${slug}/products`}
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all shadow-lg"
              >
                تسوق الآن
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative border-t border-white/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-8 text-white/70 text-sm">
              <span>
                <span className="font-bold text-white">
                  {store.product_count}
                </span>{" "}
                منتج
              </span>
              <span>
                <span className="font-bold text-white">
                  {store.category_count}
                </span>{" "}
                قسم
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="font-bold text-white">4.8</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      {store.categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">تسوق حسب القسم</h2>
            <Link
              to={`/store/${slug}/products`}
              className="text-sm font-medium hover:underline transition-colors"
              style={{ color: store.primary_color }}
            >
              عرض الكل
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {store.categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/store/${slug}/products?category=${cat.slug}`}
                className="group relative bg-gray-50 rounded-2xl p-6 text-center hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-16 h-16 mx-auto rounded-xl object-cover mb-3 group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div
                    className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-3 text-white text-2xl font-bold group-hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: store.primary_color + "20",
                      color: store.primary_color,
                    }}
                  >
                    {cat.name.charAt(0)}
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 text-sm">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {cat.product_count} منتج
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Products ── */}
      {store.featured_products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Sparkles
                className="w-6 h-6"
                style={{ color: store.primary_color }}
              />
              <h2 className="text-2xl font-bold text-gray-900">منتجات مميزة</h2>
            </div>
            <Link
              to={`/store/${slug}/products?featured=true`}
              className="text-sm font-medium hover:underline transition-colors"
              style={{ color: store.primary_color }}
            >
              عرض الكل
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {store.featured_products.map((product) => (
              <ProductCard key={product.id} product={product} slug={slug} />
            ))}
          </div>
        </section>
      )}

      {/* ── Features ── */}
      {store.features.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {store.features.slice(0, 4).map((feature, i) => (
                <div key={i} className="text-center">
                  <div
                    className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3"
                    style={{
                      backgroundColor: store.primary_color + "15",
                      color: store.primary_color,
                    }}
                  >
                    <span className="text-lg">
                      {(feature as Record<string, string>).icon || "✨"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {(feature as Record<string, string>).title ||
                      `ميزة ${i + 1}`}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {(feature as Record<string, string>).description || ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
