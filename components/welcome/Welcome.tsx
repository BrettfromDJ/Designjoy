"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { askQuestion, openAskBox } from "@/lib/ask-box";
import { BoardDemo } from "../BoardDemo";
import { BotFace } from "../BotFace";
import { CheckIcon } from "../Icons";
import styles from "./Welcome.module.css";

export type WelcomeStep = { title: string; body: string; done?: boolean };

type Props = {
  planId?: string;
  planName?: string;
  email?: string;
  inviteTo?: string;
  eta: string;
  steps: WelcomeStep[];
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Today, tomorrow and two days out, set after mount so they're the visitor's own. */
function useDates() {
  const [dates, setDates] = useState<Date[] | null>(null);
  useEffect(() => setDates([0, 1, 2].map((d) => new Date(Date.now() + d * 24 * 3600 * 1000))), []);
  return dates;
}

const short = (d: Date) => `${DAYS[d.getDay()].slice(0, 3)} ${d.getDate()} ${MONTHS[d.getMonth()]}`;

/*
 * Options for the page people land on after paying, previewed with ?v=1…7
 * and a small switcher. Without ?v it's the current page (option 1).
 */
const OPTIONS = [
  "As now: next steps",
  "Your board",
  "Membership card",
  "Timeline",
  "A note from the bot",
  "Celebration",
  "Getting started checklist",
] as const;

function useOption() {
  const [n, setN] = useState(1);
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    const v = Number(new URLSearchParams(window.location.search).get("v"));
    if (v >= 1 && v <= OPTIONS.length) {
      setN(v);
      setPreview(true);
    }
  }, []);
  const go = (to: number) => {
    const next = ((to - 1 + OPTIONS.length) % OPTIONS.length) + 1;
    const url = new URL(window.location.href);
    url.searchParams.set("v", String(next));
    window.history.replaceState(null, "", url);
    setN(next);
  };
  return { n, preview, go };
}

export function Welcome(props: Props) {
  const { n, preview, go } = useOption();
  const Option = [Steps, Board, Membership, Timeline, Note, Celebration, Checklist][n - 1];
  return (
    <>
      <Option key={n} {...props} />
      {preview && (
        <div className={styles.switcher} role="group" aria-label="Welcome page preview">
          <button type="button" onClick={() => go(n - 1)} aria-label="Previous option">
            ‹
          </button>
          <span>
            <b>{n}</b>/{OPTIONS.length} · {OPTIONS[n - 1]}
          </span>
          <button type="button" onClick={() => go(n + 1)} aria-label="Next option">
            ›
          </button>
        </div>
      )}
    </>
  );
}

/* ---------- Shared pieces ---------- */

function Header({ planName, title }: { planName?: string; title?: React.ReactNode }) {
  return (
    <header className={styles.header}>
      <p className={styles.label}>Welcome to Designjoy</p>
      <h1 className={styles.title}>
        {title ?? (
          <>
            You&apos;re in. <span className={styles.muted}>Let&apos;s make something great.</span>
          </>
        )}
      </h1>
      <p className={styles.sub}>
        {planName ? `Your ${planName} subscription is active.` : "Your subscription is active."} Here&apos;s what
        happens next.
      </p>
    </header>
  );
}

function Help({ email }: { email?: string }) {
  return (
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
  );
}

