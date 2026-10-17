import type { Plan } from "@/content/site";

// The ask box opens as a panel for questions, pricing, booking a call,
// checkout or the How it works tour. Any part of the site can open it with `openAskBox`.
export type AskBoxView = "chat" | "pricing" | "booking" | "checkout" | "tour";
export type OpenAskBoxDetail = {
  view: AskBoxView;
  plan?: Plan["id"];
  question?: string;
  /** For booking: a day (YYYY-MM-DD) or an open time to start on. */
  pick?: string;
};
export const OPEN_ASK_BOX_EVENT = "designjoy:open-ask-box";

export function openAskBox(view: AskBoxView, plan?: Plan["id"]) {
  window.dispatchEvent(new CustomEvent<OpenAskBoxDetail>(OPEN_ASK_BOX_EVENT, { detail: { view, plan } }));
}

/** Opens the ask box and asks `question` in it, e.g. from the homepage hero. */
export function askQuestion(question: string) {
  window.dispatchEvent(
    new CustomEvent<OpenAskBoxDetail>(OPEN_ASK_BOX_EVENT, { detail: { view: "chat", question } }),
  );
}

/** Opens booking a call, starting on `pick` (a day or an open time) if given. */
export function bookCall(pick?: string) {
  window.dispatchEvent(
    new CustomEvent<OpenAskBoxDetail>(OPEN_ASK_BOX_EVENT, { detail: { view: "booking", pick } }),
  );
}
