import type { Plan } from "@/content/site";

/** Sends the visitor to Stripe checkout for a plan. Throws if checkout isn't available. */
export async function startCheckout(planId: Plan["id"]) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan: planId }),
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string };
  if (!res.ok || !data.url) throw new Error("Checkout unavailable");
  window.location.href = data.url;
}
