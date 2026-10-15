"use client";

import { useState, type CSSProperties } from "react";
import { plans, type Plan } from "@/content/site";
import { openAskBox } from "@/lib/ask-box";
import { startCheckout } from "@/lib/checkout";
import { CheckIcon, PlusIcon } from "./Icons";
import styles from "./PlanPicker.module.css";

/** Both plans as rows; the chosen one opens to show its line and checklist.
 *  `embedded` drops the card chrome, for showing it inside the ask box panel. */
export function PlanPicker({ embedded = false }: { embedded?: boolean }) {
  const [planId, setPlanId] = useState<Plan["id"]>(plans[0].id);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  // The checklist only cascades in after a switch, not on first open.
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
    <section
      className={embedded ? `${styles.card} ${styles.embedded}` : styles.card}
      aria-label="Choose a plan"
    >
      <fieldset className={styles.plans}>
        <legend className="visually-hidden">Choose a plan</legend>
        {plans.map((p) => {
          const selected = p.id === planId;
          return (
            <label key={p.id} className={styles.plan} data-selected={selected}>
              <span className={styles.head}>
                <input
                  type="radio"
                  name="plan-picker"
                  value={p.id}
                  checked={selected}
                  onChange={() => {
                    setPlanId(p.id);
                    setStatus("idle");
                    setSwitched(true);
                  }}
                  className={styles.radio}
                />
                <span className={styles.name}>
                  {p.name}
                  {p.tag && (
                    <span className={p.highlight ? `${styles.tag} ${styles.tagGlow}` : styles.tag}>
                      {p.tag}
                    </span>
                  )}
                </span>
                <span className={styles.price}>
                  {p.price}
                  <span className={styles.muted}>/mo</span>
                </span>
              </span>
              {selected && (
                <span className={styles.body}>
                  <span className={styles.description}>{p.description}</span>
                  <span
                    role="list"
                    aria-label={`Included in ${p.name}`}
                    className={styles.features}
                    data-cascade={switched || undefined}
                  >
                    {p.features.map((feature, i) => (
                      <span role="listitem" key={feature} style={{ "--i": i } as CSSProperties}>
                        {p.additions && i > 0 ? <PlusIcon /> : <CheckIcon />}
                        {feature}
                      </span>
                    ))}
                  </span>
                </span>
              )}
            </label>
          );
        })}
      </fieldset>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          onClick={subscribe}
          disabled={status === "loading"}
        >
          {status === "loading" ? "One moment…" : `Subscribe to ${plan.name}`}
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
    </section>
  );
}
