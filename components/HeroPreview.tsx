"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { openAskBox } from "@/lib/ask-box";
import styles from "./HeroPreview.module.css";

/*
 * Countdown hero candidates, previewed above the real homepage grid. Only
 * shown with ?hero=1…5 in the URL, so the live homepage is unchanged until one
 * is picked.
 */

const TOTAL = 48 * 3600;
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const pad = (n: number) => String(n).padStart(2, "0");

/** Counts down 48 hours from when the page opened, and names the day it ends. */
function useCountdown() {
  const [left, setLeft] = useState(TOTAL);
  const [day, setDay] = useState("");
  useEffect(() => {
    const due = Date.now() + TOTAL * 1000;
    setDay(DAYS[new Date(due).getDay()]);
    const t = window.setInterval(() => setLeft(Math.max(0, Math.round((due - Date.now()) / 1000))), 1000);
    return () => clearInterval(t);
  }, []);
  return {
    left,
    day,
    hh: pad(Math.floor(left / 3600)),
    mm: pad(Math.floor(left / 60) % 60),
    ss: pad(left % 60),
  };
}

function Paragraph({ day, center = true }: { day: string; center?: boolean }) {
  return (
    <p className={`${styles.lede} ${styles.rise}`} data-delay="2" data-center={center || undefined}>
      Subscribe today and most requests land {day ? `by ${day}` : "in about two days"}. Unlimited requests,
      $4,995 a month, no contracts.
    </p>
  );
}

function Buttons({ center = false }: { center?: boolean }) {
  return (
    <div className={`${styles.buttons} ${styles.rise}`} data-delay="3" data-center={center || undefined}>
      <button type="button" className={styles.primary} onClick={() => openAskBox("pricing")}>
        See plans
      </button>
      <button type="button" className={styles.secondary} onClick={() => openAskBox("booking")}>
        Book a call
      </button>
    </div>
  );
}

/** 1. Split-flap: each digit on its own dark tile, flipping as it changes. */
function Flap({ value }: { value: string }) {
  return (
    <span className={styles.flap}>
      <span key={value} className={styles.flapFace}>
        {value}
      </span>
    </span>
  );
}

function FlipClock() {
  const { day, hh, mm, ss } = useCountdown();
  const group = (v: string) => (
    <span className={styles.flapGroup}>
      <Flap value={v[0]} />
      <Flap value={v[1]} />
    </span>
  );
  return (
    <section className={styles.hero}>
      <div className={styles.center}>
        <span className={`${styles.label} ${styles.rise}`}>Your first design, in about</span>
        <div className={`${styles.flaps} ${styles.rise}`} data-delay="1" aria-label={`${hh} hours ${mm} minutes`}>
          {group(hh)}
          <span className={styles.flapColon}>:</span>
          {group(mm)}
          <span className={styles.flapColon}>:</span>
          {group(ss)}
        </div>
        <Paragraph day={day} />
        <Buttons center />
      </div>
    </section>
  );
}

/** 2. A ring that empties over the 48 hours, with the time in the middle and
 *  a thin inner ring sweeping each minute. */
function Ring() {
  const { left, day, hh, mm, ss } = useCountdown();
  const r = 46;
  const c = 2 * Math.PI * r;
  const r2 = 41;
  const c2 = 2 * Math.PI * r2;
  return (
    <section className={styles.hero}>
      <div className={styles.center}>
        <div className={`${styles.ring} ${styles.rise}`}>
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r={r} className={styles.ringTrack} />
            <circle
              cx="50"
              cy="50"
              r={r}
              className={styles.ringFill}
              strokeDasharray={c}
              strokeDashoffset={c * (1 - left / TOTAL)}
              transform="rotate(-90 50 50)"
            />
            <circle
              cx="50"
              cy="50"
              r={r2}
              className={styles.ringSeconds}
              strokeDasharray={`1.2 ${c2}`}
              strokeDashoffset={-c2 * ((60 - Number(ss)) % 60) / 60}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className={styles.ringText}>
            <span className={styles.label}>First design in</span>
            <span className={styles.ringTime}>
              {hh}:{mm}
              <span className={styles.muted}>:{ss}</span>
            </span>
          </div>
        </div>
        <Paragraph day={day} />
        <Buttons center />
      </div>
    </section>
  );
}

/** 3. The next three days as a timeline, filling towards the delivery day. */
function Timeline() {
  const { left, day, hh, mm, ss } = useCountdown();
  const [names, setNames] = useState(["Today", "Tomorrow", ""]);
  useEffect(() => {
    setNames(["Today", "Tomorrow", DAYS[(new Date().getDay() + 2) % 7]]);
  }, []);
  const done = 1 - left / TOTAL;
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
        <div className={`${styles.timeline} ${styles.rise}`} data-delay="2">
          <div className={styles.track}>
            <b style={{ transform: `scaleX(${Math.max(done, 0.004)})` }} />
          </div>
          {names.map((n, i) => (
            <div key={i} className={styles.stop} data-last={i === 2 || undefined}>
              <i aria-hidden="true" />
              <span>{n}</span>
              <span className={styles.label}>{["Subscribe", "Designing", "Delivered"][i]}</span>
            </div>
          ))}
        </div>
        <Paragraph day={day} />
        <Buttons center />
      </div>
    </section>
  );
}

/** 4. Editorial: hours, minutes and seconds as three labelled columns. */
function Columns() {
  const { day, hh, mm, ss } = useCountdown();
  return (
    <section className={styles.hero}>
      <span className={`${styles.label} ${styles.rise}`}>Your first design, in about</span>
      <div className={`${styles.columns} ${styles.rise}`} data-delay="1">
        {[
          [hh, "Hours"],
          [mm, "Minutes"],
          [ss, "Seconds"],
        ].map(([v, l]) => (
          <div key={l}>
            <span className={styles.columnValue}>{v}</span>
            <span className={styles.label}>{l}</span>
          </div>
        ))}
      </div>
      <div className={styles.split}>
        <Paragraph day={day} center={false} />
        <Buttons />
      </div>
    </section>
  );
}

/** 5. Odometer digits that roll into place, over a bar of time used. */
function Roll({ value }: { value: string }) {
  return (
    <span className={styles.roll}>
      <span className={styles.rollStrip} style={{ transform: `translateY(${-Number(value) * 10}%)` }}>
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n}>{n}</span>
        ))}
      </span>
    </span>
  );
}

function Odometer() {
  const { day, hh, mm, ss } = useCountdown();
  const digits = `${hh}:${mm}:${ss}`;
  return (
    <section className={styles.hero}>
      <div className={styles.center}>
        <span className={`${styles.label} ${styles.rise}`}>Your first design, in about</span>
        <span className={`${styles.clock} ${styles.odometer} ${styles.rise}`} data-delay="1" aria-label={digits}>
          {[...digits].map((ch, i) => (ch === ":" ? <i key={i}>:</i> : <Roll key={i} value={ch} />))}
        </span>
        <Paragraph day={day} />
        <Buttons center />
      </div>
    </section>
  );
}

const VARIANTS = [
  { name: "Flip clock", Hero: FlipClock },
  { name: "Ring", Hero: Ring },
  { name: "Timeline", Hero: Timeline },
  { name: "Columns", Hero: Columns },
  { name: "Odometer", Hero: Odometer },
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