function StepList({ steps }: { steps: WelcomeStep[] }) {
  return (
    <ol className={styles.steps}>
      {steps.map((step, i) => (
        <li key={step.title} data-done={step.done ?? false} style={{ "--i": i } as CSSProperties}>
          <span className={styles.marker} aria-hidden="true">
            {step.done ? <CheckIcon /> : String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <p className={styles.stepTitle}>{step.title}</p>
            <p className={styles.stepBody}>{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ---------- 1. As now ---------- */

function Steps({ planName, email, steps }: Props) {
  return (
    <main className={styles.page}>
      <Header planName={planName} />
      <section className={styles.card} aria-labelledby="next-title">
        <h2 id="next-title" className={styles.label}>
          What happens next
        </h2>
        <StepList steps={steps} />
      </section>
      <Help email={email} />
    </main>
  );
}

/* ---------- 2. Your board ---------- */

function Board({ planName, email, inviteTo, eta, steps }: Props) {
  return (
    <main className={`${styles.page} ${styles.wide}`}>
      <Header
        planName={planName}
        title={
          <>
            You&apos;re in. <span className={styles.muted}>Your board is being set up.</span>
          </>
        }
      />
      <section className={`${styles.card} ${styles.rise}`} aria-label="Your Trello board">
        <div className={styles.boardHead}>
          <span className={styles.status}>
            <span className={styles.liveDot} aria-hidden="true" />
            Setting up your board
          </span>
          <span className={styles.stepBody}>
            Invite to {inviteTo ?? "your inbox"} · {eta}
          </span>
        </div>
        <BoardDemo />
        <p className={styles.caption}>
          This is how it works: add requests to Backlog, move one into Current request, and we&apos;ll take it
          from there.
        </p>
      </section>
      <section className={`${styles.card} ${styles.rise}`} style={{ "--d": "120ms" } as CSSProperties}>
        <h2 className={styles.label}>What happens next</h2>
        <StepList steps={steps.slice(1)} />
      </section>
      <Help email={email} />
    </main>
  );
}

/* ---------- 3. Membership card ---------- */

function Membership({ planId, planName, email, inviteTo, eta }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [since, setSince] = useState("");
  const [number, setNumber] = useState("");
  useEffect(() => {
    const now = new Date();
    setSince(`${MONTHS[now.getMonth()]} ${now.getFullYear()}`);
    // A friendly member number, steady for the day.
    setNumber(String(((now.getFullYear() * 372 + now.getMonth() * 31 + now.getDate()) % 9000) + 1000));
  }, []);

  // The card tilts toward the pointer.
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

  return (
    <main className={styles.page}>
      <div className={styles.memberWrap} onPointerMove={tilt} onPointerLeave={() => ref.current?.removeAttribute("style")}>
        <div ref={ref} className={styles.member} data-plan={planId}>
          <div className={styles.memberTop}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/smile.svg" alt="" width={36} height={36} className={styles.memberSmile} />
            <span className={styles.label}>Member № {number}</span>
          </div>
          <div>
            <p className={styles.label}>Designjoy</p>
            <p className={styles.memberPlan}>{planName ?? "Subscriber"}</p>
          </div>
          <div className={styles.memberFoot}>
            <span>
              <span className={styles.label}>Member since</span>
              {since}
            </span>
            <span>
              <span className={styles.label}>Requests</span>
              One at a time, unlimited
            </span>
          </div>
        </div>
      </div>
      <header className={`${styles.header} ${styles.center}`}>
        <h1 className={styles.title}>
          Welcome to the club. <span className={styles.muted}>You&apos;re in.</span>
        </h1>
        <p className={styles.sub}>
          Watch for a Trello invite to {inviteTo ?? "your inbox"} {eta}. Your receipt is on its way
          {email ? ` to ${email}` : ""}.
        </p>
      </header>
      <Help email={email} />
    </main>
  );
}

/* ---------- 4. Timeline ---------- */

function Timeline({ planName, email, inviteTo, eta }: Props) {
  const dates = useDates();
  const stops = [
    { when: "Today", title: "Trello invite", body: `Sent to ${inviteTo ?? "you"} ${eta}.` },
    { when: "Tomorrow", title: "Brief your first request", body: "Add it to Backlog and move it into Current request." },
    { when: dates ? DAYS[dates[2].getDay()] : "Day two", title: "First delivery", body: "Most requests land in about 48 hours." },
  ];
  return (
    <main className={`${styles.page} ${styles.wide}`}>
      <Header
        planName={planName}
        title={
          <>
            You&apos;re in. <span className={styles.muted}>Here&apos;s your first week.</span>
          </>
        }
      />
      <section className={styles.card} aria-label="Your first few days">
        <ol className={styles.timeline}>
          {stops.map((stop, i) => (
            <li key={stop.title} style={{ "--i": i } as CSSProperties} data-now={i === 0 || undefined}>
              <span className={styles.dot} aria-hidden="true" />
              <p className={styles.label}>
                {stop.when}
                {dates && <span className={styles.date}> · {short(dates[i])}</span>}
              </p>
              <p className={styles.stepTitle}>{stop.title}</p>
              <p className={styles.stepBody}>{stop.body}</p>
            </li>
          ))}
        </ol>
      </section>
      <Help email={email} />
    </main>
  );
}

/* ---------- 5. A note from the bot ---------- */

function Note({ planName, email, inviteTo, eta }: Props) {
  const messages = [
    `Welcome to Designjoy! Your ${planName ?? ""} subscription is active.`.replace("  ", " "),
    email ? `Your receipt is on its way to ${email}.` : "Your receipt is on its way to your inbox.",
    `Next, watch for a Trello invite to ${inviteTo ?? "your inbox"}. It usually arrives ${eta}.`,
    "Once you're in, add requests to Backlog and move one into Current request. Most land in about 48 hours.",
  ];
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(messages.length);
      setTyping(false);
      return;
    }
    if (shown >= messages.length) {
      setTyping(false);
      return;
    }
    setTyping(true);
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 900 : 1100);
    return () => clearTimeout(t);
  }, [shown, messages.length]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.label}>Welcome to Designjoy</p>
        <h1 className={styles.title}>
          You&apos;re in. <span className={styles.muted}>A quick note before you start.</span>
        </h1>
      </header>
      <section className={styles.card} aria-label="Welcome message">
        <div className={styles.chat} aria-live="polite">
          <div className={styles.chatFrom}>
            <BotFace size={28} excited={shown > 0} />
            <span className={styles.stepBody}>Designjoy</span>
          </div>
          {messages.slice(0, shown).map((m) => (
            <p key={m} className={styles.bubble}>
              {m}
            </p>
          ))}
          {typing && (
            <span className={styles.typing} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
        {!typing && (
          <div className={styles.chips}>
            <button type="button" onClick={() => askQuestion("How do I write a good request?")}>
              How do I write a good request?
            </button>
            <button type="button" onClick={() => askQuestion("Can I add teammates to the board?")}>
              Can I add teammates?
            </button>
            <button type="button" onClick={() => askQuestion("How do I manage billing?")}>
              Billing
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

/* ---------- 6. Celebration ---------- */

function Celebration({ planName, email, inviteTo, eta }: Props) {
  // Little smiles burst out around the big one.
  const bursts = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * Math.PI * 2;
    const dist = 120 + (i % 3) * 46;
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist * 0.7, d: (i % 4) * 60, s: 0.5 + (i % 3) * 0.2 };
  });
  return (
    <main className={`${styles.page} ${styles.wide} ${styles.center}`}>
      <div className={styles.burst} aria-hidden="true">
        {bursts.map((b, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src="/icons/smile.svg"
            alt=""
            className={styles.particle}
            style={{ "--x": `${b.x}px`, "--y": `${b.y}px`, "--d": `${b.d}ms`, "--s": b.s } as CSSProperties}
          />
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/smile.svg" alt="" className={styles.bigSmile} />
      </div>
      <h1 className={styles.giant}>You&apos;re in.</h1>
      <p className={styles.lead}>
        {planName ? `${planName} is active.` : "Your subscription is active."}{" "}
        <span className={styles.muted}>
          Watch for a Trello invite to {inviteTo ?? "your inbox"} {eta}, then send us your first request.
        </span>
      </p>
      <div className={styles.pills}>
        <span>
          <CheckIcon /> Paid
        </span>
        <span>Trello invite · {eta}</span>
        <span>First delivery · ~48 hours</span>
      </div>
      <Help email={email} />
    </main>
  );
}

/* ---------- 7. Getting started checklist ---------- */

const TEMPLATE = `What do you need? (e.g. a landing page hero)
Who is it for?
Where will it be used, and at what size?
Anything we should match or avoid? (links, screenshots)
When would you love it by?`;

function Checklist({ planName, email, inviteTo, eta }: Props) {
  const items = [
    { id: "invite", title: "Accept your Trello invite", body: `Sent to ${inviteTo ?? "your inbox"} ${eta}.` },
    { id: "assets", title: "Add your brand assets", body: "Logos, fonts and colours, in a card on the board." },
    { id: "brief", title: "Write your first request", body: "A few lines is plenty. The template below helps." },
    { id: "move", title: "Move it into Current request", body: "That's our cue to start. Most land in about 48 hours." },
  ];
  const [done, setDone] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    try {
      setDone(JSON.parse(localStorage.getItem("welcome-checklist") ?? "[]"));
    } catch {}
  }, []);
  const toggle = (id: string) =>
    setDone((d) => {
      const next = d.includes(id) ? d.filter((x) => x !== id) : [...d, id];
      try {
        localStorage.setItem("welcome-checklist", JSON.stringify(next));
      } catch {}
      return next;
    });
  const pct = Math.round((done.length / items.length) * 100);

  return (
    <main className={styles.page}>
      <Header
        planName={planName}
        title={
          <>
            You&apos;re in. <span className={styles.muted}>Four steps to your first design.</span>
          </>
        }
      />
      <section className={styles.card} aria-label="Getting started">
        <div className={styles.progressHead}>
          <span className={styles.label}>Getting started</span>
          <span className={styles.stepBody}>
            {done.length} of {items.length} done
          </span>
        </div>
        <span className={styles.progress} aria-hidden="true">
          <i style={{ width: `${pct}%` }} />
        </span>
        <ul className={styles.checklist}>
          {items.map((item) => {
            const on = done.includes(item.id);
            return (
              <li key={item.id}>
                <button type="button" onClick={() => toggle(item.id)} aria-pressed={on} data-on={on || undefined}>
                  <span className={styles.box} aria-hidden="true">
                    {on && <CheckIcon />}
                  </span>
                  <span>
                    <span className={styles.stepTitle}>{item.title}</span>
                    <span className={styles.stepBody}>{item.body}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      <section className={styles.card} aria-label="Request template">
        <div className={styles.progressHead}>
          <span className={styles.label}>Request template</span>
          <button
            type="button"
            className={styles.copy}
            onClick={() => {
              navigator.clipboard?.writeText(TEMPLATE).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              });
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className={styles.template}>{TEMPLATE}</pre>
      </section>
      <Help email={email} />
    </main>
  );
}
