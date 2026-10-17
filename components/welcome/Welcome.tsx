"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { openAskBox } from "@/lib/ask-box";
import { CheckIcon } from "../Icons";
import { Lanyard } from "./Lanyard";
import styles from "./Welcome.module.css";

type Props = {
  planId?: string;
  planName?: string;
  email?: string;
  inviteTo?: string;
  eta: string;
  /** Their member number, from their subscription. */
  member?: number;
  /** When they subscribed, in ms. */
  since?: number;
  /** Show the membership as a badge on a lanyard (the default) or a card. */
  lanyard?: boolean;

  /** Portfolio images, for the wall behind the page. */
  art?: string[];
};

/*
 * Treatments for the section under the badge, previewed with ?bottom=1…6 and
 * a small switcher. Without ?bottom it's the cards (option 1).
 */
const BOTTOMS = ["Cards", "One strip", "No boxes", "Receipt", "Progress track", "Minimal"] as const;

function useBottom() {
  const [n, setN] = useState(1);
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    const v = Number(new URLSearchParams(window.location.search).get("bottom"));
    if (v >= 1 && v <= BOTTOMS.length) {
      setN(v);
      setPreview(true);
    }
  }, []);
  const go = (to: number) => {
    const next = ((to - 1 + BOTTOMS.length) % BOTTOMS.length) + 1;
    const url = new URL(window.location.href);
    url.searchParams.set("bottom", String(next));
    window.history.replaceState(null, "", url);
    setN(next);
  };
  return { n, preview, go };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


/**
 * The page people land on after paying: a membership badge for their plan
 * on a lanyard (or, with ?style=card, a card), with what happens next below
 * and their new design team's work drifting behind.
 */
