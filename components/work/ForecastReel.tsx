"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import styles from "./ForecastReel.module.css";

const DIR = "/work/forecast";
const STATE_MS = 4600;

// One per tab of the card: the three figures above the chart, how high the
// forecast reaches (against the design's, 1), and where most outcomes land.
// The last is the design's own; the reel opens on it.
const STATES = [
  { tab: "Net worth", success: 72, median: 1240560, typical: "$1,100,000", ret: 7.12, reach: 0.84 },
  { tab: "Cash flow", success: 91, median: 642310, typical: "$550,000", ret: 5.08, reach: 0.66 },
  { tab: "Success %", success: 85, median: 879138, typical: "$800,000", ret: 6.54, reach: 1 },
];
const FIRST = STATES.length - 1;

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** Counts from the last values to these, easing out, each time they change. */
function useCount(target: number[], ms = 1100) {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const start = performance.now();
    const begin = from.current;
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - start) / ms);
      const e = 1 - (1 - t) ** 4;
      const next = target.map((v, i) => begin[i] + (v - begin[i]) * e);
      from.current = next;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
    // The values, not the array, are what change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.join(), ms]);
  return shown;
}

/**
 * Origin's "Compare scenarios" card from the Figma design (a 4912 × 3840
 * frame, drawn at that size and scaled to the tile), set in motion: the card
 * steps through its tabs, the figures count to each tab's, and the forecast
 * rises and falls to match, its marker riding the median. The clouds drift
 * behind. It only runs while on screen, and holds on the design's own tab
 * with reduced motion.
 */
export function ForecastReel() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(FIRST);

  // Scaled to the tile's width (before it paints, and on every resize).
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => el.style.setProperty("--k", String(el.clientWidth / 4912));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setCurrent((c) => (c + 1) % STATES.length), STATE_MS);
    return () => clearTimeout(timer);
  }, [visible, current]);

  const state = STATES[current];
  const [success, median, ret] = useCount([state.success, state.median, state.ret]);
  // How far the marker drops with the forecast (it sits 106px above its foot).
  const drop = 106 * (1 - state.reach);

  return (
    <div
      ref={ref}
      className={styles.tile}
      aria-label="Origin: compare scenarios, stepping through net worth, cash flow and chance of success"
    >
      <div className={styles.stage} data-play={visible || undefined}>
        {/* The sky, and its clouds. */}
        <div className={styles.sky} aria-hidden="true">
          <div className={`${styles.cloud} ${styles.driftA}`} style={box(-105.73, 1606.33, 16657.066, 11106.066, 0.68)}>
            <Image src="/work/recaps/cloud-02.webp" alt="" fill sizes="50vw" className={styles.cover} />
          </div>
          <div className={`${styles.cloud} ${styles.driftB}`} style={box(-8596.93, -1191.53, 11411.387, 7608.52, 0.3)}>
            <Image src="/work/recaps/cloud-04.webp" alt="" fill sizes="50vw" className={styles.cover} />
          </div>
          <div className={`${styles.cloud} ${styles.driftA}`} style={box(1842.2, -1220, 12924.094, 8617.115, 0.4)}>
            <Image src="/work/recaps/cloud-02.webp" alt="" fill sizes="50vw" className={styles.cover} />
          </div>
        </div>

        {/* The page, and the foot of the section above. */}
        <div className={styles.page} />
        <div className={styles.above} />

        <section className={styles.card}>
          <div className={styles.inner}>
            <div className={styles.heading}>
              <h3 className={styles.title}>
                <em>Compare</em> <span>scenarios</span>
              </h3>
              <p className={styles.lede}>
                See an instant projection of your net worth and cash flow based on your finances today and goals for
                tomorrow.
              </p>
            </div>

            <div className={styles.paper}>
              <div className={styles.tabs} style={{ "--at": current } as CSSProperties}>
                <span className={styles.highlight} aria-hidden="true" />
                {STATES.map((s, i) => (
                  <span key={s.tab} className={styles.tab} data-on={i === current || undefined}>
                    {s.tab}
                  </span>
                ))}
              </div>

              <div className={styles.figures}>
                <div>
                  <p className={styles.label}>Chance of success at 90</p>
                  <p className={styles.figure}>{Math.round(success)}%</p>
                  <p className={styles.note}>
                    After factoring in your events, you meet or exceed your target net worth in {state.success}% of the
                    simulations.
                  </p>
                </div>
                <div>
                  <p className={styles.label}>Median net worth at 90</p>
                  <p className={styles.figure}>{money(median)}</p>
                  {/* Set as outlines in the design; here as the text itself. */}
                  <p className={`${styles.note} ${styles.median}`}>
                    Most outcomes are concentrated around <b>{state.typical},</b> which is the median result, making it a
                    useful indicator of where you’re likely to land.
                  </p>
                </div>
                <div>
                  <p className={styles.label}>Projected average annual return</p>
                  <p className={styles.figure}>{ret.toFixed(2)}%</p>
                  <p className={styles.note}>
                    Your investment and retirement accounts are projected to [grow/shrink] at an average rate of X.XX%
                    per year for the next XX years, adjusted for inflation.
                  </p>
                </div>
              </div>

              <div className={styles.chart} aria-hidden="true">
                <div className={styles.plot}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${DIR}/verticals.svg`} alt="" className={styles.at} style={box(96.43 - 2.92, 143.19 - 87.67 - 1.79, 2872.544, 780.818)} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${DIR}/horizontals.svg`} alt="" className={styles.at} style={box(0, 143.19 - 87.67 - 1.77, 2966.056, 777.896)} />
                  <div className={styles.xLabels} style={box(-2.92, 938.03 - 87.67, 2968.978)}>
                    {["Today", "Age 50", "Age 60", "Age 70", "Age 80", "Age 90"].map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                  <div className={styles.yLabels} style={box(3039.11 - 2.92, 143.19 - 87.67)}>
                    {["$120k", "$100K", "$800K", "$60k", "$40k", "$20k"].map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                </div>

                {/* The forecast and the marker's stem, rising and falling
                    about the chart's foot. */}
                <div className={styles.reach} style={{ "--reach": state.reach } as CSSProperties}>
                  <div className={styles.bands} style={box(256.3, 244.65, 2710.13, 593.406)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${DIR}/bands.svg`} alt="" />
                    <span className={styles.shine} key={current} />
                  </div>
                  <div className={styles.stem} style={box(1393.9 - 54.06, 730.56 + 52.6 - 1.46, 108.122, 2.922)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${DIR}/stem.svg`} alt="" />
                  </div>
                </div>

                <div className={`${styles.chip} ${styles.zero}`} style={box(74.52 - 2.92, 772.93 - 87.67)}>
                  $0.00
                </div>
                <div className={`${styles.chip} ${styles.target}`} style={box(2473.66 - 2.92, 191.41 - 87.67)}>
                  Target: $100,000
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${DIR}/info.svg`} alt="" />
                </div>
                <div className={styles.marker} style={{ ...box(1347.14, 683.8, 93.511, 93.511), translate: `0 ${drop}px` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${DIR}/palm.svg`} alt="" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/** Places a layer at the design's coordinates. */
function box(left: number, top: number, width?: number, height?: number, opacity?: number): CSSProperties {
  return { position: "absolute", left, top, width, height, opacity };
}
