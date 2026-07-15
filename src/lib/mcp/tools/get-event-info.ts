import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_event_info",
  title: "Get event info",
  description:
    "Return public information about the ILLUMINATI 3.0 event: name, tagline, and a short description of the experience.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: "ILLUMINATI 3.0",
      tagline: "By Invitation.",
      description:
        "An exclusive cinematic gathering. Obsidian, chrome, blood. Awareness. Precision. Anticipation.",
      categories: ["Girls", "Boys", "Couples"],
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});

// zod imported to satisfy consistent tool authoring; unused schema is fine.
void z;