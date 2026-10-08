"use client";

import { useMemo, useState } from "react";
import { loadStripe, type Appearance } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements,
} from "@stripe/react-stripe-js/checkout";
import type { Plan } from "@/content/site";
import { openAskBox } from "@/lib/ask-box";
import styles from "./CheckoutForm.module.css";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Helvetica Neue", Arial, sans-serif';

// Stripe's card fields, styled to match the inputs around them.
const appearance: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#ffffff",
    colorBackground: "#000000",
    colorText: "#ffffff",
    colorTextSecondary: "#b4b4b4",
    colorTextPlaceholder: "#5f5d5d",
    colorDanger: "#ff7a7a",
    colorIcon: "#7a7878",
    fontFamily: FONT,
    fontSizeBase: "14px",
    borderRadius: "12px",
    spacingUnit: "4px",
    gridRowSpacing: "14px",
  },
  rules: {
    ".Input": {
      backgroundColor: "#000000",
      border: "1px solid rgba(255, 255, 255, 0.14)",
      boxShadow: "none",
      padding: "13px 14px",
    },
    ".Input:focus": {
      border: "1px solid rgba(255, 255, 255, 0.4)",
      boxShadow: "none",
    },
    ".Input--invalid": { border: "1px solid #ff7a7a", boxShadow: "none" },
    ".Label": { fontSize: "12px", color: "#b4b4b4", marginBottom: "6px" },
    ".Tab": {
      backgroundColor: "#000000",
      border: "1px solid rgba(255, 255, 255, 0.14)",
      boxShadow: "none",
    },
    ".Tab--selected": {
      border: "1px solid rgba(255, 255, 255, 0.5)",
      boxShadow: "none",
    },
    ".Block": {
      backgroundColor: "#000000",
      border: "1px solid rgba(255, 255, 255, 0.14)",
      boxShadow: "none",
    },
  },
};

/** The payment form for a plan, or a "book a call" fallback if checkout can't load. */
export function CheckoutForm({
  plan,
  embedded = false,
}: {
  plan: Plan;
  embedded?: boolean;
}) {
  const [failed, setFailed] = useState(!stripePromise);

  // Starts the Stripe checkout for this plan; the form appears once it's ready.
  const clientSecret = useMemo(
    () =>
      fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
      })
        .then((res) =>
          res
            .json()
            .then((data: { clientSecret?: string }) => ({ ok: res.ok, data })),
        )
        .then(({ ok, data }) => {
          if (!ok || !data.clientSecret)
            throw new Error("Checkout unavailable");
          return data.clientSecret;
        })
        .catch(() => {
          // Show the "book a call" fallback instead; the form never loads.
          setFailed(true);
          return new Promise<string>(() => {});
        }),
    [plan.id],
  );

  const cardClass = embedded
    ? `${styles.card} ${styles.embedded}`
    : styles.card;
  if (failed || !stripePromise) return <Fallback className={cardClass} />;

  return (
    <CheckoutElementsProvider
      key={plan.id}
      stripe={stripePromise}
      options={{
        clientSecret,
        elementsOptions: { appearance, loader: "never" },
      }}
    >
      <PayForm plan={plan} className={cardClass} />
    </CheckoutElementsProvider>
  );
}

function Fallback({ className }: { className: string }) {
  return (
    <div className={className} role="alert">
      <p className={styles.note}>
        Checkout isn&apos;t available right now. Book a quick call and
        we&apos;ll get you set up.
      </p>
      <button
        type="button"
        className={styles.pay}
        onClick={() => openAskBox("booking")}
      >
        Book a 15 min intro call
      </button>
    </div>
  );
}

function PayForm({ plan, className }: { plan: Plan; className: string }) {
  const result = useCheckoutElements();
  const [email, setEmail] = useState("");
  const [trelloEmail, setTrelloEmail] = useState("");
  const [company, setCompany] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardReady, setCardReady] = useState(false);

  if (result.type === "error") return <Fallback className={className} />;
  const checkout = result.type === "success" ? result.checkout : null;

  async function pay(event: React.FormEvent) {
    event.preventDefault();
    if (!checkout || paying) return;
    setPaying(true);
    setError(null);

    const updated = await checkout.updateEmail(email.trim());
    if (updated.type === "error") {
      setError(updated.error.message);
      setPaying(false);
      return;
    }
    // Best effort: the payment shouldn't wait on these optional details.
    await fetch("/api/checkout/details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: checkout.id, trelloEmail, company }),
    }).catch(() => {});

    // On success Stripe takes the visitor to the welcome page.
    const confirmed = await checkout.confirm();
    if (confirmed.type === "error") {
      setError(confirmed.error.message);
      setPaying(false);
    }
  }

  return (
    <form
      className={className}
      onSubmit={pay}
      aria-busy={!checkout || !cardReady}
    >
      <h2 className={styles.label}>Your details</h2>
      <div className={styles.field}>
        <label htmlFor="checkout-email">Email</label>
        <input
          id="checkout-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="checkout-trello">
            Trello invite email <span>Optional</span>
          </label>
          <input
            id="checkout-trello"
            type="email"
            autoComplete="off"
            placeholder="If different"
            value={trelloEmail}
            onChange={(e) => setTrelloEmail(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="checkout-company">
            Company <span>Optional</span>
          </label>
          <input
            id="checkout-company"
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
      </div>

      <h2 className={`${styles.label} ${styles.section}`}>Payment</h2>
      <div className={styles.payment}>
        {!cardReady && <div className={styles.skeleton} aria-hidden="true" />}
        {checkout && (
          <PaymentElement
            options={{
              layout: "tabs",
              fields: { billingDetails: { name: "auto" } },
            }}
            onReady={() => setCardReady(true)}
          />
        )}
      </div>

      <button
        type="submit"
        className={styles.pay}
        disabled={!checkout || !cardReady || paying}
      >
        {paying ? "Processing…" : `Subscribe · ${plan.price}/mo`}
      </button>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <p className={styles.note}>
        Billed monthly. Pause or cancel anytime. Payments are secured by Stripe.
      </p>
    </form>
  );
}
