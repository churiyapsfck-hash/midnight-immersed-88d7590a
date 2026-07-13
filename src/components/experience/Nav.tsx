export function Nav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between bg-white px-6 py-5 text-black md:px-12">
      <a href="#top" className="flex items-center gap-3">
        <span className="relative inline-flex h-3 w-3 items-center justify-center">
          <span className="absolute h-3 w-3 rotate-45 border border-black/60" />
          <span className="absolute h-1 w-1 rotate-45 bg-[oklch(0.55_0.24_25)] shadow-[0_0_10px_oklch(0.55_0.24_25)] animate-breathe" />
        </span>
        <span className="font-mono text-xs tracking-[0.32em] text-black">ILLUMINATI 3.0</span>
      </a>
      <nav className="hidden gap-8 font-mono text-[11px] tracking-[0.28em] text-black/70 md:flex">
        <a href="#tickets" className="transition-colors hover:text-black">01 — ACCESS</a>
        <a href="#gallery" className="transition-colors hover:text-black">02 — EDITION</a>
        <a href="#timeline" className="transition-colors hover:text-black">03 — LOCATION</a>
        <a href="#faq" className="transition-colors hover:text-black">04 — DECODE</a>
      </nav>
      <a
        href="#tickets"
        className="group relative overflow-hidden rounded-full border border-black/30 bg-black px-5 py-2 font-mono text-[11px] tracking-[0.28em] text-white transition-colors hover:border-[oklch(0.55_0.24_25)]"
      >
        <span className="relative z-10">REQUEST INVITE →</span>
        <span className="absolute inset-0 -translate-x-full bg-[oklch(0.4_0.22_25)] transition-transform duration-500 group-hover:translate-x-0" />
      </a>
    </header>
  );
}