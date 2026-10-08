// The ask box opens as a panel for questions, pricing or booking a call. Any
// part of the site can open it with `openAskBox`.
export type AskBoxView = "chat" | "pricing" | "booking";
export const OPEN_ASK_BOX_EVENT = "designjoy:open-ask-box";

export function openAskBox(view: AskBoxView) {
  window.dispatchEvent(new CustomEvent<AskBoxView>(OPEN_ASK_BOX_EVENT, { detail: view }));
}
