import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/experience/Nav";
import { Hero } from "@/components/experience/Hero";
import { Tickets } from "@/components/experience/Tickets";
import { Gallery } from "@/components/experience/Gallery";
import { Timeline } from "@/components/experience/Timeline";
import { Faq } from "@/components/experience/Faq";
import { Ending } from "@/components/experience/Ending";
import { SmoothScroll } from "@/components/experience/SmoothScroll";
import { OpeningSequence } from "@/components/experience/OpeningSequence";
import { ClientOnly } from "@/components/experience/ClientOnly";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <ClientOnly>
        <SmoothScroll />
        <OpeningSequence />
      </ClientOnly>
      <Nav />
      <Hero />
      <Tickets />
      <Gallery />
      <Timeline />
      <Faq />
      <Ending />
      <footer className="w-full border-t border-black/10 bg-white py-6 text-center">
        <a
          href="https://likith.online"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] tracking-[0.4em] text-black/50 transition-colors hover:text-[oklch(0.55_0.24_25)]"
        >
          DESIGNED BY LIKITH
        </a>
      </footer>
    </main>
  );
}
