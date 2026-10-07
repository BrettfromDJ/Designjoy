// The chatbot ends an answer with this tag when booking an intro call is
// the right next step; the chat box hides it and shows a booking button.
export const BOOK_CALL_TAG = "[book-call]";

/** Strips the tag (and, mid-stream, any half-written start of it) from an answer. */
export function parseAnswer(raw: string): { text: string; bookCall: boolean } {
  const bookCall = raw.includes(BOOK_CALL_TAG);
  let text = raw.split(BOOK_CALL_TAG).join("");
  for (let n = BOOK_CALL_TAG.length - 1; n > 0; n--) {
    if (text.endsWith(BOOK_CALL_TAG.slice(0, n))) {
      text = text.slice(0, -n);
      break;
    }
  }
  return { text: text.trimEnd(), bookCall };
}
