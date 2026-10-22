import Link from "next/link";
import styles from "./Switcher.module.css";

export const PROTOTYPES = [
  { slug: "story", name: "Story" },
  { slug: "split", name: "Split" },
  { slug: "chapters", name: "Chapters" },
];

/** A pill in the corner for stepping between the layout prototypes. */
export function Switcher({ current }: { current: string }) {
  const i = PROTOTYPES.findIndex((p) => p.slug === current);
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
