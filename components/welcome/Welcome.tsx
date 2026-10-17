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
  /** Two columns on wider screens: the badge on the left, the rest beside it. */
  split?: boolean;
  /** Their name, from checkout. */
  name?: string;
  /** Portfolio images, for the wall behind the page. */
  art?: string[];
};

/*
 * Ways to make the page cooler, previewed with ?fx=1…7 and a small switcher.
 * Without ?fx the page is as it is now.
 */
const FX = [
  "Your name on the badge",
  "Spotlight",
  "Flip it over",
  "Arrival",
  "Glare",
  "The wall",
  "All of the above",
] as const;

function useFx() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const v = Number(new URLSearchParams(window.location.search).get("fx"));
    if (v >= 1 && v <= FX.length) setN(v);
  }, []);
  const go = (to: number) => {
    const next = ((to - 1 + FX.length) % FX.length) + 1;
    const url = new URL(window.location.href);
    url.searchParams.set("fx", String(next));
    window.history.replaceState(null, "", url);
    setN(next);
  };
  return [n, go] as const;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


/**
 * The page people land on after paying: a membership card for their plan
 * that flips in and tilts toward the pointer, with what happens next below.
 */
export function Welcome({ planId, planName, email, inviteTo, eta, member, since, lanyard = true, split = false, name, art = [] }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const partner = planId === "design-partner";
  // Set after mount so "member since" falls back to the visitor's own date.
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);
  const joined = since ? new Date(since) : today;
  const [fx, goFx] = useFx();
  const on = (i: number) => fx === i || fx === 7;
  const [flipped, setFlipped] = useState(false);
  const shownName = on(1) ? (name ?? "Sam Rivera") : undefined;

  // Where they are: subscribed, then the invites on their way. Slack is
  // for Design Partner only.
  const steps = [
    { title: "Subscribed", body: email ? `Receipt sent to ${email}.` : "Your receipt is on its way.", done: true },
    { title: "Trello invite", body: `On its way to ${inviteTo ?? "your inbox"} ${eta}.` },
    ...(partner ? [{ title: "Slack invite", body: "For daily updates and quick feedback." }] : []),
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
        <p className={styles.label}>{shownName ? `Designjoy · ${planName ?? "Member"}` : "Designjoy"}</p>
        <p className={styles.memberPlan}>{shownName ?? planName ?? "Subscriber"}</p>
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

  return (
    <>
    {on(6) && art.length > 0 && (
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
    <main className={split ? `${styles.page} ${styles.split}` : styles.page}>
      {lanyard ? (
        <Lanyard
          key={fx}
          partner={partner}
          fill={split}
          spotlight={on(2)}
          glare={on(5)}
          burst={on(4)}
          onTap={on(3) ? () => setFlipped((f) => !f) : undefined}
        >
          <div className={styles.flipper} data-flipped={(on(3) && flipped) || undefined}>
            <div className={`${styles.member} ${styles.badge}`} data-plan={planId} data-glare={on(5) || undefined}>
              <span className={styles.slot} aria-hidden="true" />
              {face}
            </div>
            {on(3) && (
              <div className={`${styles.member} ${styles.badge} ${styles.back}`} data-plan={planId} aria-hidden={!flipped}>
                <span className={styles.slot} aria-hidden="true" />
                <p className={styles.label}>Your first request</p>
                <p className={styles.backText}>
                  Add it to Backlog in Trello, then move it into Current request. We&apos;ll take it from there.
                </p>
                <p className={styles.label}>designjoy.co</p>
              </div>
            )}
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
      <header className={split ? styles.header : `${styles.header} ${styles.center}`}>
        <h1 className={styles.title}>
          Welcome to the club. <span className={styles.muted}>You&apos;re in.</span>
        </h1>
        <p className={styles.sub}>
          Your {planName ?? "subscription"} is active. Watch your inbox for your invites.
        </p>
      </header>

      <section className={styles.card} aria-label="Your progress">
        <ol className={styles.checks} data-arrive={on(4) || undefined}>
          {steps.map((step, i) => (
            <li key={step.title} data-done={step.done || undefined} style={{ "--i": i } as CSSProperties}>
              <span className={styles.check} aria-hidden="true">
                {step.done && <CheckIcon />}
              </span>
              <span>
                <span className={styles.stepTitle}>
                  {step.title}
                  {on(4) && !step.done && (
                    <span className={styles.sending} aria-hidden="true">
                      Sending
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                  <span className="visually-hidden">{step.done ? " (done)" : " (on its way)"}</span>
                </span>
                <span className={styles.stepBody}>{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.card} aria-label="Billing and help">
        <a
          href={email ? `/billing?email=${encodeURIComponent(email)}` : "/billing"}
          className={styles.link}
          target="_blank"
          rel="noopener"
        >
          Manage billing <span aria-hidden="true">→</span>
        </a>
        <p className={styles.stepBody}>Update your card, download invoices, or cancel anytime.</p>
        <button type="button" className={styles.link} onClick={() => openAskBox("chat")}>
          Questions? Just ask <span aria-hidden="true">→</span>
        </button>
      </section>
      </div>
    </main>
    {fx > 0 && (
      <div className={styles.switcher} role="group" aria-label="Preview">
        <button type="button" onClick={() => goFx(fx - 1)} aria-label="Previous">
          ‹
        </button>
        <span>
          <b>{fx}</b>/{FX.length} · {FX[fx - 1]}
          {on(3) && " (tap the badge)"}
        </span>
        <button type="button" onClick={() => goFx(fx + 1)} aria-label="Next">
          ›
        </button>
      </div>
    )}
    </>
  );
}
