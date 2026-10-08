import type { Plan } from "@/content/site";

// The ask box opens as a panel for questions, pricing, booking a call or
// checkout. Any part of the site can open it with `openAskBox`.
export type AskBoxView = "chat" | "pricing" | "booking" | "checkout";
export type OpenAskBoxDetail = { view: AskBoxView; plan?: Plan["id"] };
export const OPEN_ASK_BOX_EVENT = "designjoy:open-ask-box";

export function openAskBox(view: AskBoxView, plan?: Plan["id"]) {
  window.dispatchEvent(new CustomEvent<OpenAskBoxDetail>(OPEN_ASK_BOX_EVENT, { detail: { view, plan } }));
}
