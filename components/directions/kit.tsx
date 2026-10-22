"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode, type RefObject } from "react";
import styles from "./kit.module.css";

/**
 * Holds the page in one theme (the art direction needs it), whatever the
 * visitor picked; leaving the page puts their choice back. The inline script
 * sets it before the page first paints.
 */
export function ForceTheme({ theme }: { theme: "light" | "dark" }) {
  const set =
    theme === "light" ? 'document.documentElement.dataset.theme="light"' : "delete document.documentElement.dataset.theme";
  useEffect(() => {
    const before = document.documentElement.dataset.theme;
    if (theme === "light") document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    return () => {
      if (before) document.documentElement.dataset.theme = before;
      else delete document.documentElement.dataset.theme;
    };
  }, [theme]);
  return <script dangerouslySetInnerHTML={{ __html: set }} />;
}

/** Calls back once when the element first comes into view. */
export function useInView<T extends Element>(ref: RefObject<T | null>, margin = "0px 0px -12% 0px") {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin]);
  return seen;
}

/**
 * Brings its content in as it's scrolled to: rising (`up`), unmasked line by
 * line from below (`mask`), or out of a blur (`blur`). Without scripting, or
 * with reduced motion, it's simply there.
 */
export function Reveal({
  as: Tag = "div",
  kind = "up",
  delay = 0,
  className = "",
  style,
  children,
}: {
  as?: ElementType;
  kind?: "up" | "mask" | "blur" | "scale";
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref);
  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${className}`}
      data-kind={kind}
      data-in={seen || undefined}
      style={{ "--delay": `${delay}ms`, ...style } as CSSProperties}
    >
      {kind === "mask" ? <span className={styles.maskInner}>{children}</span> : children}
    </Tag>
  );
}

/**
 * How far the page has scrolled through a tall element, 0 at its top
 * reaching the top of the screen to 1 at its bottom reaching the bottom, set
 * on it as --p (no re-renders), and passed to `onProgress` if given.
 */
export function useScrollProgress<T extends HTMLElement>(ref: RefObject<T | null>, onProgress?: (p: number) => void) {
  const callback = useRef(onProgress);
  callback.current = onProgress;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      const span = box.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -box.top / span)) : 0;
      el.style.setProperty("--p", p.toFixed(4));
      callback.current?.(p);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref]);
}

/** A number that counts up to `to` once it's scrolled to. */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1600,
  className,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref);
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - start) / duration);
      setValue(to * (1 - (1 - t) ** 4));
      if (t < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [seen, to, duration]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {Math.round(value).toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
