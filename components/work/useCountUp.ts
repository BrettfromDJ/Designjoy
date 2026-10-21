import { useEffect, useState } from "react";

/**
 * Counts from 0 up to `target` (easing out) each time `play` changes, after
 * `delay` ms. Before the first play, and with reduced motion, it's `target`.
 */
export function useCountUp(target: number, play: number, delay = 500, duration = 1400) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    if (!play) return;
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / duration));
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, play, delay, duration]);
  return value;
}
