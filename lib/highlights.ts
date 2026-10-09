import { blobConfigured, readLatest, writeLatest } from "./store";
import type { Highlight } from "./highlight-icons";

const PREFIX = "data/highlights";

/** Highlights saved in /admin/highlights, in order. Empty until some are added. */
export async function getHighlights(): Promise<Highlight[]> {
  if (!blobConfigured()) return [];
  try {
    const json = await readLatest(PREFIX);
    return json ? (JSON.parse(json) as Highlight[]) : [];
  } catch (error) {
    console.error("Could not load highlights", error);
    return [];
  }
}

export async function saveHighlights(highlights: Highlight[]) {
  await writeLatest(PREFIX, "json", JSON.stringify(highlights), "application/json");
}
