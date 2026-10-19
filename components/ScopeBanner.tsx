"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { scopeOfWork } from "@/content/site";
import styles from "./ScopeBanner.module.css";

/*
 * Ways to show the scope of work in a band across the top of the work,
 * previewed with ?scope=1…5 and a small switcher. Without ?scope there's
 * no band.
 */
const VARIANTS = ["Marquee", "Rolling word", "Spotlight", "Typewriter", "Floating chips"] as const;

function useVariant() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const v = Number(new URLSearchParams(window.location.search).get("scope"));
    if (v >= 1 && v <= VARIANTS.length) setN(v);
  }, []);
  const go = (to: number) => {
    const next = ((to - 1 + VARIANTS.length) % VARIANTS.length) + 1;
    const url = new URL(window.location.href);
    url.searchParams.set("scope", String(next));
    window.history.replaceState(null, "", url);
    setN(next);
  };
  return [n, go] as const;
}

/** Steps through the services every `ms`, unless motion is reduced. */
function useStep(ms: number, active: boolean) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setI((n) => (n + 1) % scopeOfWork.length), ms);
    return () => clearInterval(timer);
  }, [ms, active]);
  return i;
}

/** Types a service out letter by letter, holds it, deletes it, then the next. */
function useTypewriter(active: boolean) {
  const [state, setState] = useState({ i: 0, len: 0, deleting: false });
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState({ i: 0, len: scopeOfWork[0].length, deleting: false });
      return;
    }
    const word = scopeOfWork[state.i];
    const done = !state.deleting && state.len === word.length;
    const gone = state.deleting && state.len === 0;
    const delay = done ? 1400 : gone ? 250 : state.deleting ? 28 : 55;
    const timer = setTimeout(() => {
      setState((s) =>
        done
          ? { ...s, deleting: true }
          : gone
            ? { i: (s.i + 1) % scopeOfWork.length, len: 0, deleting: false }
            : { ...s, len: s.len + (s.deleting ? -1 : 1) },
      );
    }, delay);
    return () => clearTimeout(timer);
  }, [state, active]);
  return scopeOfWork[state.i].slice(0, state.len);
}

const Smile = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/icons/smile.svg" alt="" className={styles.smile} width={26} height={26} />
);

export function ScopeBanner() {
  const [variant, go] = useVariant();
  const step = useStep(variant === 3 ? 1300 : 1800, variant === 2 || variant === 3 || variant === 5);
  const typed = useTypewriter(variant === 4);
  if (!variant) return null;

  const half = Math.ceil(scopeOfWork.length / 2);
  const rows = [scopeOfWork.slice(0, half), scopeOfWork.slice(half)];

  let body: React.ReactNode;
  if (variant === 1) {
    body = (
      <div className={styles.marquee} aria-hidden="true">
        {rows.map((row, r) => (
          <div key={r} className={styles.track} data-reverse={r === 1 || undefined}>
            {[0, 1].map((copy) => (
              <span key={copy} className={styles.run}>
                {row.map((s) => (
                  <span key={s} className={styles.item}>
                    {s}
                    <Smile />
                  </span>
                ))}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  } else if (variant === 2) {
    body = (
      <div className={styles.rolling}>
        <span className={styles.lead}>We do</span>
        <span className={styles.window} aria-live="polite">
          <span className={styles.reel} style={{ "--i": step } as CSSProperties}>
            {scopeOfWork.map((s) => (
              <span key={s}>{s}.</span>
            ))}
          </span>
        </span>
        <span className={styles.count}>
          {String(step + 1).padStart(2, "0")} / {scopeOfWork.length}
        </span>
      </div>
    );
  } else if (variant === 3) {
    body = (
      <p className={styles.wall}>
        {scopeOfWork.map((s, i) => (
          <span key={s} data-on={i === step || undefined}>
            {s}
            {i < scopeOfWork.length - 1 && <i>,</i>}{" "}
          </span>
        ))}
      </p>
    );
  } else if (variant === 4) {
    body = (
      <div className={styles.terminal}>
        <p className={styles.prompt}>
          <span>designjoy</span> <b>›</b> design --type <span className={styles.typed}>&quot;{typed}</span>
          <span className={styles.caret} aria-hidden="true" />
          <span className={styles.typed}>&quot;</span>
        </p>
        <p className={styles.output}>
          {scopeOfWork.length} services · one subscription · ~48h delivery
        </p>
      </div>
    );
  } else {
    body = (
      <div className={styles.cloud}>
        {scopeOfWork.map((s, i) => (
          <span
            key={s}
            className={styles.chip}
            data-on={i === step || undefined}
            style={{ "--d": `${(i * 0.37) % 3}s`, "--r": `${((i * 7) % 5) - 2}deg` } as CSSProperties}
          >
            {s}
          </span>
        ))}
      </div>
    );
  }

  return (
    <section className={styles.band} data-variant={variant} aria-label="Scope of work">
      <div className={styles.head}>
        <p className={styles.label}>Scope of work</p>
        <p className={styles.sub}>Everything you need, one subscription.</p>
      </div>
      {body}
      {/* Screen readers get the plain list. */}
      <ul className="visually-hidden">
        {scopeOfWork.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      {createPortal(
        <div className={styles.switcher} role="group" aria-label="Scope band preview">
          <button type="button" onClick={() => go(variant - 1)} aria-label="Previous">
            ‹
          </button>
          <span>
            <b>{variant}</b>/{VARIANTS.length} · {VARIANTS[variant - 1]}
          </span>
          <button type="button" onClick={() => go(variant + 1)} aria-label="Next">
            ›
          </button>
        </div>,
        document.body,
      )}
    </section>
  );
}
