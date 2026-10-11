"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { openAskBox } from "@/lib/ask-box";
import styles from "./HeroPreview.module.css";

/*
 * Hero section candidates, previewed above the real homepage grid. Only shown
 * with ?hero=1…n in the URL, so the live homepage is unchanged until one is
 * picked.
 */

const STATS = [
  { value: "∞", label: "Requests", note: "Add as many as you like." },
  { value: "48h", count: 48, suffix: "h", label: "Avg. delivery", note: "One at a time, start to finish." },
  { value: "$4,995", count: 4995, prefix: "$", label: "Per month", note: "One flat price. No surprises." },
  { value: "0", count: 0, label: "Contracts", note: "Pause or cancel anytime." },
];
type Stat = (typeof STATS)[number];

/** Counts a stat up from zero once, on mount. */
function Count({ stat }: { stat: Stat }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (stat.count === undefined) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(stat.count);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1400, 1);
      setN(Math.round(stat.count! * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [stat.count]);
  if (stat.count === undefined) return <>{stat.value}</>;
  return (
    <>
      {stat.prefix}
      {n.toLocaleString("en-US")}
      {stat.suffix}
    </>
  );
}

function Buttons({ center = false }: { center?: boolean }) {
  return (
    <div className={styles.buttons} data-center={center || undefined}>
      <button type="button" className={styles.primary} onClick={() => openAskBox("pricing")}>
        See plans
      </button>
      <button type="button" className={styles.secondary} onClick={() => openAskBox("booking")}>
        Book a call
      </button>
    </div>
  );
}

function Live({ children }: { children: React.ReactNode }) {
  return (
    <span className={styles.live}>
      <span className={styles.liveDot} aria-hidden="true" />
      {children}
    </span>
  );
}

