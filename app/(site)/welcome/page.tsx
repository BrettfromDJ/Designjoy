import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckIcon } from "@/components/Icons";
import { billingPortalUrl, plans, trelloInviteEta } from "@/content/site";
import { getStripe } from "@/lib/stripe";
import styles from "./page.module.css";

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

export default async function Welcome({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const details = await checkoutDetails(session_id);
  // Not paid yet (e.g. the page was opened early): back to the form.
  if (details?.status === "open") redirect(`/checkout?plan=${details.planId ?? ""}`);
  const plan = plans.find((p) => p.id === details?.planId);
  const inviteTo = details?.trelloEmail ?? details?.email;

  const steps = [
    {
      title: "Payment confirmed",
      body: details?.email ? `Your receipt is on its way to ${details.email}.` : "Your receipt is on its way to your inbox.",
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
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.label}>Welcome to Designjoy</p>
        <h1 className={styles.title}>
          You&apos;re in. <span className={styles.muted}>Let&apos;s make something great.</span>
        </h1>
        <p className={styles.sub}>
          {plan ? `Your ${plan.name} subscription is active.` : "Your subscription is active."} Here&apos;s what
          happens next.
        </p>
      </header>

      <section className={styles.card} aria-labelledby="next-title">
        <h2 id="next-title" className={styles.label}>
          What happens next
        </h2>
        <ol className={styles.steps}>
          {steps.map((step, i) => (
            <li key={step.title} data-done={step.done ?? false}>
              <span className={styles.marker} aria-hidden="true">
                {step.done ? <CheckIcon /> : String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className={styles.stepTitle}>{step.title}</p>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.card} aria-label="Billing and help">
        <a href={billingPortalUrl} className={styles.link} target="_blank" rel="noopener noreferrer">
          Manage billing <span aria-hidden="true">→</span>
        </a>
        <p className={styles.stepBody}>Update your card, download invoices, or cancel anytime.</p>
        <Link href="/faqs" className={styles.link}>
          Questions? See the FAQs <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
