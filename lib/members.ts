import "server-only";
import type Stripe from "stripe";

// Where a subscriber's member number is kept, on their Stripe subscription.
const FIELD = "member_number";

// Numbering starts at № 1151 with the first subscription from October 17,
// 2026 (when it was introduced) and counts up from there.
const FIRST_NUMBER = 1151;
const COUNT_FROM = Math.floor(Date.UTC(2026, 9, 17) / 1000);

/**
 * A subscriber's member number: their place in line, from № 1151. Worked out
 * the first time their welcome page loads, then saved on the subscription so
 * it never changes. Null if Stripe can't say.
 */
export async function memberNumber(stripe: Stripe, subscriptionId: string): Promise<number | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const saved = Number(subscription.metadata?.[FIELD]);
    if (saved > 0) return saved;

    // The first number, plus everyone who subscribed since numbering began
    // and before them.
    const before = await stripe.subscriptions.search({
      query: `created>=${COUNT_FROM} AND created<${subscription.created}`,
      limit: 1,
      expand: ["total_count"],
    });
    const number = FIRST_NUMBER + (before.total_count ?? 0);

    await stripe.subscriptions.update(subscription.id, {
      metadata: { ...subscription.metadata, [FIELD]: String(number) },
    });
    return number;
  } catch {
    return null;
  }
}
