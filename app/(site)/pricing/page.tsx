import { PlanPicker } from "@/components/PlanPicker";
import { TestimonialCard } from "@/components/TestimonialCard";
import { scopeOfWork } from "@/content/site";
import styles from "./page.module.css";

export const metadata = { title: "Pricing — Designjoy" };

export default function Pricing() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.label}>Pricing</p>
        <h1 className={styles.title}>
          One subscription, <span className={styles.muted}>endless possibilities.</span>
        </h1>
        <p className={styles.sub}>Pause or cancel anytime.</p>
      </header>

      <div className={styles.layout}>
        <PlanPicker />
        <div className={styles.side}>
          <TestimonialCard height={250} />
          <section className={styles.included} aria-labelledby="included-title">
            <h2 id="included-title" className={styles.label}>
              Included in every plan
            </h2>
            <ul className={styles.pills}>
              {scopeOfWork.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
