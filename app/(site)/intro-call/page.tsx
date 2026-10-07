import { CalInline } from "@/components/CalInline";
import styles from "./page.module.css";

export const metadata = { title: "Intro call — Designjoy" };

export default function IntroCall() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          Book a 15 min intro call.
          <br />
          <span className={styles.muted}>See if Designjoy is a fit.</span>
        </h1>
      </header>
      <CalInline className={styles.calendar} />
    </main>
  );
}
