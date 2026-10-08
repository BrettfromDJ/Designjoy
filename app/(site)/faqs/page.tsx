import { FaqChat } from "@/components/FaqChat";
import styles from "./page.module.css";

export const metadata = { title: "FAQs — Designjoy" };

export default function Faqs() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.label}>FAQ</p>
        <h1 className={styles.title}>
          Questions, <span className={styles.muted}>answered.</span>
        </h1>
        <p className={styles.sub}>Can&apos;t find yours? Ask it below, or book a 15 min intro call.</p>
      </header>
      <FaqChat />
    </main>
  );
}
