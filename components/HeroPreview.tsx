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

/** 7. A bento of cards: the headline takes a double tile, the stats fill the rest. */
function Bento() {
  return (
    <section className={styles.hero}>
      <div className={styles.bento}>
        <div className={`${styles.card} ${styles.bentoLead} ${styles.rise}`}>
          <Live>Spots available · Start today</Live>
          <h2 className={styles.title}>
            One subscription.
            <br />
            <span className={styles.muted}>Endless possibilities.</span>
          </h2>
          <Buttons />
        </div>
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`${styles.card} ${styles.bentoStat} ${styles.rise}`}
            style={{ animationDelay: `${0.15 + i * 0.08}s` }}
          >
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

/** 8. The headline, then the stats running past in a big endless ticker. */
function Ticker() {
  const items = [
    ["∞", "requests"],
    ["48h", "average delivery"],
    ["$4,995", "a month"],
    ["0", "contracts"],
    ["∞", "revisions"],
    ["∞", "brands"],
  ];
  const run = [...items, ...items];
  return (
    <section className={styles.hero}>
      <div className={styles.split}>
        <h2 className={`${styles.title} ${styles.rise}`}>
          Senior design,
          <br />
          <span className={styles.muted}>on subscription.</span>
        </h2>
        <div className={styles.rise} data-delay="1">
          <Buttons />
        </div>
      </div>
      <div className={`${styles.ticker} ${styles.rise}`} data-delay="2" aria-label="Unlimited requests, 48-hour average delivery, $4,995 a month, no contracts">
        <div className={styles.tickerRow} aria-hidden="true">
          {run.map(([v, l], i) => (
            <span key={i} className={styles.tickerItem}>
              <span className={styles.tickerValue}>{v}</span>
              <span className={styles.muted}>{l}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/** 9. Minimal: a centred headline with the stats as quiet pills under it. */
function Pills() {
  return (
    <section className={styles.hero}>
      <div className={styles.center}>
        <h2 className={`${styles.title} ${styles.rise}`}>
          One subscription.
          <br />
          <span className={styles.muted}>Endless possibilities.</span>
        </h2>
        <ul className={`${styles.pills} ${styles.rise}`} data-delay="1">
          {STATS.map((s) => (
            <li key={s.label}>
              <b>{s.value}</b>
              {s.label}
            </li>
          ))}
        </ul>
        <div className={styles.rise} data-delay="2">
          <Buttons center />
        </div>
      </div>
    </section>
  );
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** 10. A live countdown: subscribe now, see your first design in 48 hours. */
function Countdown() {
  const [left, setLeft] = useState(48 * 3600);
  const [day, setDay] = useState("");
  useEffect(() => {
    const due = Date.now() + 48 * 3600 * 1000;
    setDay(DAYS[new Date(due).getDay()]);
    const t = window.setInterval(() => setLeft(Math.max(0, Math.round((due - Date.now()) / 1000))), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = String(Math.floor(left / 3600)).padStart(2, "0");
  const mm = String(Math.floor(left / 60) % 60).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <section className={styles.hero}>
      <div className={styles.center}>
        <span className={`${styles.label} ${styles.rise}`}>Your first design, in about</span>
        <span className={`${styles.clock} ${styles.rise}`} data-delay="1">
          {hh}
          <i>:</i>
          {mm}
          <i>:</i>
          {ss}
        </span>
        <p className={`${styles.lede} ${styles.rise}`} data-delay="2">
          Subscribe today and most requests land {day ? `by ${day}` : "in about two days"}. Unlimited requests,{" "}
          $4,995 a month, no contracts.
        </p>
        <div className={styles.rise} data-delay="3">
          <Buttons center />
        </div>
      </div>
    </section>
  );
}

/** 11. An editorial index: numbered rows, each stat large on the right. */
function Index() {
  return (
    <section className={styles.hero}>
      <div className={styles.feature}>
        <div className={styles.featureMain}>
          <h2 className={`${styles.title} ${styles.rise}`}>
            Everything you need
            <br />
            <span className={styles.muted}>to know.</span>
          </h2>
          <p className={`${styles.lede} ${styles.rise}`} data-delay="1">
            A senior design team on subscription. Add requests, get designs, repeat.
          </p>
          <div className={styles.rise} data-delay="2">
            <Buttons />
          </div>
        </div>
        <ol className={`${styles.index} ${styles.rise}`} data-delay="1">
          {STATS.map((s, i) => (
            <li key={s.label}>
              <span className={styles.label}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.indexLabel}>
                {s.label}
                <span className={styles.note}>{s.note}</span>
              </span>
              <span className={styles.mid}>
                <Count stat={s} />
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** 12. Stat cards, each with a small animated drawing of what it means. */
function Visual() {
  return (
    <section className={styles.hero}>
      <div className={styles.split}>
        <h2 className={`${styles.title} ${styles.rise}`}>
          Design on tap,
          <br />
          <span className={styles.muted}>not on payroll.</span>
        </h2>
        <div className={styles.rise} data-delay="1">
          <Buttons />
        </div>
      </div>
      <div className={styles.cards}>
        {STATS.map((s, i) => (
          <div key={s.label} className={`${styles.card} ${styles.rise}`} style={{ animationDelay: `${0.2 + i * 0.08}s` }}>
            <svg className={styles.art} viewBox="0 0 120 60" aria-hidden="true">
              {i === 0 && (
                <path pathLength={1} d="M60 30c-10-14-32-14-32 0s22 14 32 0 32-14 32 0-22 14-32 0Z" />
              )}
              {i === 1 && (
                <>
                  <circle cx="60" cy="30" r="24" className={styles.track} />
                  <circle pathLength={1} cx="60" cy="30" r="24" transform="rotate(-90 60 30)" />
                </>
              )}
              {i === 2 && (
                <>
                  <path d="M8 52H112" className={styles.track} />
                  <path pathLength={1} d="M8 30H112" />
                </>
              )}
              {i === 3 && (
                <>
                  <path d="M44 6h24l10 10v38H44Z" className={styles.track} />
                  <path pathLength={1} d="M38 48 82 12" />
                </>
              )}
            </svg>
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

const VARIANTS = [
  { name: "Hairlines", Hero: Hairlines },
  { name: "Stat cards", Hero: Cards },
  { name: "One sentence", Hero: Sentence },
  { name: "Feature number", Hero: Feature },
  { name: "Spec sheet", Hero: Spec },
  { name: "Cycling number", Hero: Cycle },
  { name: "Bento", Hero: Bento },
  { name: "Ticker", Hero: Ticker },
  { name: "Stat pills", Hero: Pills },
  { name: "Countdown", Hero: Countdown },
  { name: "Index", Hero: Index },
  { name: "Drawn stats", Hero: Visual },
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
