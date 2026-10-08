"use client";

import { useEffect, useRef, useState } from "react";
import { plans } from "@/content/site";
import { calTrigger } from "@/lib/cal";
import { startCheckout } from "@/lib/checkout";
import { CheckIcon } from "./Icons";
import styles from "./PlanPicker.module.css";

const amount = (price: string) => Number(price.replace(/[^0-9]/g, ""));
const format = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** Counts the displayed price up or down to `target`. */
function useRollingPrice(target: number) {
  const [shown, setShown] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const start = from.current;
    if (
      start === target ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      from.current = target;
      setShown(target);
      return;
    }
    let frame = 0;
    const began = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - began) / 450, 1);
      const value = start + (target - start) * (1 - Math.pow(1 - t, 3));
      from.current = value;
      setShown(value);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return shown;
}

/** The pricing page's main card: a plan toggle, price, features and actions. */
export function PlanPicker() {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const plan = plans[index];
  const price = useRollingPrice(amount(plan.price));

  async function subscribe() {
    setStatus("loading");
    try {
      await startCheckout(plan.id);
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className={styles.card} aria-label="Choose a plan">
      <div
        className={styles.toggle}
        role="group"
        aria-label="Plan"
        data-pick={index}
      >
        <i aria-hidden="true" />
        {plans.map((p, n) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={n === index}
            className={p.highlight ? styles.highlight : undefined}
            onClick={() => {
              setIndex(n);
              setStatus("idle");
            }}
          >
            {p.name}
            {p.tag && <span className={styles.tag}>{p.tag}</span>}
          </button>
        ))}
      </div>

      <p className={styles.price} aria-live="polite">
        <span className="visually-hidden">{plan.price} per month</span>
        <span aria-hidden="true">
          {format(price)}
          <span className={styles.muted}>/mo</span>
        </span>
      </p>
      <p key={`for-${plan.id}`} className={styles.perfectFor}>
        {plan.description}
      </p>

      <p className={styles.label}>What&apos;s included</p>
      <ul key={plan.id} className={styles.features}>
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
          {status === "loading" ? "One moment…" : `Subscribe to ${plan.name}`}
        </button>
        <button type="button" className={styles.secondary} {...calTrigger}>
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
    </section>
  );
}
