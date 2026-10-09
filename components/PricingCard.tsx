"use client";

import { useState, type CSSProperties } from "react";
import { clientLogos, plans, type Plan } from "@/content/site";
import { openAskBox } from "@/lib/ask-box";
import { startCheckout } from "@/lib/checkout";
import { CheckIcon } from "./Icons";
import { LogoMarquee } from "./LogoMarquee";
import styles from "./PricingCard.module.css";

export function PricingCard() {
  const [planId, setPlanId] = useState<Plan["id"]>(plans[0].id);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  // The checklist only cascades in after a switch, not on first load.
  const [switched, setSwitched] = useState(false);
  const plan = plans.find((p) => p.id === planId) ?? plans[0];

  async function subscribe() {
    setStatus("loading");
    try {
      await startCheckout(plan.id);
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className={styles.card} aria-labelledby="pricing-title">
      <h2 id="pricing-title" className={styles.title}>
        <span className={styles.line}>One subscription.</span>
        <br />
        <span className={`${styles.line} ${styles.muted}`}>Endless possibilities.</span>
      </h2>
      <p className={styles.subtitle}>Pause or cancel anytime.</p>

      <fieldset className={styles.plans}>
        <legend className="visually-hidden">Choose a plan</legend>
        {plans.map((p) => (
          <label
            key={p.id}
            className={styles.plan}
            data-selected={p.id === planId}
          >
            <input
              type="radio"
              name="plan"
              value={p.id}
              checked={p.id === planId}
              onChange={() => {
                setPlanId(p.id);
                setStatus("idle");
                setSwitched(true);
              }}
              className={styles.radio}
            />
            <span className={styles.planMain}>
              <span className={styles.planName}>
                {p.name}
                {p.tag && (
                  <span
                    className={
                      p.highlight
                        ? `${styles.tag} ${styles.tagGlow}`
                        : styles.tag
                    }
                  >
                    {p.tag}
                  </span>
                )}
              </span>
              <span className={styles.price}>
                {p.price}
                <span className={styles.muted}>/mo</span>
              </span>
            </span>
            <span className={styles.planDescription}>{p.description}</span>
          </label>
        ))}
      </fieldset>

      <p className={styles.includedLabel}>Included in {plan.name}</p>
      <ul key={plan.id} className={styles.features} data-cascade={switched || undefined}>
        {plan.features.map((feature, i) => (
          <li key={feature} style={{ "--i": i } as CSSProperties}>
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
        <button
          type="button"
          className={styles.secondary}
          onClick={() => openAskBox("booking")}
        >
          Book a 15 min intro call
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        </button>
        {status === "error" && (
          <p className={styles.error} role="alert">
            Checkout isn&apos;t available yet. Please book an intro call
            instead.
          </p>
        )}
      </div>

      {clientLogos.length > 0 && (
        <div className={styles.trusted}>
          <p className={styles.includedLabel}>Trusted by teams at</p>
          <LogoMarquee
            logos={clientLogos}
            label="Companies we've worked with"
          />
        </div>
      )}

      <p className={styles.availability}>
        <span className={styles.liveDot} aria-hidden="true" />
        Spots available · Start today
      </p>
    </section>
  );
}
