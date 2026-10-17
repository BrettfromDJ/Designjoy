import { faqs as defaultFaqs, type Faq } from "@/content/site";
import { blobConfigured, readLatest, writeLatest } from "./store";

const PREFIX = "data/faqs";
export { MAX_FAQS } from "./faqs-limits";

/**
 * The FAQs, in order: as saved in /admin/faqs, or the ones written in
 * content/site.ts until they've been edited there.
 */
export async function getFaqs(): Promise<{ faqs: Faq[]; source: "saved" | "default" }> {
  if (blobConfigured()) {
    try {
      const json = await readLatest(PREFIX);
      if (json) return { faqs: JSON.parse(json) as Faq[], source: "saved" };
    } catch (error) {
      console.error("Could not load saved FAQs", error);
    }
  }
  return { faqs: defaultFaqs, source: "default" };
}

export async function saveFaqs(faqs: Faq[]) {
  await writeLatest(PREFIX, "json", JSON.stringify(faqs), "application/json");
  cached = null;
}

// The chat and question-log routes reuse the FAQs for a minute rather than
// reading storage on every message.
let cached: { faqs: Faq[]; at: number } | null = null;
const TTL = 60_000;

export async function getFaqsCached() {
  if (cached && Date.now() - cached.at < TTL) return cached.faqs;
  const { faqs } = await getFaqs();
  cached = { faqs, at: Date.now() };
  return faqs;
}
