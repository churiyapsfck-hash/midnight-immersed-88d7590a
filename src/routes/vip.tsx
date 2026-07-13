import { createFileRoute } from "@tanstack/react-router";
import { ReservePage } from "@/components/experience/ReservePage";

export const Route = createFileRoute("/vip")({
  head: () => ({
    meta: [
      { title: "Reserve · VIP — ILLUMINATI 3.0" },
      { name: "description", content: "Reserve your VIP pass to ILLUMINATI 3.0." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <ReservePage passType="vip" />,
});