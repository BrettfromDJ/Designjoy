import Link from "next/link";
import styles from "./Switcher.module.css";

// The five art directions for the Story layout, stepped through in order.
export const PROTOTYPES = [
  { slug: "vault", name: "Vault" },
  { slug: "editorial", name: "Editorial" },
  { slug: "kinetic", name: "Kinetic" },
  { slug: "desk", name: "Desk" },
  { slug: "aurora", name: "Aurora" },
];

/** A pill in the corner for stepping between the layout prototypes. */
export function Switcher({ current }: { current: string }) {
  const i = PROTOTYPES.findIndex((p) => p.slug === current);
  // The earlier explorations (Story, Split, Chapters) just link back here.
  if (i < 0) {
    return (
      <nav className={styles.switcher} aria-label="Layout prototypes">
        <Link href="/prototypes" className={styles.name}>
          All prototypes
        </Link>
      </nav>
    );
  }
  const at = (n: number) => PROTOTYPES[(n + PROTOTYPES.length) % PROTOTYPES.length];
  return (
    <nav className={styles.switcher} aria-label="Layout prototypes">
      <Link href={`/prototypes/${at(i - 1).slug}`} aria-label={`Previous: ${at(i - 1).name}`}>
        ‹
      </Link>
      <Link href="/prototypes" className={styles.name}>
        <b>{i + 1}</b>/{PROTOTYPES.length} · {PROTOTYPES[i].name}
      </Link>
      <Link href={`/prototypes/${at(i + 1).slug}`} aria-label={`Next: ${at(i + 1).name}`}>
        ›
      </Link>
    </nav>
  );
}
