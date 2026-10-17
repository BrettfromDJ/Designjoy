import { redirect } from "next/navigation";
import { Welcome, type WelcomeStep } from "@/components/welcome/Welcome";
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

  const steps: WelcomeStep[] = [
    {
      title: "Payment confirmed",
      body: email ? `Your receipt is on its way to ${email}.` : "Your receipt is on its way to your inbox.",
      done: true,
    },
    {
      title: "Trello invite",
      body: `We'll invite ${inviteTo ?? "you"} to your board ${trelloInviteEta}.`,
    },
    ...(plan?.id === "design-partner"
      ? [{ title: "Slack invite", body: "We'll add you to a shared Slack channel for day-to-day updates." }]
      : []),
    {
      title: "Fill your Backlog",
      body: "Add as many requests as you like, then move one into Current request. Briefs can be as detailed or as loose as you like.",
    },
    {
      title: "First delivery",
      body: "Most requests are delivered in about 48 hours, revisions in about 24.",
    },
  ];

  return (
    <Welcome
      planId={plan?.id}
      planName={plan?.name}
      email={email}
      inviteTo={inviteTo}
      eta={trelloInviteEta}
      steps={steps}
    />
  );
}
