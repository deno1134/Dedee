import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/products";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY" },
      { status: 500 }
    );
  }

  const stripe = new Stripe(secretKey);

  try {
    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Empty items" }, { status: 400 });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    for (const it of items as Array<{ slug: string; quantity: number }>) {
      const product = getProductBySlug(it.slug);
      if (!product) continue;
      line_items.push({
        quantity: Math.max(1, Number(it.quantity) || 1),
        price_data: {
          currency: product.currency,
          unit_amount: product.priceCents,
          product_data: {
            name: product.name,
            images: [product.imageUrl],
          },
        },
      });
    }

    if (line_items.length === 0) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    const url = new URL(req.url);
    const successUrl = new URL("/checkout/success", `${url.protocol}//${url.host}`).toString();
    const cancelUrl = new URL("/checkout/cancel", `${url.protocol}//${url.host}`).toString();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      submit_type: "pay",
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
