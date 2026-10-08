import type { Plan } from "@/content/site";
import { openAskBox } from "./ask-box";

/** Opens checkout for a plan, in the ask box. */
export async function startCheckout(planId: Plan["id"]) {
  openAskBox("checkout", planId);
}
