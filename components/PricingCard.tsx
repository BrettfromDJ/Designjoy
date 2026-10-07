"use client";

import { useState } from "react";
import { plans, type Plan } from "@/content/site";
import { calTrigger } from "@/lib/cal";
import { CheckIcon } from "./Icons";
import styles from "./PricingCard.module.css";

export function PricingCard() {
  const [planId, setPlanId] = useState<Plan["id"]>(plans[0].id);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const plan = plans.find((p) => p.id === planId) ?? plans[0];

  async function subscribe() {
    setStatus("loading");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
      });
      const data = (await res.json()) as { url?: string };
      if (!res.ok || !data.url) throw new Error();
      window.location.href = data.url;
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className={styles.card} aria-labelledby="pricing-title">
      <h2 id="pricing-title" className={styles.title}>
        One subscription.
        <br />
        <span className={styles.muted}>Endless possibilities.</span>
      </h2>
      <p className={styles.subtitle}>Pause or cancel anytime.</p>

      <fieldset className={styles.plans}>
        <legend className="visually-hidden">Choose a plan</legend>
        {plans.map((p) => (
          <label key={p.id} className={styles.plan} data-selected={p.id === planId}>
            <input
              type="radio"
              name="plan"
              value={p.id}
              checked={p.id === planId}
              onChange={() => {
                setPlanId(p.id);
                setStatus("idle");
              }}
              className={styles.radio}
            />
            <span className={styles.planText}>
              <span className={styles.planName}>{p.name}</span>
              <span className={styles.planDescription}>{p.description}</span>
            </span>
            <span className={styles.price}>
              {p.price}
              <span className={styles.muted}>/mo</span>
            </span>
          </label>
        ))}
      </fieldset>

      <p className={styles.includedLabel}>Included in {plan.name}</p>
      <ul className={styles.features}>
        {plan.features.map((feature) => (
          <li key={feature}>
            <CheckIcon />
            {feature}
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          onClick={subscribe}
          disabled={status === "loading"}
        >
          {status === "loading" ? "One moment…" : "Subscribe now"}
        </button>
        <button type="button" className={styles.secondary} {...calTrigger}>
          Book a 15 min intro call
        </button>
        {status === "error" && (
          <p className={styles.error} role="alert">
            Checkout isn&apos;t available yet. Please book an intro call instead.
          </p>
        )}
      </div>
    </section>
  );
}
