"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { openAskBox } from "@/lib/ask-box";
import styles from "./Hero.module.css";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** The weekday 48 hours from now, set after mount so it's the visitor's own. */
function useDeliveryDay() {
  const [day, setDay] = useState("");
  useEffect(() => setDay(DAYS[new Date(Date.now() + 48 * 3600 * 1000).getDay()]), []);
  return day;
}

/** "by Tuesday", or a neutral fallback before the visitor's day is known. */
const by = (day: string) => (day ? `by ${day}` : "in about two days");

function Buttons({ center = false }: { center?: boolean }) {
  return (
    <div className={`${styles.buttons} ${styles.rise}`} data-delay="2" data-center={center || undefined}>
      <button type="button" className={styles.primary} onClick={() => openAskBox("pricing")}>
        See plans
      </button>
      <button type="button" className={styles.secondary} onClick={() => openAskBox("booking")}>
        Book a call
      </button>
    </div>
  );
}

function Live() {
  return (
    <span className={styles.live}>
      <span className={styles.liveDot} aria-hidden="true" />
      Spots available · Start today
    </span>
  );
}

/** 1. The line as a big statement, left-aligned: the promise in white, the terms muted. */
function Statement() {
  const day = useDeliveryDay();
  return (
    <>
      <span className={styles.rise}>
        <Live />
      </span>
      <h2 className={`${styles.headline} ${styles.rise}`} data-delay="1">
        Subscribe today and most requests land {by(day)}.{" "}
        <span className={styles.muted}>Unlimited requests, $4,995 a month, no contracts.</span>
      </h2>
      <Buttons />
    </>
  );
}

/** 2. Centred, with the delivery day set in a white pill. */
function Pill() {
  const day = useDeliveryDay();
  return (
    <div className={styles.center}>
      <span className={styles.rise}>
        <Live />
      </span>
      <h2 className={`${styles.headline} ${styles.narrow} ${styles.rise}`} data-delay="1">
        Subscribe today and most requests land{" "}
        {day ? (
          <>
            by <span className={styles.dayPill}>{day}</span>
          </>
        ) : (
          "in about two days"
        )}
        . <span className={styles.muted}>Unlimited requests, $4,995 a month, no contracts.</span>
      </h2>
      <Buttons center />
    </div>
  );
}

/** 3. The promise large on the left; the terms as a list on the right. */
function Split() {
  const day = useDeliveryDay();
  return (
    <div className={styles.split}>
      <h2 className={`${styles.headline} ${styles.rise}`}>
        Subscribe today and most requests land {by(day)}.
      </h2>
      <div className={styles.side}>
        <ul className={`${styles.terms} ${styles.rise}`} data-delay="1">
          <li>
            <span>Unlimited requests</span>
            <span className={styles.label}>As many as you like</span>
          </li>
          <li>
            <span>$4,995 a month</span>
            <span className={styles.label}>One flat price</span>
          </li>
          <li>
            <span>No contracts</span>
            <span className={styles.label}>Pause or cancel anytime</span>
          </li>
        </ul>
        <Buttons />
      </div>
    </div>
  );
}

/** 4. The day is underlined with a stroke that draws in; the terms sit below as a quiet row. */
function Underline() {
  const day = useDeliveryDay();
  return (
    <>
      <h2 className={`${styles.headline} ${styles.rise}`}>
        Subscribe today and most requests land{" "}
        {day ? (
          <span className={styles.underlined}>
            by {day}
            <svg viewBox="0 0 300 12" preserveAspectRatio="none" aria-hidden="true">
              <path pathLength={1} d="M2 8 C 60 3, 140 2, 298 6" />
            </svg>
          </span>
        ) : (
          "in about two days"
        )}
        .
      </h2>
      <div className={styles.foot}>
        <p className={`${styles.row} ${styles.rise}`} data-delay="1">
          <span>Unlimited requests</span>
          <span>$4,995 a month</span>
          <span>No contracts</span>
        </p>
        <Buttons />
      </div>
    </>
  );
}

/** 5. The line inside a wide card, like the grid's tiles, with a today → delivery-day chip. */
function Card() {
  const day = useDeliveryDay();
  return (
    <div className={`${styles.card} ${styles.rise}`}>
      <div className={styles.cardTop}>
        <Live />
        <span className={styles.route} aria-hidden="true">
          Today
          <svg width="28" height="8" viewBox="0 0 28 8">
            <path d="M0 4h26m-3-3 3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          <b>{day || "2 days"}</b>
        </span>
      </div>
      <h2 className={`${styles.headline} ${styles.rise}`} data-delay="1">
        Subscribe today and most requests land {by(day)}.{" "}
        <span className={styles.muted}>Unlimited requests, $4,995 a month, no contracts.</span>
      </h2>
      <Buttons />
    </div>
  );
}

const VARIANTS = [
  { name: "Statement", Hero: Statement },
  { name: "Day pill", Hero: Pill },
  { name: "Split", Hero: Split },
  { name: "Underline", Hero: Underline },
  { name: "Card", Hero: Card },
];

/** The hero section showing option `n`, with the preview switcher if asked for. */
export function HeroSection({ n = 1, preview = false }: { n?: number; preview?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { name, Hero: Variant } = VARIANTS[n - 1];
  const go = (to: number) =>
    router.replace(`${pathname}?hero=${((to - 1 + VARIANTS.length) % VARIANTS.length) + 1}`, { scroll: false });

  return (
    <section data-hero className={styles.hero} aria-label="Designjoy">
      <Variant key={n} />
      {preview && (
        <div className={styles.switcher} role="group" aria-label="Hero preview">
          <button type="button" onClick={() => go(n - 1)} aria-label="Previous hero">
            ‹
          </button>
          <span>
            <b>{n}</b>/{VARIANTS.length} · {name}
          </span>
          <button type="button" onClick={() => go(n + 1)} aria-label="Next hero">
            ›
          </button>
        </div>
      )}
    </section>
  );
}

/**
 * The homepage hero, above the grid. Shows option 1; ?hero=1…5 previews the
 * others, with a switcher, until one is picked. Render inside <Suspense> with
 * <HeroSection /> as the fallback, so option 1 is in the server HTML.
 */
export function Hero() {
  const requested = Number(useSearchParams().get("hero"));
  const preview = requested >= 1 && requested <= VARIANTS.length;
  return <HeroSection n={preview ? requested : 1} preview={preview} />;
}
