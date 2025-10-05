import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-black/10 dark:border-white/10 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          ShadowGarden
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:opacity-80 transition-opacity">Store</Link>
          <Link href="/cart" className="hover:opacity-80 transition-opacity">Cart</Link>
        </nav>
      </div>
    </header>
  );
}
