"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function CheckoutButton() {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.product.slug, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url as string;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      disabled={loading || items.length === 0}
      onClick={handleCheckout}
      className="w-full text-center rounded-md border border-black/10 dark:border-white/10 bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "Yönlendiriliyor..." : "Ödemeye Geç"}
    </button>
  );
}
