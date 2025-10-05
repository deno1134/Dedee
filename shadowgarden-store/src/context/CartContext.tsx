"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { getProductBySlug, type Product } from "@/lib/products";

type CartItem = { product: Product; quantity: number };

type CartContextValue = {
  items: CartItem[];
  addBySlug: (slug: string, qty?: number) => void;
  removeBySlug: (slug: string) => void;
  clear: () => void;
  totalCents: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addBySlug = (slug: string, qty: number = 1) => {
    const product = getProductBySlug(slug);
    if (!product) return;
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.slug === slug);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qty,
        };
        return next;
      }
      return [...prev, { product, quantity: qty }];
    });
  };

  const removeBySlug = (slug: string) => {
    setItems((prev) => prev.filter((i) => i.product.slug !== slug));
  };

  const clear = () => setItems([]);

  const totalCents = useMemo(
    () => items.reduce((sum, i) => sum + i.product.priceCents * i.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addBySlug, removeBySlug, clear, totalCents }),
    [items, totalCents]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
