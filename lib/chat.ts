// The chatbot ends an answer with one or two tags when there's an obvious
// next step; the chat box hides the tags and shows them as buttons instead.
export const NEXT_STEPS = {
  "[plans]": { id: "plans", label: "Compare plans" },
  "[how-it-works]": { id: "how-it-works", label: "See how it works" },
  "[book-call]": { id: "book-call", label: "Book a 15 min intro call" },
  "[billing]": { id: "billing", label: "Manage billing →" },
} as const;

export type NextStep = (typeof NEXT_STEPS)[keyof typeof NEXT_STEPS]["id"];
export const BOOK_CALL_TAG = "[book-call]";
export const BILLING_TAG = "[billing]";
const TAGS = Object.keys(NEXT_STEPS) as (keyof typeof NEXT_STEPS)[];

export const NEXT_STEP_LABELS = Object.fromEntries(
  Object.values(NEXT_STEPS).map((s) => [s.id, s.label]),
) as Record<NextStep, string>;

/**
 * Strips the tags (and, mid-stream, any half-written start of one) from an
 * answer, and returns the next steps they ask for, in the order written.
 */
export function parseAnswer(raw: string): { text: string; steps: NextStep[] } {
  const steps = TAGS.filter((tag) => raw.includes(tag))
    .sort((a, b) => raw.indexOf(a) - raw.indexOf(b))
    .map((tag) => NEXT_STEPS[tag].id);
  let text = raw;
  for (const tag of TAGS) text = text.split(tag).join("");
  partial: for (const tag of TAGS) {
    for (let n = tag.length - 1; n > 0; n--) {
      if (text.endsWith(tag.slice(0, n))) {
        text = text.slice(0, -n);
        break partial;
      }
    }
  }
  return { text: text.trimEnd(), steps };
}
