import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import AddToCartButton from "@/components/AddToCartButton";

function formatPrice(currency: string, cents: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(
    cents / 100
  );
}

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) return notFound();

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="relative aspect-square rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
      </div>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-foreground/70">{product.description}</p>
        </div>
        <div className="text-xl font-semibold">
          {formatPrice(product.currency, product.priceCents)}
        </div>
        <AddToCartButton slug={product.slug} />
      </div>
    </div>
  );
}