/** 1. Headline and buttons, then the four numbers between hairlines. */
function Hairlines() {
  return (
    <section className={styles.hero}>
      <div className={styles.split}>
        <h2 className={`${styles.title} ${styles.rise}`}>
          Senior design,
          <br />
          <span className={styles.muted}>without the hiring.</span>
        </h2>
        <div className={styles.rise} data-delay="1">
          <Buttons />
        </div>
      </div>
      <dl className={`${styles.rule} ${styles.rise}`} data-delay="2">
        {STATS.map((s) => (
          <div key={s.label}>
            <dt className={styles.label}>{s.label}</dt>
            <dd className={styles.big}>
              <Count stat={s} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** 2. The numbers as cards, one per grid column, like the first row of the grid. */
function Cards() {
  return (
    <section className={styles.hero}>
      <div className={styles.center}>
        <span className={styles.rise}>
          <Live>Spots available · Start today</Live>
        </span>
        <h2 className={`${styles.title} ${styles.rise}`} data-delay="1">
          One subscription.
          <br />
          <span className={styles.muted}>Endless possibilities.</span>
        </h2>
        <div className={styles.rise} data-delay="2">
          <Buttons center />
        </div>
      </div>
      <div className={styles.cards}>
        {STATS.map((s, i) => (
          <div key={s.label} className={`${styles.card} ${styles.rise}`} style={{ animationDelay: `${0.35 + i * 0.08}s` }}>
            <span className={styles.label}>{s.label}</span>
            <span className={styles.big}>
              <Count stat={s} />
            </span>
            <span className={styles.note}>{s.note}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** 3. The numbers inside one big sentence: figures in white, words muted. */
function Sentence() {
  return (
    <section className={styles.hero}>
      <span className={`${styles.label} ${styles.rise}`}>Designjoy · Design subscription</span>
      <h2 className={`${styles.sentence} ${styles.rise}`} data-delay="1">
        <span>Unlimited</span> <span className={styles.muted}>requests.</span>{" "}
        <span>48-hour</span> <span className={styles.muted}>delivery.</span>{" "}
        <span>$4,995</span> <span className={styles.muted}>a month.</span>{" "}
        <span>Zero</span> <span className={styles.muted}>contracts.</span>
      </h2>
      <div className={`${styles.row} ${styles.rise}`} data-delay="2">
        <Buttons />
        <Live>Spots available</Live>
      </div>
    </section>
  );
}

/** 4. One hero number large on the left, the rest listed on the right. */
function Feature() {
  const [main, ...rest] = [STATS[1], STATS[0], STATS[2], STATS[3]];
  return (
    <section className={styles.hero}>
      <div className={styles.feature}>
        <div className={styles.featureMain}>
          <span className={`${styles.label} ${styles.rise}`}>Average delivery</span>
          <span className={`${styles.huge} ${styles.rise}`} data-delay="1">
            <Count stat={main} />
          </span>
          <p className={`${styles.lede} ${styles.rise}`} data-delay="2">
            Senior design, delivered in about two days. Unlimited requests for one flat monthly price.
          </p>
          <div className={styles.rise} data-delay="3">
            <Buttons />
          </div>
        </div>
        <dl className={`${styles.list} ${styles.rise}`} data-delay="2">
          {rest.map((s) => (
            <div key={s.label}>
              <dt>
                <span className={styles.label}>{s.label}</span>
                <span className={styles.note}>{s.note}</span>
              </dt>
              <dd className={styles.mid}>
                <Count stat={s} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** 5. A spec sheet: mono rows with dotted leaders, in a card. */
function Spec() {
  const rows = [
    ["Requests", "Unlimited"],
    ["Revisions", "Unlimited"],
    ["Avg. delivery", "48 hours"],
    ["Price", "$4,995/mo"],
    ["Contracts", "None"],
    ["Pause", "Anytime"],
  ];
  return (
    <section className={styles.hero}>
      <div className={styles.specWrap}>
        <div className={styles.featureMain}>
          <span className={`${styles.rise}`}>
            <Live>Spots available</Live>
          </span>
          <h2 className={`${styles.title} ${styles.rise}`} data-delay="1">
            A design team,
            <br />
            <span className={styles.muted}>by the numbers.</span>
          </h2>
          <div className={styles.rise} data-delay="2">
            <Buttons />
          </div>
        </div>
        <dl className={`${styles.spec} ${styles.rise}`} data-delay="2">
          {rows.map(([k, v], i) => (
            <div key={k} style={{ animationDelay: `${0.4 + i * 0.07}s` }}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** 6. One number at a time, large, cycling, with progress dashes. */
function Cycle() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setI((n) => (n + 1) % STATS.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <section className={styles.hero}>
      <div className={styles.center}>
        <h2 className={`${styles.title} ${styles.rise}`}>
          One subscription.
          <br />
          <span className={styles.muted}>Endless possibilities.</span>
        </h2>
        <div className={styles.cycle} aria-live="polite">
          {STATS.map((s, n) => (
            <div key={s.label} className={styles.cycleItem} data-on={n === i || undefined}>
              <span className={styles.huge}>{s.value}</span>
              <span className={styles.label}>
                {s.label} · {s.note}
              </span>
            </div>
          ))}
        </div>
        <ol className={styles.dashes} aria-hidden="true">
          {STATS.map((s, n) => (
            <li key={s.label} data-on={n === i || undefined} />
          ))}
        </ol>
        <div className={styles.rise} data-delay="2">
          <Buttons center />
        </div>
      </div>
    </section>
  );
}

const VARIANTS = [
  { name: "Hairlines", Hero: Hairlines },
  { name: "Stat cards", Hero: Cards },
  { name: "One sentence", Hero: Sentence },
  { name: "Feature number", Hero: Feature },
  { name: "Spec sheet", Hero: Spec },
  { name: "Cycling number", Hero: Cycle },
];

export function HeroPreview() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const n = Number(params.get("hero"));
  if (!n || n < 1 || n > VARIANTS.length) return null;
  const { name, Hero } = VARIANTS[n - 1];
  const go = (to: number) =>
    router.replace(`${pathname}?hero=${((to - 1 + VARIANTS.length) % VARIANTS.length) + 1}`, { scroll: false });

  return (
    <div data-hero className={styles.wrap}>
      <Hero key={n} />
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
    </div>
  );
}
