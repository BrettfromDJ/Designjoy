import type { FixedCard } from "@/content/site";
import styles from "./InfoCard.module.css";

type InfoCardData = Extract<FixedCard, { kind: "info" }>;

export function InfoCard({ card }: { card: InfoCardData }) {
  return (
    <section className={styles.card} style={{ aspectRatio: `340 / ${card.minHeight}` }}>
      {card.eyebrow && <p className={styles.eyebrow}>{card.eyebrow}</p>}
      {card.title && <h2 className={styles.title}>{card.title}</h2>}
      {card.body && <p className={styles.body}>{card.body}</p>}
    </section>
  );
}
