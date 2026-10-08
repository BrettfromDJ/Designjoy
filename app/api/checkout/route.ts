import { plans, type Plan } from "@/content/site";
import { getStripe, priceFor } from "@/lib/stripe";

// Starts an embedded Stripe Checkout for a plan. The /checkout page shows the
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
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ui_mode: "embedded_page",
      line_items: [{ price, quantity: 1 }],
      return_url: `${origin}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      metadata: { plan: plan.id },
      subscription_data: { metadata: { plan: plan.id } },
      // Shown on the payment in Stripe, so you know where to send the invites.
      custom_fields: [
        {
          key: "trelloemail",
          label: { type: "custom", custom: "Email for your Trello invite (if different)" },
          type: "text",
          optional: true,
        },
        {
          key: "company",
          label: { type: "custom", custom: "Company name" },
          type: "text",
          optional: true,
        },
      ],
      // Match the site: dark card, white pill buttons, Inter (closest to SF Pro).
      branding_settings: {
        display_name: "Designjoy",
        background_color: "#0a0a0a",
        button_color: "#ffffff",
        border_style: "pill",
        font_family: "inter",
      },
      allow_promotion_codes: true,
    });
    return Response.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Stripe checkout failed", error);
    return Response.json({ error: "Checkout failed to start." }, { status: 502 });
  }
}
