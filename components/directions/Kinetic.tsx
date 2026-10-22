"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { plans, scopeOfWork, testimonials, type Faq, type Plan, type WorkItem } from "@/content/site";
import { openAskBox } from "@/lib/ask-box";
import { startCheckout } from "@/lib/checkout";
import { MemberCard } from "../prototypes/MemberCard";
import { plain } from "../prototypes/data";
import { WorkCard } from "../WorkCard";
import { CountUp, ForceTheme, Reveal, useScrollProgress } from "./kit";
import styles from "./Kinetic.module.css";

const WORDS = ["Logos", "Websites", "Apps", "Decks", "Brands", "Ads"];

/** The word in the headline, rolling over like a slot machine. */
function RollingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setI((n) => n + 1), 1500);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className={styles.roll} aria-label={WORDS.join(", ")}>
      <span className={styles.rollTrack} style={{ "--i": i % WORDS.length } as CSSProperties} aria-hidden="true">
        {WORDS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </span>
    </span>
  );
}

/** Text running round a circle, turning. */
function Badge() {
  return (
    <svg className={styles.badge} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <path id="kinetic-ring" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
      </defs>
      <text>
        {/* Spread to exactly once round (2π × 78). */}
        <textPath href="#kinetic-ring" textLength="489" lengthAdjust="spacing">
          UNLIMITED REQUESTS · PAUSE ANYTIME ·
        </textPath>
      </text>
    </svg>
  );
}

// The life of one request over 48 hours.
const STAGES = [
  { at: 0, status: "Requested", note: "You add “Launch logo” to your board." },
  { at: 2, status: "In progress", note: "A senior designer picks it up." },
  { at: 30, status: "Delivered", note: "First designs land in your board." },
  { at: 40, status: "Revised", note: "Your notes, worked in. As many rounds as it takes." },
  { at: 48, status: "Approved", note: "Done. The next request starts." },
];

