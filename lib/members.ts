import "server-only";
import type Stripe from "stripe";

// Where a subscriber's member number is kept, on their Stripe subscription.
const FIELD = "member_number";

// Added to every number, e.g. to count members from before Stripe. Set
// MEMBER_NUMBER_OFFSET in Vercel; 0 means the first subscriber is № 0001.
const offset = () => Math.max(0, Number(process.env.MEMBER_NUMBER_OFFSET) || 0);

/**
 * A subscriber's member number: their place in line among every subscription
 * ever started. Worked out the first time their welcome page loads, then
 * saved on the subscription so it never changes. Null if Stripe can't say.
 */
export async function memberNumber(stripe: Stripe, subscriptionId: string): Promise<number | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const saved = Number(subscription.metadata?.[FIELD]);
    if (saved > 0) return saved;

    // Everyone who subscribed before them, plus one.
    const before = await stripe.subscriptions.search({
      query: `created<${subscription.created}`,
      limit: 1,
      expand: ["total_count"],
    });
    const number = (before.total_count ?? 0) + 1 + offset();

    await stripe.subscriptions.update(subscription.id, {
      metadata: { ...subscription.metadata, [FIELD]: String(number) },
    });
    return number;
  } catch {
    return null;
  }
}
