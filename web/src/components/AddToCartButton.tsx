"use client";

import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ slug }: { slug: string }) {
  const { addBySlug } = useCart();
  return (
    <button
      type="button"
      onClick={() => addBySlug(slug, 1)}
      className="inline-flex items-center justify-center rounded-md border border-black/10 dark:border-white/10 bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
    >
      Sepete Ekle
    </button>
  );
}
