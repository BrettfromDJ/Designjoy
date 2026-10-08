import type { Plan } from "@/content/site";

/** Takes the visitor to the checkout page for a plan. */
export async function startCheckout(planId: Plan["id"]) {
  window.location.href = `/checkout?plan=${planId}`;
}
