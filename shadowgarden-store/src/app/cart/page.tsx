"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

function formatPrice(currency: string, cents: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(
    cents / 100
  );
}

export default function CartPage() {
  const { items, removeBySlug, totalCents } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center space-y-4">
        <p>Sepetiniz boş.</p>
        <Link href="/" className="underline">Alışverişe devam et</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <ul className="space-y-4">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4">
            <div className="relative w-24 h-24 rounded-md overflow-hidden border border-black/10 dark:border-white/10">
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-foreground/70">Adet: {quantity}</div>
            </div>
            <div className="text-sm font-semibold">
              {formatPrice(product.currency, product.priceCents * quantity)}
            </div>
            <button
              onClick={() => removeBySlug(product.slug)}
              className="ml-2 text-sm underline"
            >
              Kaldır
            </button>
          </li>
        ))}
      </ul>
      <aside className="border rounded-lg p-4 border-black/10 dark:border-white/10 h-max">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">Ara toplam</span>
          <span className="font-semibold">{formatPrice("USD", totalCents)}</span>
        </div>
        <a
          href="/checkout/success"
          className="block text-center rounded-md border border-black/10 dark:border-white/10 bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Ödemeye Geç (Demo)
        </a>
      </aside>
    </div>
  );
}
