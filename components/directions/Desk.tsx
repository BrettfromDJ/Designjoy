"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { plans, testimonials, type Faq, type Plan, type WorkItem } from "@/content/site";
import { openAskBox } from "@/lib/ask-box";
import { startCheckout } from "@/lib/checkout";
import { MemberCard } from "../prototypes/MemberCard";
import { plain } from "../prototypes/data";
import { WorkCard } from "../WorkCard";
import { ForceTheme, Reveal, useInView } from "./kit";
import styles from "./Desk.module.css";

// The last thing picked up goes on top.
let topmost = 20;

/**
 * Something on the desk that can be picked up and moved: it lifts while
 * held and stays where it's dropped. `at` is its spot as a share of the
 * desk ([left, top]); `turn` its angle.
 */
function Thing({
  at,
  turn,
  className = "",
  delay = 0,
  children,
}: {
  at: [number, number];
  turn: number;
  className?: string;
  delay?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState(false);
  const offset = useRef({ x: 0, y: 0 });
  const start = useRef({ x: 0, y: 0 });

  function down(event: React.PointerEvent) {
    // Phones scroll the page instead of moving things.
    if (event.pointerType !== "mouse") return;
    event.preventDefault();
    ref.current?.setPointerCapture(event.pointerId);
    start.current = { x: event.clientX - offset.current.x, y: event.clientY - offset.current.y };
    setHeld(true);
    if (ref.current) ref.current.style.zIndex = String((topmost += 1));
    const desk = ref.current?.parentElement;
    if (desk) desk.dataset.touched = "";
  }
  function move(event: React.PointerEvent) {
    if (!held || !ref.current) return;
    offset.current = { x: event.clientX - start.current.x, y: event.clientY - start.current.y };
    ref.current.style.translate = `${offset.current.x}px ${offset.current.y}px`;
  }

  return (
    <div
      ref={ref}
      className={`${styles.thing} ${className}`}
      data-held={held || undefined}
      style={{ left: `${at[0] * 100}%`, top: `${at[1] * 100}%`, "--turn": `${turn}deg`, "--d": `${delay}ms` } as CSSProperties}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={() => setHeld(false)}
      onPointerCancel={() => setHeld(false)}
    >
      {children}
    </div>
  );
}

// The sticky-note board: three notes moving from To do to Done in turn.
const NOTES = [
  { title: "Pitch deck", tone: "yellow" },
  { title: "New logo", tone: "pink" },
  { title: "Landing page", tone: "blue" },
];
const COLUMNS = ["To do", "In progress", "Done"];

function Board() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref);
  // Each note's column: they move one step at a time, the first first.
  const [cols, setCols] = useState([0, 0, 0]);
  useEffect(() => {
    if (!seen) return;
    const timer = setInterval(() => {
      setCols((c) => {
        const i = c.findIndex((col) => col < 2);
        if (i < 0) return [0, 0, 0];
        // One in progress at a time, as on the subscription.
        const next = [...c];
        next[i] += 1;
        return next;
      });
    }, 1300);
    return () => clearInterval(timer);
  }, [seen]);

  return (
    <div ref={ref} className={styles.board}>
      {COLUMNS.map((name) => (
        <div key={name} className={styles.column}>
          <p>{name}</p>
        </div>
      ))}
      {NOTES.map((note, i) => {
        // Its row: how many notes before it share its column.
        const row = cols.slice(0, i).filter((c) => c === cols[i]).length;
        return (
          <div
            key={note.title}
            className={styles.note}
            data-tone={note.tone}
            data-col={cols[i]}
            style={{ "--col": cols[i], "--row": row, "--tilt": `${(i - 1) * 2.5}deg` } as CSSProperties}
          >
            {note.title}
            <span>{cols[i] === 2 ? "Approved ✓" : cols[i] === 1 ? "~48h" : "Queued"}</span>
          </div>
        );
      })}
    </div>
  );
}

/** A receipt that prints out when it's scrolled to. */
function Receipt({ plan }: { plan: Plan }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref);
  const lines: [string, string][] = [
    ["Requests", "Unlimited"],
    ["Revisions", "Unlimited"],
    ["Delivery", "~48h avg"],
    ["Contracts", "None"],
  ];
  return (
    <div className={styles.receiptWrap}>
      <div ref={ref} className={styles.receipt} data-in={seen || undefined}>
        <p className={styles.receiptHead}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/smile.svg" alt="" width={28} height={28} />
          Designjoy
        </p>
        <p className={styles.receiptSmall}>Design, on subscription</p>
        <hr />
        <p className={styles.receiptPlan}>{plan.name}</p>
        <ul>
          <li>
            <span>1 × Membership</span>
            <span>{plan.price}.00</span>
          </li>
          {lines.map(([k, v]) => (
            <li key={k}>
              <span>{k}</span>
              <span>{v}</span>
            </li>
          ))}
          {plan.additions &&
            plan.features.slice(1).map((f) => (
              <li key={f}>
                <span>+ {f}</span>
                <span>✓</span>
              </li>
            ))}
        </ul>
        <hr />
        <p className={styles.total}>
          <span>Total / month</span>
          <span>{plan.price}.00</span>
        </p>
        <p className={styles.receiptSmall}>** Pause or cancel anytime **</p>
        <span className={styles.barcode} aria-hidden="true" />
      </div>
      <button type="button" className={styles.primary} onClick={() => startCheckout(plan.id)}>
        Join {plan.name}
      </button>
    </div>
  );
}

/**
 * Direction 4, "Desk": a designer's desk you can touch. The card, notes,
 * a print and a receipt you can pick up and move; the work pinned up as
 * prints; sticky notes moving across a board; receipts that print out.
 */
