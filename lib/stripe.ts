import "server-only";
import Stripe from "stripe";
import type { Plan } from "@/content/site";

let client: Stripe | null = null;

/** The Stripe client, or null until STRIPE_SECRET_KEY is set. */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  client ??= new Stripe(key);
  return client;
}

const PRICE_ENV: Record<Plan["id"], string> = {
  "monthly-club": "STRIPE_PRICE_MONTHLY_CLUB",
  "design-partner": "STRIPE_PRICE_DESIGN_PARTNER",
};

/**
 * The Stripe price to charge for a plan. The env var can hold a price ID
 * (price_…) or a product ID (prod_…), in which case its default price is used.
 */
export async function priceFor(stripe: Stripe, plan: Plan["id"]) {
  const id = process.env[PRICE_ENV[plan]]?.trim();
  if (!id) return null;
  if (!id.startsWith("prod_")) return id;
  const product = await stripe.products.retrieve(id);
  const price = product.default_price;
  return typeof price === "string" ? price : (price?.id ?? null);
}
