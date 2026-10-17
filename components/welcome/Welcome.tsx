"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { openAskBox } from "@/lib/ask-box";
import { Lanyard } from "./Lanyard";
import styles from "./Welcome.module.css";

type Props = {
  planId?: string;
  planName?: string;
  email?: string;
  inviteTo?: string;
  /** Where their Slack invite goes (Design Partner). */
  slackTo?: string;
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


/**
 * The page people land on after paying: a membership badge for their plan
 * on a lanyard (or, with ?style=card, a card) in front of a giant "You're in.",
 * their progress below, and their new design team's work drifting behind.
 */
export function Welcome({ planId, planName, email, inviteTo, slackTo, eta, member, since, lanyard = true, art = [] }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const partner = planId === "design-partner";
  // Set after mount so "member since" falls back to the visitor's own date.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);
  const joined = since ? new Date(since) : today;

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
      ? [{ title: "Slack invite", short: "Coming soon", body: `On its way to ${slackTo ?? "your inbox"}, for daily updates and quick feedback.` }]
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

      <div className={styles.info}>
        <header className={`${styles.header} ${styles.center}`}>
          <h1 className={styles.title}>
            Welcome to the club. <span className={styles.muted}>You&apos;re in.</span>
          </h1>
          <p className={styles.sub}>
            Your {planName ?? "subscription"} is active. Watch your inbox for your invites.
          </p>
        </header>

        {/* A track that fills in as each step is done; the steps still on
            their way have a spinner. */}
        <ol className={styles.track} aria-label="Your progress" style={{ "--n": steps.length } as CSSProperties}>
          {steps.map((step) => (
            <li key={step.title} data-done={step.done || undefined}>
              <span className={styles.stop} aria-hidden="true" />
              <span className={styles.stepTitle}>{step.title}</span>
              <span className={styles.stepBody}>
                {!step.done && <span className={styles.spinner} aria-hidden="true" />}
                {step.short}
                <span className="visually-hidden">{step.done ? " (done)" : " (on its way)"}</span>
              </span>
            </li>
          ))}
        </ol>
        {links}
      </div>
    </main>
    </>
  );
}
