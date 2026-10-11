"use client";

import { useEffect, useState, type RefObject } from "react";

/** How long each image shows when a project cycles through several. */
export const FRAME_MS = 650;

/**
 * Steps through `count` frames on a loop, like a GIF. It only runs while
 * `ref` is on screen, and holds on the first frame for reduced motion.
 */
export function useFrameCycle(
  count: number,
  ref: RefObject<Element | null>,
  /** Change it (e.g. to the item's id) when `ref` moves to a new element. */
  key?: string,
) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setIndex(0);
    const el = ref.current;
    if (!el || count < 2) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, count, key]);

  useEffect(() => {
    if (!visible || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), FRAME_MS);
    return () => clearInterval(timer);
  }, [visible, count]);

  return count < 2 ? 0 : index % count;
}
