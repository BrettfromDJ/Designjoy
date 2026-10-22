import type { Metadata } from "next";
import Link from "next/link";
import { NavTop } from "@/components/NavTop";
import styles from "@/components/prototypes/Index.module.css";

export const metadata: Metadata = { title: "Layout prototypes", robots: { index: false } };

// The five art directions for the Story layout.
const OPTIONS = [
  {
    slug: "vault",
    name: "Vault",
    pitch:
      "Black-card luxury. The membership card turns in 3D as you scroll and flips to reveal the perks printed on its back, then the work glides past sideways like a private collection.",
    for: "Feels like: an invitation to something exclusive.",
  },
  {
    slug: "editorial",
    name: "Editorial",
    pitch:
      "A printed design magazine. A masthead, the card tipped in like an insert, the work as full-page plates with captions, an index for how it works and a rate card for pricing.",
    for: "Feels like: taste, craft and confidence.",
  },
  {
    slug: "kinetic",
    name: "Kinetic",
    pitch:
      "Loud and fast. Huge rolling type, a pinned 48-hour clock that walks a request from asked to approved as you scroll, and the work stacking up card on card.",
    for: "Feels like: speed, energy, no fluff.",
  },
  {
    slug: "desk",
    name: "Desk",
    pitch:
      "A designer's desk you can touch. Drag the card and notes around, the work pinned up as prints, sticky notes moving across a board, and prices that print out as receipts.",
    for: "Feels like: warm, human, hands-on.",
  },
  {
    slug: "aurora",
    name: "Aurora",
    pitch:
      "Light and glass. A moving aurora behind a frosted glass card, the work on a 3D ring you can spin, and steps that light up one after another.",
    for: "Feels like: premium, futuristic, polished.",
  },
];

export default function Prototypes() {
  return (
    <>
      <NavTop />
      <main className={styles.page}>
        <h1 className={styles.title}>
          Five directions for Story.{" "}
          <span className={styles.muted}>Same story, same card, five very different ways to tell it.</span>
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
          Earlier explorations: <Link href="/prototypes/story">Story</Link>, <Link href="/prototypes/split">Split</Link>{" "}
          and <Link href="/prototypes/chapters">Chapters</Link>. Today&apos;s homepage stays as it is at{" "}
          <Link href="/">designjoy.co</Link> until you pick one.
        </p>
      </main>
    </>
  );
}
