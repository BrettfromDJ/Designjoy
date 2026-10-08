import { plans, type Plan } from "@/content/site";
import { getStripe, priceFor } from "@/lib/stripe";

// Starts a Stripe Checkout Session for a plan. The /checkout page shows the
// form; after paying, Stripe sends the visitor to /welcome.
export async function POST(request: Request) {
  const { plan: planId } = (await request.json().catch(() => ({}))) as { plan?: string };
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return Response.json({ error: "Unknown plan." }, { status: 400 });

  const stripe = getStripe();
  if (!stripe) return Response.json({ error: "Checkout is not set up yet." }, { status: 501 });

  try {
    const price = await priceFor(stripe, plan.id as Plan["id"]);
    if (!price) return Response.json({ error: "Checkout is not set up yet." }, { status: 501 });

    const origin = new URL(request.url).origin;
    // "elements" mode: Stripe only supplies the payment fields, and the rest
    // of the form is ours, so it can match the site.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ui_mode: "elements",
      line_items: [{ price, quantity: 1 }],
      // Cards, plus Apple Pay and Google Pay where the device supports them.
      allowed_payment_method_types: ["card"],
      return_url: `${origin}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      metadata: { plan: plan.id },
      subscription_data: { metadata: { plan: plan.id } },
    });
    return Response.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Stripe checkout failed", error);
    return Response.json({ error: "Checkout failed to start." }, { status: 502 });
  }
}
