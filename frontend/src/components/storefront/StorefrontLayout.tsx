/**
 * Storefront Layout — Customer-facing store shell.
 * Light theme, RTL Arabic, responsive.
 */

import { Link, Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShoppingBag, Search, Menu, X, Package } from "lucide-react";
import { useCartStore } from "../../stores/cartStore";
import { storefrontApi } from "../../lib/api";
import type { PublicStore } from "../../types";

export default function StorefrontLayout() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<PublicStore | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { setStoreSlug, totalItems } = useCartStore();
  const cartCount = totalItems();

  useEffect(() => {
    if (!slug) return;
    setStoreSlug(slug);
    storefrontApi
      .getStore(slug)
      .then((res) => setStore(res.data))
      .catch(() => {});
  }, [slug, setStoreSlug]);

  if (!store) return null;

  const primaryColor = store.primary_color || "#7c3aed";

  return (
    <div
      className="min-h-screen bg-white text-gray-900"
      dir="rtl"
      style={{ "--store-primary": primaryColor } as React.CSSProperties}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Store Name */}
            <Link to={`/store/${slug}`} className="flex items-center gap-3">
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="h-8 w-8 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {store.name.charAt(0)}
                </div>
              )}
              <span className="text-lg font-bold text-gray-900">
                {store.name}
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to={`/store/${slug}`}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                الرئيسية
              </Link>
              <Link
                to={`/store/${slug}/products`}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                المنتجات
              </Link>
              {store.categories.slice(0, 4).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/store/${slug}/products?category=${cat.slug}`}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                aria-label="بحث"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <Link
                to={`/store/${slug}/cart`}
                className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                aria-label="سلة التسوق"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -left-0.5 min-w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Track Order */}
              <Link
                to={`/store/${slug}/track`}
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                <Package className="w-4 h-4" />
                <span>تتبع طلبك</span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                aria-label="القائمة"
              >
                {menuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    window.location.href = `/store/${slug}/products?search=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="relative"
              >
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن منتج..."
                  className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={
                    { "--tw-ring-color": primaryColor } as React.CSSProperties
                  }
                  autoFocus
                />
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-3 space-y-2">
              <Link
                to={`/store/${slug}`}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                الرئيسية
              </Link>
              <Link
                to={`/store/${slug}/products`}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                جميع المنتجات
              </Link>
              {store.categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/store/${slug}/products?category=${cat.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                to={`/store/${slug}/track`}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                تتبع طلبك
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <main>
        <Outlet context={{ store }} />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Store Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {store.name}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {(store.about as Record<string, string>)?.description ||
                  "متجرك الإلكتروني المفضل"}
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                روابط سريعة
              </h4>
              <div className="space-y-2">
                <Link
                  to={`/store/${slug}/products`}
                  className="block text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  المنتجات
                </Link>
                <Link
                  to={`/store/${slug}/cart`}
                  className="block text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  سلة التسوق
                </Link>
                <Link
                  to={`/store/${slug}/track`}
                  className="block text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  تتبع طلبك
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                تواصل معنا
              </h4>
              <p className="text-sm text-gray-500">
                الرياض، المملكة العربية السعودية
              </p>
              <p className="text-sm text-gray-500 mt-1">
                جميع الأسعار شاملة ضريبة القيمة المضافة 15%
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} {store.name}. جميع الحقوق
              محفوظة.
            </p>
            <p className="text-xs text-gray-400">
              مدعوم بواسطة{" "}
              <Link
                to="/"
                className="hover:text-gray-600 transition-colors font-medium"
              >
                ويب فلو
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
