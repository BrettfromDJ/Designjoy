"use client";

import { plans, type Plan } from "@/content/site";
import { CheckoutForm } from "./CheckoutForm";
import styles from "./CheckoutPanel.module.css";

/** Checkout inside the ask box: back to plans, the plan you're buying, and payment. */
export function CheckoutPanel({ planId, onBack }: { planId: Plan["id"]; onBack: () => void }) {
  const plan = plans.find((p) => p.id === planId) ?? plans[0];

  return (
    <div className={styles.panel}>
      <button type="button" className={styles.back} onClick={onBack}>
        <span aria-hidden="true">←</span> Plans
      </button>
      <div className={styles.summary}>
        <div className={styles.row}>
          <h2 className={styles.name}>
            {plan.name}
            {plan.tag && <span className={styles.tag}>{plan.tag}</span>}
          </h2>
          <p className={styles.price}>
            {plan.price}
            <span className={styles.muted}>/mo</span>
          </p>
        </div>
        <p className={styles.for}>{plan.description}</p>
      </div>
      <CheckoutForm key={plan.id} plan={plan} embedded />
    </div>
  );
}
