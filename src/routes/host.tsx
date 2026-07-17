import { createFileRoute } from "@tanstack/react-router";
import { ReservePage } from "@/components/experience/ReservePage";

export const Route = createFileRoute("/host")({
  head: () => ({
    meta: [
      { title: "Host Invitation — ILLUMINATI 3.0" },
      { name: "description", content: "Request a Host invitation to ILLUMINATI 3.0. Approval required." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <ReservePage passType="host" />,
});