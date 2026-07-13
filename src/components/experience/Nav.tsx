export function Nav() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-6 py-5 md:px-12">
      <a href="#top" className="flex items-center gap-3">
        <span className="inline-block h-2 w-2 rounded-full bg-[oklch(0.55_0.24_25)] shadow-[0_0_16px_oklch(0.55_0.24_25)] animate-breathe" />
        <span className="font-mono text-xs tracking-[0.32em] text-white/80">OBSIDIAN</span>
      </a>
      <nav className="hidden gap-8 font-mono text-[11px] tracking-[0.28em] text-white/60 md:flex">
        <a href="#tickets" className="transition-colors hover:text-white">01 — TICKETS</a>
        <a href="#gallery" className="transition-colors hover:text-white">02 — VAULT</a>
        <a href="#timeline" className="transition-colors hover:text-white">03 — TIMELINE</a>
        <a href="#faq" className="transition-colors hover:text-white">04 — DECODE</a>
      </nav>
      <a
        href="#tickets"
        className="group relative overflow-hidden rounded-full border border-white/20 bg-white/[0.03] px-5 py-2 font-mono text-[11px] tracking-[0.28em] text-white/90 backdrop-blur transition-colors hover:border-[oklch(0.55_0.24_25)] hover:text-white"
      >
        <span className="relative z-10">ENTER →</span>
        <span className="absolute inset-0 -translate-x-full bg-[oklch(0.4_0.22_25)] transition-transform duration-500 group-hover:translate-x-0" />
      </a>
    </header>
  );
}