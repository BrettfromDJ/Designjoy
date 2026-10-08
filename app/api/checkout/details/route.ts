import { getStripe } from "@/lib/stripe";

const clean = (value: unknown) => (typeof value === "string" ? value.trim().slice(0, 200) : "");

// Saves the optional Trello invite email and company name on the checkout,
// just before paying, so they show on the payment in Stripe.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const sessionId = clean(body.sessionId);
  const stripe = getStripe();
  if (!stripe || !sessionId.startsWith("cs_")) return Response.json({ ok: false }, { status: 400 });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.status !== "open") return Response.json({ ok: false }, { status: 409 });
    await stripe.checkout.sessions.update(sessionId, {
      metadata: {
        ...session.metadata,
        trello_email: clean(body.trelloEmail),
        company: clean(body.company),
      },
    });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Saving checkout details failed", error);
    return Response.json({ ok: false }, { status: 502 });
  }
}
