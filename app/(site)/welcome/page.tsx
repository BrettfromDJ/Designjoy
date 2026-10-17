import { redirect } from "next/navigation";
import { Welcome } from "@/components/welcome/Welcome";
import { plans, trelloInviteEta } from "@/content/site";
import { getStripe } from "@/lib/stripe";

export const metadata = { title: "Welcome — Designjoy" };

type Details = { status: "complete" | "open"; planId?: string; email?: string; trelloEmail?: string };

/** Looks up the checkout so the page can name the plan and emails. */
async function checkoutDetails(sessionId?: string): Promise<Details | null> {
  const stripe = getStripe();
  if (!stripe || !sessionId) return null;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const status = session.status === "complete" ? "complete" : session.status === "open" ? "open" : null;
    if (!status) return null;
    return {
      status,
      planId: session.metadata?.plan,
      email: session.customer_details?.email ?? undefined,
      trelloEmail: session.metadata?.trello_email?.trim() || undefined,
    };
  } catch {
    return null;
  }
}

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; plan?: string; email?: string }>;
}) {
  const { session_id, plan: previewPlan, email: previewEmail } = await searchParams;
  const details = await checkoutDetails(session_id);
  // Not paid yet (e.g. the page was opened early): back to the form.
  if (details?.status === "open") redirect(`/checkout?plan=${details.planId ?? ""}`);
  // Without a checkout, ?plan= and ?email= fill in the page for previewing it.
  const planId = details ? details.planId : previewPlan;
  const email = details ? details.email : previewEmail;
  const plan = plans.find((p) => p.id === planId);
  const inviteTo = details?.trelloEmail ?? email;

  return (
    <>
      {/* Puts the nav at the top and the ask box at the bottom on this page,
          set before it first paints so neither jumps into place. */}
      <script dangerouslySetInnerHTML={{ __html: 'document.body.dataset.navTop=""' }} />
      <Welcome
      planId={plan?.id}
      planName={plan?.name}
      email={email}
      inviteTo={inviteTo}
      eta={trelloInviteEta}
      />
    </>
  );
}
