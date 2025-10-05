import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";

function formatPrice(currency: string, cents: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(
    cents / 100
  );
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-lg border border-black/10 dark:border-white/10 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="relative aspect-[4/3]">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium tracking-tight group-hover:opacity-80">
            {product.name}
          </h3>
          <p className="text-sm text-foreground/70 line-clamp-2">
            {product.description}
          </p>
        </div>
        <span className="text-sm font-semibold whitespace-nowrap">
          {formatPrice(product.currency, product.priceCents)}
        </span>
      </div>
    </Link>
  );
}
