import { createFileRoute } from "@tanstack/react-router";
import { ReservePage } from "@/components/experience/ReservePage";

export const Route = createFileRoute("/standard")({
  head: () => ({
    meta: [
      { title: "Reserve · Standard — ILLUMINATI 3.0" },
      { name: "description", content: "Reserve your Standard pass to ILLUMINATI 3.0." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <ReservePage passType="standard" />,
});