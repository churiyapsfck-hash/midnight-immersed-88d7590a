import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/experience/Nav";
import { Hero } from "@/components/experience/Hero";
import { Tickets } from "@/components/experience/Tickets";
import { Gallery } from "@/components/experience/Gallery";
import { Timeline } from "@/components/experience/Timeline";
import { Faq } from "@/components/experience/Faq";
import { Ending } from "@/components/experience/Ending";
import { CustomCursor } from "@/components/experience/CustomCursor";
import { SmoothScroll } from "@/components/experience/SmoothScroll";
import { ClientOnly } from "@/components/experience/ClientOnly";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <ClientOnly>
        <SmoothScroll />
        <CustomCursor />
      </ClientOnly>
      <Nav />
      <Hero />
      <Tickets />
      <Gallery />
      <Timeline />
      <Faq />
      <Ending />
    </main>
  );
}
