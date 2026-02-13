/**
 * Shopping Cart Store — Zustand with localStorage persistence.
 * Scoped per store slug to support multi-store browsing.
 */

import { create } from "zustand";
import type { PublicProduct, CartItem } from "../types";

interface CartState {
  items: CartItem[];
  storeSlug: string | null;

  // Actions
  setStoreSlug: (slug: string) => void;
  addItem: (product: PublicProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Computed
  totalItems: () => number;
  subtotal: () => number;
  taxAmount: () => number;
  total: () => number;
}

const CART_STORAGE_KEY = "aisb_cart";

function loadCart(slug: string): CartItem[] {
  try {
    const data = localStorage.getItem(`${CART_STORAGE_KEY}_${slug}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCart(slug: string, items: CartItem[]) {
  try {
    localStorage.setItem(`${CART_STORAGE_KEY}_${slug}`, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable
  }
}

const TAX_RATE = 0.15; // 15% VAT

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  storeSlug: null,

  setStoreSlug: (slug) => {
    const items = loadCart(slug);
    set({ storeSlug: slug, items });
  },

  addItem: (product, quantity = 1) => {
    const { items, storeSlug } = get();
    const existing = items.find((i) => i.product.id === product.id);

    let newItems: CartItem[];
    if (existing) {
      newItems = items.map((i) =>
        i.product.id === product.id
          ? { ...i, quantity: i.quantity + quantity }
          : i,
      );
    } else {
      newItems = [...items, { product, quantity }];
    }

    set({ items: newItems });
    if (storeSlug) saveCart(storeSlug, newItems);
  },

  removeItem: (productId) => {
    const { items, storeSlug } = get();
    const newItems = items.filter((i) => i.product.id !== productId);
    set({ items: newItems });
    if (storeSlug) saveCart(storeSlug, newItems);
  },

  updateQuantity: (productId, quantity) => {
    const { items, storeSlug } = get();
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const newItems = items.map((i) =>
      i.product.id === productId ? { ...i, quantity } : i,
    );
    set({ items: newItems });
    if (storeSlug) saveCart(storeSlug, newItems);
  },

  clearCart: () => {
    const { storeSlug } = get();
    set({ items: [] });
    if (storeSlug) localStorage.removeItem(`${CART_STORAGE_KEY}_${storeSlug}`);
  },

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  subtotal: () =>
    get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

  taxAmount: () => get().subtotal() * TAX_RATE,

  total: () => get().subtotal() + get().taxAmount(),
}));