export function Welcome({ planId, planName, email, inviteTo, eta, member, since, lanyard = true, art = [] }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const partner = planId === "design-partner";
  // Set after mount so "member since" falls back to the visitor's own date.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);
  const joined = since ? new Date(since) : today;
  const bottom = useBottom();

  // Where they are: subscribed, then the invites on their way. Slack is
  // for Design Partner only.
  const steps = [
    {
      title: "Subscribed",
      short: "Active",
      body: email ? `Receipt sent to ${email}.` : "Your receipt is on its way.",
      done: true,
    },
    { title: "Trello invite", short: eta.replace(/^within /, "In "), body: `On its way to ${inviteTo ?? "your inbox"} ${eta}.` },
    ...(partner
      ? [{ title: "Slack invite", short: "Coming soon", body: "For daily updates and quick feedback." }]
      : []),
  ];

  // The nav sits at the top on this page (set early by the page itself);
  // put it back when leaving.
  useEffect(() => {
    document.body.dataset.navTop = "";
    return () => {
      delete document.body.dataset.navTop;
    };
  }, []);

  // The card tilts toward the pointer, and its light follows it.
  function tilt(event: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    el.style.setProperty("--rx", `${-y * 10}deg`);
    el.style.setProperty("--ry", `${x * 14}deg`);
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
  }

  // What's printed on the card (or badge).
  const face = (
    <>
      <div className={styles.memberTop}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/smile.svg" alt="" width={36} height={36} className={styles.memberSmile} draggable={false} />
        {member && <span className={styles.label}>Member № {String(member).padStart(4, "0")}</span>}
      </div>
      <div>
        <p className={styles.label}>Designjoy</p>
        <p className={styles.memberPlan}>{planName ?? "Subscriber"}</p>
      </div>
      <div className={styles.memberFoot}>
        <span>
          <span className={styles.label}>Member since</span>
          {joined ? `${MONTHS[joined.getMonth()]} ${joined.getFullYear()}` : "\u00a0"}
        </span>
        <span>
          <span className={styles.label}>Access</span>
          Unlimited
        </span>
      </div>
    </>
  );

  const billing = email ? `/billing?email=${encodeURIComponent(email)}` : "/billing";

  const checklist = (
    <ol className={styles.checks}>
      {steps.map((step, i) => (
        <li key={step.title} data-done={step.done || undefined} style={{ "--i": i } as CSSProperties}>
          <span className={styles.check} aria-hidden="true">
            {step.done && <CheckIcon />}
          </span>
          <span>
            <span className={styles.stepTitle}>
              {step.title}
              <span className="visually-hidden">{step.done ? " (done)" : " (on its way)"}</span>
            </span>
            <span className={styles.stepBody}>{step.body}</span>
          </span>
        </li>
      ))}
    </ol>
  );

  // Billing and help as two quiet text links.
  const links = (
    <p className={styles.links}>
      <a href={billing} target="_blank" rel="noopener">
        Manage billing <span aria-hidden="true">→</span>
      </a>
      <button type="button" onClick={() => openAskBox("chat")}>
        Questions? Just ask <span aria-hidden="true">→</span>
      </button>
    </p>
  );

  return (
    <>
    {/* The wall: the portfolio drifting slowly behind the page. */}
    {art.length > 0 && (
      <div className={styles.wall} aria-hidden="true">
        {[0, 1, 2, 3, 4].map((col) => (
          <div key={col} className={styles.wallCol} style={{ "--c": col } as CSSProperties}>
            {[...art, ...art].map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="" loading="lazy" />
            ))}
          </div>
        ))}
      </div>
    )}
    <main className={`${styles.page} ${styles.poster}`}>
      <p className={styles.giant} aria-hidden="true">
        You&apos;re in.
      </p>
      {lanyard ? (
        <Lanyard partner={partner}>
          <div className={`${styles.member} ${styles.badge}`} data-plan={planId}>
            <span className={styles.slot} aria-hidden="true" />
            {face}
          </div>
        </Lanyard>
      ) : (
        <div
          className={styles.memberWrap}
          onPointerMove={tilt}
          onPointerLeave={() => ref.current?.removeAttribute("style")}
        >
          <div ref={ref} className={styles.member} data-plan={planId}>
            {face}
          </div>
        </div>
      )}

      <div className={styles.info} data-bottom={BOTTOMS[bottom.n - 1]}>
        <header className={`${styles.header} ${styles.center}`}>
          <h1 className={styles.title}>
            Welcome to the club. <span className={styles.muted}>You&apos;re in.</span>
          </h1>
          <p className={styles.sub}>
            Your {planName ?? "subscription"} is active. Watch your inbox for your invites.
          </p>
        </header>

        {bottom.n === 1 && (
          <>
            <section className={styles.card} aria-label="Your progress">
              {checklist}
            </section>
            <section className={styles.card} aria-label="Billing and help">
              <a href={billing} className={styles.link} target="_blank" rel="noopener">
                Manage billing <span aria-hidden="true">→</span>
              </a>
              <p className={styles.stepBody}>Update your card, download invoices, or cancel anytime.</p>
              <button type="button" className={styles.link} onClick={() => openAskBox("chat")}>
                Questions? Just ask <span aria-hidden="true">→</span>
              </button>
            </section>
          </>
        )}

        {/* 2. One slim bar: each step and its status in a row. */}
        {bottom.n === 2 && (
          <>
            <ol className={styles.strip} aria-label="Your progress">
              {steps.map((step) => (
                <li key={step.title} data-done={step.done || undefined}>
                  <span className={styles.check} aria-hidden="true">
                    {step.done && <CheckIcon />}
                  </span>
                  <span>
                    <span className={styles.stepTitle}>{step.title}</span>
                    <span className={styles.stepBody}>{step.short}</span>
                  </span>
                </li>
              ))}
            </ol>
            {links}
          </>
        )}

        {/* 3. No boxes: the steps in a row between hairlines, links as text. */}
        {bottom.n === 3 && (
          <>
            <ol className={styles.row} aria-label="Your progress">
              {steps.map((step) => (
                <li key={step.title} data-done={step.done || undefined}>
                  <span className={styles.label}>{step.done ? "Done" : "Next"}</span>
                  <span className={styles.stepTitle}>{step.title}</span>
                  <span className={styles.stepBody}>{step.body}</span>
                </li>
              ))}
            </ol>
            {links}
          </>
        )}

        {/* 4. A receipt, in mono, with dotted leaders. */}
        {bottom.n === 4 && (
          <section className={styles.receipt} aria-label="Your receipt">
            <p className={styles.receiptHead}>
              <span>Designjoy</span>
              <span>{today ? today.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : ""}</span>
            </p>
            <dl>
              <div>
                <dt>Plan</dt>
                <dd>{planName ?? "Subscription"}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Active ✓</dd>
              </div>
              {member && (
                <div>
                  <dt>Member</dt>
                  <dd>№ {String(member).padStart(4, "0")}</dd>
                </div>
              )}
              <div>
                <dt>Receipt</dt>
                <dd>{email ? `Sent to ${email}` : "On its way"}</dd>
              </div>
              <div>
                <dt>Trello invite</dt>
                <dd>{eta.replace(/^within /, "In ")}</dd>
              </div>
              {partner && (
                <div>
                  <dt>Slack invite</dt>
                  <dd>Coming soon</dd>
                </div>
              )}
            </dl>
            <p className={styles.receiptFoot}>
              <a href={billing} target="_blank" rel="noopener">
                Manage billing
              </a>
              <button type="button" onClick={() => openAskBox("chat")}>
                Questions? Just ask
              </button>
            </p>
          </section>
        )}

        {/* 5. A track that fills in as each step is done. */}
        {bottom.n === 5 && (
          <>
            <ol
              className={styles.track}
              aria-label="Your progress"
              style={{ "--n": steps.length } as CSSProperties}
            >
              {steps.map((step) => (
                <li key={step.title} data-done={step.done || undefined}>
                  <span className={styles.stop} aria-hidden="true" />
                  <span className={styles.stepTitle}>{step.title}</span>
                  <span className={styles.stepBody}>{step.short}</span>
                </li>
              ))}
            </ol>
            {links}
          </>
        )}

        {/* 6. Nothing but the heading and two links. */}
        {bottom.n === 6 && links}
      </div>
    </main>
    {bottom.preview && (
      <div className={styles.switcher} role="group" aria-label="Preview">
        <button type="button" onClick={() => bottom.go(bottom.n - 1)} aria-label="Previous">
          ‹
        </button>
        <span>
          <b>{bottom.n}</b>/{BOTTOMS.length} · {BOTTOMS[bottom.n - 1]}
        </span>
        <button type="button" onClick={() => bottom.go(bottom.n + 1)} aria-label="Next">
          ›
        </button>
      </div>
    )}
    </>
  );
}
