import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const PASSES = [
  {
    id: "standard",
    name: "STANDARD",
    tagline: "The complete night. Nothing missing.",
    pricing: [
      { category: "Single", price: "₹ 1,400" },
      { category: "Couple", price: "₹ 2,400" },
    ],
    perks: [
      "Entry to the main floor",
      "Full show & sound",
      "Bar & lounge access",
      "Welcome pour on arrival",
    ],
  },
  {
    id: "vip",
    name: "VIP",
    tagline: "Beyond the velvet rope.",
    pricing: [
      { category: "Single", price: "₹ 2,200" },
      { category: "Couple", price: "₹ 3,400" },
    ],
    perks: [
      "Priority entrance · no queue",
      "VIP lounge & elevated deck",
      "Reserved premium seating",
      "Closer stage & booth access",
    ],
  },
] as const;

export default defineTool({
  name: "list_pass_types",
  title: "List pass types",
  description:
    "List the public pass types for ILLUMINATI 3.0 (Standard and VIP) with pricing per category (Single, Couple) and included perks.",
  inputSchema: {
    id: z
      .enum(["standard", "vip"])
      .optional()
      .describe("Filter to a single pass id. Omit to return both."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id }) => {
    const passes = id ? PASSES.filter((p) => p.id === id) : PASSES;
    return {
      content: [{ type: "text", text: JSON.stringify(passes, null, 2) }],
      structuredContent: { passes },
    };
  },
});