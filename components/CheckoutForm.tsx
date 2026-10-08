"use client";

import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import type { Plan } from "@/content/site";
import { calTrigger } from "@/lib/cal";
import styles from "./CheckoutForm.module.css";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

/** Stripe's embedded payment form for a plan, or a fallback if it can't load. */
export function CheckoutForm({ planId }: { planId: Plan["id"] }) {
  const [failed, setFailed] = useState(!stripePromise);

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId }),
    });
    const data = (await res.json().catch(() => ({}))) as { clientSecret?: string };
    if (!res.ok || !data.clientSecret) {
      setFailed(true);
      throw new Error("Checkout unavailable");
    }
    return data.clientSecret;
  }, [planId]);

  if (failed || !stripePromise) {
    return (
      <div className={styles.fallback} role="alert">
        <p>Checkout isn&apos;t available right now. Book a quick call and we&apos;ll get you set up.</p>
        <button type="button" className={styles.button} {...calTrigger}>
          Book a 15 min intro call
        </button>
      </div>
    );
  }

  return (
    <div className={styles.form}>
      <p className={styles.loading} aria-hidden="true">
        Loading secure checkout…
      </p>
      <EmbeddedCheckoutProvider key={planId} stripe={stripePromise} options={{ fetchClientSecret }}>
        <EmbeddedCheckout className={styles.embed} />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
