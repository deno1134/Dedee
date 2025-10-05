export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  currency: string;
  priceCents: number;
};

export const products: Product[] = [
  {
    id: "sg-rose-001",
    slug: "midnight-rose",
    name: "Midnight Rose",
    description:
      "A premium, long-stem rose bouquet curated for ShadowGarden aesthetics.",
    imageUrl:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop",
    currency: "USD",
    priceCents: 4900,
  },
  {
    id: "sg-lamp-002",
    slug: "arcane-lamp",
    name: "Arcane Lamp",
    description:
      "Soft ambient desk lamp with matte-black finish and warm glow.",
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1200&auto=format&fit=crop",
    currency: "USD",
    priceCents: 8900,
  },
  {
    id: "sg-mug-003",
    slug: "shadow-mug",
    name: "Shadow Mug",
    description:
      "Ceramic mug with ShadowGarden emblem, satin black glaze.",
    imageUrl:
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1200&auto=format&fit=crop",
    currency: "USD",
    priceCents: 2400,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
