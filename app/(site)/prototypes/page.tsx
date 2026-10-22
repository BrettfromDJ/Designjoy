import type { Metadata } from "next";
import Link from "next/link";
import { NavTop } from "@/components/NavTop";
import styles from "@/components/prototypes/Index.module.css";

export const metadata: Metadata = { title: "Layout prototypes", robots: { index: false } };

const OPTIONS = [
  {
    slug: "story",
    name: "Story",
    pitch: "The classic way down a page. The membership card leads, then proof, the work, how it works, pricing and questions, in the order a first-time visitor asks them.",
    for: "Best for: traditional visitors who read top to bottom.",
  },
  {
    slug: "split",
    name: "Split",
    pitch: "Today's layout, tidied up. The work still fills the screen, but the left column becomes the membership card and a short set of tabs, one open at a time, instead of a long stack of cards.",
    for: "Best for: keeping the work-first feel with less to wade through.",
  },
  {
    slug: "chapters",
    name: "Chapters",
    pitch: "The story told in five beats as you scroll, each idea paired with a big piece of work or a live demo that pins beside it. Then the full body of work, pricing and questions.",
    for: "Best for: a memorable, editorial first impression.",
  },
];

export default function Prototypes() {
  return (
    <>
      <NavTop />
      <main className={styles.page}>
        <h1 className={styles.title}>
          Three ways in. <span className={styles.muted}>Same work, same card, different ways to read Designjoy.</span>
        </h1>
        <ol className={styles.list}>
          {OPTIONS.map((o, i) => (
            <li key={o.slug}>
              <Link href={`/prototypes/${o.slug}`}>
                <span className={styles.no}>{String(i + 1).padStart(2, "0")}</span>
                <span className={styles.name}>{o.name}</span>
                <span className={styles.pitch}>
                  {o.pitch}
                  <span className={styles.for}>{o.for}</span>
                </span>
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className={styles.note}>
          Today&apos;s homepage stays as it is at <Link href="/">designjoy.co</Link> until you pick one.
        </p>
      </main>
    </>
  );
}