export function Desk({ work, faqs }: { work: WorkItem[]; faqs: Faq[] }) {
  const [a, b, ...rest] = work;

  return (
    <main className={styles.page}>
      <ForceTheme theme="light" />

      {/* ---------- The desk ---------- */}
      <section className={styles.desk} aria-label="Designjoy">
        <div className={styles.center}>
          <Reveal kind="mask" as="h1" className={styles.h1}>
            Your design team,
          </Reveal>
          <Reveal kind="mask" as="span" delay={120} className={`${styles.h1} ${styles.hand}`}>
            on one card.
          </Reveal>
          <Reveal kind="blur" delay={300} className={styles.centerFoot}>
            <p>Unlimited requests, most delivered in about 48 hours. One flat fee. Pause anytime.</p>
            <div className={styles.buttons}>
              <button type="button" className={styles.primary} onClick={() => startCheckout(plans[0].id)}>
                Join Monthly Club
              </button>
              <button type="button" className={styles.link} onClick={() => openAskBox("booking")}>
                Book a call →
              </button>
            </div>
          </Reveal>
        </div>

        <Thing at={[0.03, 0.14]} turn={-9} className={styles.cardThing} delay={100}>
          <MemberCard planId={plans[0].id} />
        </Thing>
        <Thing at={[0.76, 0.12]} turn={7} delay={250}>
          <div className={styles.sticky} data-tone="yellow">
            Logo by Friday?
            <span>✓ Delivered Thursday</span>
          </div>
        </Thing>
        {a && (
          <Thing at={[0.7, 0.52]} turn={5} className={styles.polaroidThing} delay={400}>
            <figure className={styles.polaroid}>
              <WorkCard item={a} sizes="320px" />
              <figcaption>{a.company ?? "Designjoy"}</figcaption>
            </figure>
          </Thing>
        )}
        <Thing at={[0.08, 0.62]} turn={-4} delay={550}>
          <div className={styles.sticky} data-tone="pink">
            New landing page →<span>In progress</span>
          </div>
        </Thing>
        <Thing at={[0.3, 0.8]} turn={-22} delay={700}>
          <span className={styles.pencil} aria-hidden="true" />
        </Thing>
        <Thing at={[0.86, 0.84]} turn={-3} delay={650}>
          <span className={styles.coffee} aria-hidden="true" />
        </Thing>
        <p className={styles.psst} aria-hidden="true">
          psst — everything on this desk moves
        </p>
      </section>

      {/* ---------- Pinned up ---------- */}
      <section className={styles.section}>
        <Reveal kind="mask" as="h2" className={styles.h2}>
          Pinned up <span className={styles.hand}>this month</span>
        </Reveal>
        <div className={styles.wall}>
          {[b, ...rest].filter(Boolean).map((item, i) => (
            <Reveal
              key={item.id}
              kind="scale"
              delay={i * 90}
              className={styles.print}
              style={{ "--tilt": `${[-2, 1.5, -1, 2.5, -1.5][i % 5]}deg` } as CSSProperties}
            >
              <span className={styles.pin} aria-hidden="true" />
              <WorkCard item={item} order={i} sizes="(min-width: 900px) 46vw, 100vw" />
              <p className={styles.tapeLabel}>
                {item.company ?? "Designjoy"} — {item.title}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className={styles.section}>
        <Reveal kind="mask" as="h2" className={styles.h2}>
          How it works <span className={styles.hand}>(it&apos;s simple)</span>
        </Reveal>
        <div className={styles.how}>
          <ol className={styles.steps}>
            <li>
              <b>Subscribe.</b> Your Trello board arrives within a few hours.
            </li>
            <li>
              <b>Add requests.</b> As many as you like. We take them one at a time.
            </li>
            <li>
              <b>Get designs.</b> Most land in about 48 hours. Revise until it&apos;s right.
            </li>
          </ol>
          <Board />
        </div>
      </section>

      {/* ---------- Receipts ---------- */}
      <section className={styles.section}>
        <Reveal kind="mask" as="h2" className={styles.h2}>
          The receipt <span className={styles.hand}>(no hidden fees)</span>
        </Reveal>
        <div className={styles.receipts}>
          {plans.map((p) => (
            <Receipt key={p.id} plan={p} />
          ))}
        </div>
      </section>

      {/* ---------- Kind words ---------- */}
      <section className={styles.section}>
        <div className={styles.cards}>
          {testimonials.map((t, i) => (
            <Reveal key={t.quote} kind="scale" delay={i * 120} className={styles.indexCard}>
              <span className={styles.tapeTop} aria-hidden="true" />
              <p>“{t.quote}”</p>
              <span className={styles.from}>
                — {t.name ?? t.company}
                {t.role && `, ${t.role}`}
              </span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Questions, on a notepad ---------- */}
      <section className={styles.section}>
        <div className={styles.notepad}>
          <h2 className={styles.notepadTitle}>Questions</h2>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{plain(faq.answer)}</p>
            </details>
          ))}
          <button type="button" className={styles.link} onClick={() => openAskBox("chat")}>
            Something else? Ask us →
          </button>
        </div>
      </section>

      {/* ---------- Close ---------- */}
      <section className={styles.close}>
        <div className={styles.closeCard}>
          <MemberCard planId={plans[1].id} />
        </div>
        <button type="button" className={`${styles.sticky} ${styles.ctaNote}`} data-tone="yellow" onClick={() => startCheckout(plans[0].id)}>
          Start today →<span>Your board arrives within hours</span>
        </button>
      </section>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} Designjoy</span>
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
      </footer>
    </main>
  );
}
