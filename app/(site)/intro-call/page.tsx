import { CalInline } from "@/components/CalInline";
import { CheckIcon } from "@/components/Icons";
import { TestimonialCard } from "@/components/TestimonialCard";
import { CAL_LINK } from "@/lib/cal";
import styles from "./page.module.css";

export const metadata = { title: "Book a call — Designjoy" };

const expectations = [
  "15 minutes, no commitment",
  "A walkthrough of how the subscription works",
  "Answers on pricing, scope and turnaround",
  "Whether Monthly Club or Design Partner fits your work",
];

export default function IntroCall() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.label}>Book a call</p>
        <h1 className={styles.title}>
          Book a 15 min intro call, <span className={styles.muted}>see if it&apos;s a fit.</span>
        </h1>
        <p className={styles.sub}>Pick a time that works for you.</p>
      </header>

      <div className={styles.layout}>
        <section className={styles.calendarCard} aria-label="Pick a time">
          {/* Sits behind the calendar until it loads, in case it's slow or blocked. */}
          <p className={styles.fallback}>
            Loading the calendar…
            <a href={`https://cal.com/${CAL_LINK}`} target="_blank" rel="noopener noreferrer">
              Open it on Cal.com
            </a>
          </p>
          <CalInline className={styles.calendar} />
        </section>

        <div className={styles.side}>
          <section className={styles.card} aria-labelledby="expect-title">
            <h2 id="expect-title" className={styles.label}>
              What to expect
            </h2>
            <ul className={styles.list}>
              {expectations.map((item) => (
                <li key={item}>
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <TestimonialCard height={250} />
        </div>
      </div>
    </main>
  );
}
