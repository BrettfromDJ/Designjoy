import Link from "next/link";
import { CheckoutForm } from "@/components/CheckoutForm";
import { CheckIcon } from "@/components/Icons";
import { plans } from "@/content/site";
import styles from "./page.module.css";

export const metadata = { title: "Checkout — Designjoy" };

export default async function Checkout({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan: planId } = await searchParams;
  const plan = plans.find((p) => p.id === planId) ?? plans[0];
  const other = plans.find((p) => p.id !== plan.id);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.label}>Checkout</p>
        <h1 className={styles.title}>
          Almost there. <span className={styles.muted}>Start today.</span>
        </h1>
        <p className={styles.sub}>Pause or cancel anytime.</p>
      </header>

      <section className={styles.card} aria-labelledby="plan-title">
        <div className={styles.planRow}>
          <h2 id="plan-title" className={styles.planName}>
            {plan.name}
            {plan.tag && <span className={styles.tag}>{plan.tag}</span>}
          </h2>
          <p className={styles.price}>
            {plan.price}
            <span className={styles.muted}>/mo</span>
          </p>
        </div>
        <p className={styles.sub}>{plan.description}</p>
        <ul className={styles.list}>
          {plan.features.map((feature) => (
            <li key={feature}>
              <CheckIcon />
              {feature}
            </li>
          ))}
        </ul>
        {other && (
          <Link href={`/checkout?plan=${other.id}`} className={styles.switch}>
            Switch to {other.name} <span aria-hidden="true">→</span>
          </Link>
        )}
      </section>

      <CheckoutForm planId={plan.id} />
    </main>
  );
}
