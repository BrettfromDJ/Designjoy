// The chatbot ends an answer with a tag when there's an obvious next step;
// the chat box hides the tag and shows a button instead.
export const BOOK_CALL_TAG = "[book-call]";
export const BILLING_TAG = "[billing]";
const TAGS = [BOOK_CALL_TAG, BILLING_TAG];

/** Strips the tags (and, mid-stream, any half-written start of one) from an answer. */
export function parseAnswer(raw: string): { text: string; bookCall: boolean; billing: boolean } {
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
  return { text: text.trimEnd(), bookCall: raw.includes(BOOK_CALL_TAG), billing: raw.includes(BILLING_TAG) };
}
