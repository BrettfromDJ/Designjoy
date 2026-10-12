import { openAskBox } from "./ask-box";

// Anywhere on the site can open the "How it works" board tour, which plays
// inside the ask box.
export function openHowItWorks() {
  openAskBox("tour");
}
