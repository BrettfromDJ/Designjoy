// Anywhere on the site can open the "How it works" board tour.
export const OPEN_HOW_IT_WORKS_EVENT = "designjoy:how-it-works";

export function openHowItWorks() {
  window.dispatchEvent(new CustomEvent(OPEN_HOW_IT_WORKS_EVENT));
}
