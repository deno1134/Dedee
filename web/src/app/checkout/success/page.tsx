"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function SuccessPage() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="text-center space-y-4">
      <h1 className="text-2xl font-semibold">Ödeme Başarılı</h1>
      <p>Siparişiniz için teşekkür ederiz.</p>
      <Link href="/" className="underline">Mağazaya dön</Link>
    </div>
  );
}