/** A request walked from asked to approved as the page scrolls, against a 48-hour clock. */
function Clock() {
  const ref = useRef<HTMLElement>(null);
  const [hours, setHours] = useState(0);
  useScrollProgress(ref, (p) => setHours(Math.min(48, p * 52)));
  const stage = STAGES.reduce((at, s, i) => (hours >= s.at ? i : at), 0);
  const hh = Math.floor(hours);
  const mm = Math.floor((hours - hh) * 60);

  return (
    <section ref={ref} className={styles.clock}>
      <div className={styles.clockPin}>
        <div className={styles.clockLeft}>
          <p className={styles.eyebrow}>How it works · one request</p>
          <p className={styles.time} aria-label={`${hh} hours ${mm} minutes`}>
            {String(hh).padStart(2, "0")}
            <span className={styles.colon}>:</span>
            {String(mm).padStart(2, "0")}
          </p>
          <div className={styles.bar}>
            <span style={{ transform: `scaleX(${hours / 48})` }} />
          </div>
          <p className={styles.clockNote} key={stage}>
            {STAGES[stage].note}
          </p>
        </div>
        <div className={styles.clockRight}>
          <div className={styles.ticket} data-stage={stage}>
            <div className={styles.ticketTop}>
              <span>Request #128</span>
              <span className={styles.status} key={stage}>
                {STAGES[stage].status}
              </span>
            </div>
            <p className={styles.ticketTitle}>Launch logo</p>
            <div className={styles.ticketArt} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
          <ol className={styles.stages}>
            {STAGES.map((s, i) => (
              <li key={s.status} data-done={i < stage || undefined} data-now={i === stage || undefined}>
                <span>{String(s.at).padStart(2, "0")}h</span>
                {s.status}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/**
 * Direction 3, "Kinetic": loud, fast type. A rolling headline over moving
 * outlines, the card slapped on like a sticker, a 48-hour clock that walks
 * one request from asked to approved as you scroll, the work stacking up
 * card on card, and one big price.
 */
export function Kinetic({ work, faqs }: { work: WorkItem[]; faqs: Faq[] }) {
  const [planId, setPlanId] = useState<Plan["id"]>(plans[0].id);
  const plan = plans.find((p) => p.id === planId) ?? plans[0];
  const price = Number(plan.price.replace(/[^0-9]/g, ""));

  return (
    <main className={styles.page}>
      <ForceTheme theme="dark" />

      {/* ---------- Hero ---------- */}
      <section className={styles.hero}>
        <div className={styles.outlines} aria-hidden="true">
          {[0, 1, 2].map((row) => (
            <div key={row} className={styles.outlineRow} data-row={row}>
              {[0, 1].map((copy) => (
                <span key={copy}>{scopeOfWork.slice(row * 5, row * 5 + 5).join(" · ")} · </span>
              ))}
            </div>
          ))}
        </div>
        <h1 className={styles.h1}>
          <span className={styles.line}>We design</span>
          <span className={styles.line}>
            <RollingWord />
          </span>
          <span className={styles.line}>in ~48 hours.</span>
        </h1>
        <div className={styles.heroFoot}>
          <p className={styles.lede}>
            Unlimited requests on one membership. A senior team, one flat monthly fee, pause or cancel anytime.
          </p>
          <div className={styles.buttons}>
            <button type="button" className={styles.primary} onClick={() => startCheckout(plans[0].id)}>
              Start today <span aria-hidden="true">→</span>
            </button>
            <button type="button" className={styles.ghost} onClick={() => openAskBox("booking")}>
              Book a call
            </button>
          </div>
        </div>
        <div className={styles.sticker}>
          <MemberCard planId={plans[0].id} />
          <Badge />
        </div>
      </section>

      {/* ---------- Numbers ---------- */}
      <section className={styles.stats}>
        <div>
          <CountUp to={48} className={styles.stat} suffix="h" />
          <p>Average delivery</p>
        </div>
        <div>
          <span className={styles.stat}>∞</span>
          <p>Requests and revisions</p>
        </div>
        <div>
          <CountUp to={0} className={styles.stat} />
          <p>Contracts</p>
        </div>
        <div>
          <CountUp to={15} className={styles.stat} />
          <p>Kinds of design</p>
        </div>
      </section>

      <Clock />

      {/* ---------- The work, stacking ---------- */}
      <section className={styles.proof}>
        <Reveal as="h2" kind="mask" className={styles.h2}>
          The proof
        </Reveal>
        <div className={styles.stack}>
          {work.map((item, i) => (
            <article key={item.id} className={styles.stackItem} style={{ "--i": i } as CSSProperties}>
              <header>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <b>{item.company ?? "Designjoy"}</b>
                <span>{item.title}</span>
              </header>
              <WorkCard item={item} order={i} sizes="(min-width: 1240px) 1100px, 100vw" />
            </article>
          ))}
        </div>
      </section>

      {/* ---------- One price ---------- */}
      <section className={styles.pricing}>
        <Reveal as="h2" kind="mask" className={styles.h2}>
          One price.
        </Reveal>
        <Reveal as="h2" kind="mask" delay={100} className={`${styles.h2} ${styles.dim}`}>
          No surprises.
        </Reveal>
        <div className={styles.toggle} role="radiogroup" aria-label="Plan">
          {plans.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={p.id === planId}
              onClick={() => setPlanId(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
        <p className={styles.bigPrice} key={plan.id}>
          ${price.toLocaleString("en-US")}
          <span>/mo</span>
        </p>
        <ul className={styles.tags} key={`tags-${plan.id}`}>
          {plan.features.map((f, i) => (
            <li key={f} style={{ "--i": i } as CSSProperties}>
              {f}
            </li>
          ))}
        </ul>
        <button type="button" className={styles.primary} onClick={() => startCheckout(plan.id)}>
          Join {plan.name} <span aria-hidden="true">→</span>
        </button>
      </section>

      {/* ---------- Kind words ---------- */}
      <section className={styles.words}>
        {testimonials.map((t, i) => (
          <Reveal key={t.quote} delay={i * 120} className={styles.word}>
            <p>“{t.quote}”</p>
            <span>
              {t.name ?? t.company}
              {t.role && ` · ${t.role}`}
            </span>
          </Reveal>
        ))}
      </section>

      {/* ---------- Questions ---------- */}
      <section className={styles.faq}>
        <Reveal as="h2" kind="mask" className={styles.h2}>
          Questions
        </Reveal>
        <div>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{plain(faq.answer)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- Close: one big moving button ---------- */}
      <button type="button" className={styles.finale} onClick={() => startCheckout(plans[0].id)}>
        <span className={styles.finaleTrack} aria-hidden="true">
          {[0, 1].map((copy) => (
            <span key={copy}>Start today → Start today → Start today → </span>
          ))}
        </span>
        <span className="visually-hidden">Start today</span>
      </button>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Designjoy</span>
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
      </footer>
    </main>
  );
}
