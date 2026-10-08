import { billingPortalUrl } from "@/content/site";

// designjoy.co/billing: a short, permanent address for Stripe's billing
// portal, where clients sign in with a code sent to their email.
// Add ?email=you@company.com to fill in their email for them.
export function GET(request: Request) {
  const url = new URL(billingPortalUrl);
  const email = new URL(request.url).searchParams.get("email");
  if (email) url.searchParams.set("prefilled_email", email);
  return Response.redirect(url, 307);
}
