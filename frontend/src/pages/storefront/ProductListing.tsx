/**
 * Product Listing — Grid with search, category filter, sorting.
 */

import { useEffect, useState } from "react";
import {
  Link,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ShoppingBag,
  SlidersHorizontal,
  Search,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { storefrontApi } from "../../lib/api";
import { useCartStore } from "../../stores/cartStore";
import type { PublicStore, PublicProduct, PublicCategory } from "../../types";

function formatPrice(price: number, currency = "SAR") {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export default function ProductListing() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const context = useOutletContext<{ store: PublicStore }>();
  const store = context?.store;
  const { addItem } = useCartStore();

  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const page = parseInt(searchParams.get("page") || "1");
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";
  const featured = searchParams.get("featured") === "true" ? true : undefined;

  useEffect(() => {
    if (!slug) return;
    storefrontApi
      .listCategories(slug)
      .then((res) => {
        setCategories(res.data.categories || []);
      })
      .catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    storefrontApi
      .listProducts(slug, {
        page,
        page_size: 12,
        category: category || undefined,
        search: search || undefined,
        sort,
        featured,
      })
      .then((res) => {
        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.total_pages || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, page, category, search, sort, featured]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.delete("page");
    setSearchParams(params);
  };

  if (!store || !slug) return null;
  const primaryColor = store.primary_color || "#7c3aed";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {category
            ? categories.find((c) => c.slug === category)?.name || "المنتجات"
            : search
              ? `نتائج البحث: "${search}"`
              : featured
                ? "المنتجات المميزة"
                : "جميع المنتجات"}
        </h1>
        <p className="text-sm text-gray-500">{total} منتج</p>
      </div>

      {/* ── Filters Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParam("search", (e.target as HTMLInputElement).value);
              }
            }}
            placeholder="ابحث عن منتج..."
            className="w-full pr-10 pl-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
            style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={category}
            onChange={(e) => updateParam("category", e.target.value)}
            className="appearance-none pr-10 pl-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer min-w-[140px]"
            style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
          >
            <option value="">جميع الأقسام</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name} ({cat.product_count})
              </option>
            ))}
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="appearance-none pr-4 pl-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all cursor-pointer min-w-[140px]"
            style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
          >
            <option value="newest">الأحدث</option>
            <option value="price_asc">السعر: الأقل</option>
            <option value="price_desc">السعر: الأعلى</option>
            <option value="popular">الأكثر شهرة</option>
          </select>
          <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Product Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">لا توجد منتجات</p>
          <p className="text-gray-400 text-sm mt-1">
            جرب تغيير الفلتر أو البحث بكلمة مختلفة
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
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
                  {product.compare_at_price && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      -
                      {Math.round(
                        ((product.compare_at_price - product.price) /
                          product.compare_at_price) *
                          100,
                      )}
                      %
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
                <div className="p-4">
                  {product.category_name && (
                    <p className="text-xs text-gray-400 mb-1">
                      {product.category_name}
                    </p>
                  )}
                  <Link to={`/store/${slug}/product/${product.slug}`}>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 hover:text-gray-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price, product.currency)}
                      </span>
                      {product.compare_at_price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(
                            product.compare_at_price,
                            product.currency,
                          )}
                        </span>
                      )}
                    </div>
                    {product.in_stock && (
                      <button
                        onClick={() => addItem(product)}
                        className="p-2 rounded-xl text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                        aria-label="أضف للسلة"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam("page", String(p))}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                    p === page
                      ? "text-white shadow-sm"
                      : "text-gray-600 bg-white border border-gray-200 hover:border-gray-300"
                  }`}
                  style={
                    p === page ? { backgroundColor: primaryColor } : undefined
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
