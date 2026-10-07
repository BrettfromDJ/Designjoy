// TODO: Stripe. Create a Checkout Session for the chosen plan and return its URL:
//
//   const session = await stripe.checkout.sessions.create({
//     mode: "subscription",
//     line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
//     success_url: `${origin}/?subscribed=1`,
//     cancel_url: `${origin}/`,
//   });
//   return Response.json({ url: session.url });
//
// Price IDs come from STRIPE_PRICE_MONTHLY_CLUB / STRIPE_PRICE_PRO (see .env.example).
export async function POST() {
  return Response.json({ error: "Checkout is not set up yet." }, { status: 501 });
}
