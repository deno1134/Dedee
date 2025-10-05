export default function Footer() {
  return (
    <footer className="border-t border-black/10 dark:border-white/10 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-center text-foreground/70">
        © {new Date().getFullYear()} ShadowGarden. All rights reserved.
      </div>
    </footer>
  );
}
