"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import styles from "./RecapsReel.module.css";

const DIR = "/work/recaps";
const STATE_MS = 4200;

// The Figma frame is 1681 × 1314; the tile shows it in the uploads' 1440 ×
// 1024 shape, so 119 of its pixels come off the top (the bottoms of the cards
// above, which are mostly empty).
const CROP = 119;
// The website sits in the frame at (224.474, -5089.013); layers inside it
// are placed in its coordinates.
const SITE_X = 224.474;
const SITE_Y = -5089.013;

/** Places a layer at the design's coordinates, in its pixels (`--u`). With
 *  no size it sizes to its content (rather than taking its parent's). */
const box = (x: number, y: number, w?: number, h?: number) =>
  ({ "--x": x, "--y": y, "--w": w ?? "initial", "--h": h ?? "initial" }) as CSSProperties;
/** A layer of the frame itself (the sky). */
const inFrame = (x: number, y: number, w?: number, h?: number) => box(x, y - CROP, w, h);
/** A layer of the website. */
const onSite = (x: number, y: number, w?: number, h?: number) => box(x + SITE_X, y + SITE_Y - CROP, w, h);
/** A photo turned about its centre (cx, cy), as Figma placed it. */
const turned = (cx: number, cy: number, w: number, h: number, deg: number) =>
  ({ ...box(cx, cy, w, h), "--turn": `${deg}deg` }) as CSSProperties;

// One per bar at the top of the phone: what the phone shows, and the matching
// copy in the card beside it (the site's own copy for each feature).
const STATES = [
  {
    title: "Your market brief",
    detail: "August 1, 2025",
    heading: "Stay informed with recaps",
    body: "Your financial life, summarized each day. Stay in sync with the markets, the news, and your money.",
    tone: "orange",
  },
  {
    title: "Your spending recap",
    detail: "$1,711 in the last 7 days",
    heading: "Track your spending",
    body: "See every transaction, automatically categorized and organized into custom reports so you can spot trends fast",
    tone: "blue",
  },
  {
    title: "Your portfolio",
    detail: "$210,150 · +5.5%",
    heading: "Monitor investment performance",
    body: "From 401(k)s to crypto, track the latest activity across your entire portfolio and compare performance to major indices.",
    tone: "coral",
  },
  {
    title: "Your shared budget",
    detail: "Managed together",
    heading: "Manage money together",
    body: "Create a shared intelligent home for your finances. Add your partner for free.",
    tone: "sky",
  },
  {
    title: "Ask anything",
    detail: "Can I afford a $1.2M home?",
    heading: "Tap into your money",
    body: "With Instant Insights, get instant answers to any money question—personalized to your real financial picture.",
    tone: "amber",
  },
] as const;

// The four blue glows over the card above, right (their 709px images are
// centred on 350px groups).
const GLOWS = [
  [989.038, 4674.434],
  [792.172, 4876.449],
  [962.271, 4884.82],
  [819.903, 4712.893],
];

/**
 * Origin's "Stay informed with recaps" section from the Figma design, set in
 * motion: the phone steps through its recaps (the bars at its top fill as it
 * goes), the card beside it follows with the feature for each, and the
 * gradients and skies drift. It only runs while on screen, and holds on the
 * first recap with reduced motion.
 */
export function RecapsReel({ large = false }: { large?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

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
  const photo = large ? "60vw" : "(min-width: 1600px) 25vw, 50vw";

  return (
    <div
      ref={ref}
      className={styles.tile}
      data-running={visible || undefined}
      style={{ "--state-ms": `${STATE_MS}ms` } as CSSProperties}
      aria-label="Origin: daily recaps, cycling through the market, spending, portfolio, shared budget and insights"
    >
      {/* The sky behind the website, showing down its left edge; its clouds
          are placed within it. */}
      <div className={`${styles.layer} ${styles.sky}`} style={inFrame(0, 0, 2003.85, 2123.524)} aria-hidden="true">
        <div
          className={`${styles.layer} ${styles.cloud} ${styles.driftA}`}
          style={{ ...box(-36.182, 549.667, 5699.84, 3800.357), opacity: 0.68 }}
        >
          <Image src={`${DIR}/cloud-02.webp`} alt="" fill sizes="100vw" className={styles.cover} />
        </div>
        <div
          className={`${styles.layer} ${styles.cloud} ${styles.driftB}`}
          style={{ ...box(-2941.764, -407.728, 3904.834, 2603.54), opacity: 0.3 }}
        >
          <Image src={`${DIR}/cloud-04.webp`} alt="" fill sizes="100vw" className={styles.cover} />
        </div>
        <div
          className={`${styles.layer} ${styles.cloud} ${styles.driftA}`}
          style={{ ...box(630.377, -417.469, 4422.464, 2948.669), opacity: 0.4 }}
        >
          <Image src={`${DIR}/cloud-02.webp`} alt="" fill sizes="100vw" className={styles.cover} />
        </div>
      </div>

      {/* The website: black, from here to the right edge. */}
      <div className={`${styles.layer} ${styles.site}`} style={box(SITE_X, 0)} aria-hidden="true" />

      {/* The bottoms of the two cards above. */}
      <div className={`${styles.layer} ${styles.glass}`} style={onSite(51.708, 4611.351, 677.379, 679.447)} />
      <div className={`${styles.layer} ${styles.glass}`} style={onSite(754.942, 4611.351, 677.379, 679.447)} />
      {GLOWS.map(([x, y], i) => (
        <div
          key={i}
          className={`${styles.layer} ${styles.glow}`}
          style={{ ...onSite(x - 179.526, y - 179.526, 709.26, 709.26), "--i": i } as CSSProperties}
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${DIR}/glow-${i + 1}.svg`} alt="" />
        </div>
      ))}

      {/* The recap card: a sky, and the phone on it. */}
      <div className={`${styles.layer} ${styles.card}`} style={onSite(51.708, 5316.652, 677.379, 679.447)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${DIR}/card-mask.svg`} alt="" className={styles.fill} />
        <div className={`${styles.turned} ${styles.driftA}`} style={turned(-210.75, 66.92, 1279.376, 1916.724, -85.41)}>
          <Image src={`${DIR}/sky-rawpixel.webp`} alt="" fill sizes={photo} className={styles.cover} />
        </div>
        <div className={`${styles.turned} ${styles.driftSky}`} style={turned(885.24, -13.85, 2439.561, 3658.895, -23.2)}>
          <Image src={`${DIR}/sky-davies.jpg`} alt="" fill sizes={large ? "200vw" : "100vw"} className={styles.cover} />
        </div>

        <div className={`${styles.layer} ${styles.phone}`} style={box(163.398, 110.656, 350.149, 640.149)}>
          {STATES.map((s, i) => (
            <div
              key={s.tone}
              className={`${styles.layer} ${styles.screen}`}
              data-tone={s.tone}
              data-on={i === current || undefined}
              style={box(-20.021, 0, 381.158, 663.605)}
            >
              <div className={styles.gradient} />
            </div>
          ))}

          <div className={styles.bars} style={box(113.283, 38.186)}>
            {STATES.map((s, i) => (
              <span key={s.tone} data-done={i < current || undefined} data-now={i === current || undefined}>
                <i key={i === current ? `${current}` : "idle"} />
              </span>
            ))}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${DIR}/close.svg`} alt="" className={styles.close} style={box(306.615, 28.246, 14.09, 14.09)} />

          {/* A new key each time, so the screen's content animates in. */}
          <div key={current} className={styles.brief}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${DIR}/logo.svg`} alt="" className={styles.logo} style={box(153.023, 249.219, 35.444, 35.444)} />
            <p className={styles.title} style={box(169.974, 299.395)}>
              {state.title}
            </p>
            <p className={styles.detail} style={box(173.846, 331.328)}>
              {state.detail}
            </p>
          </div>
        </div>
      </div>

      {/* The card beside it, following along. */}
      <div className={`${styles.layer} ${styles.glass}`} style={onSite(754.942, 5316.652, 677.379, 679.447)}>
        <div key={current} className={styles.copy}>
          <p className={styles.heading}>{state.heading}</p>
          <p className={styles.body}>{state.body}</p>
        </div>
      </div>

      {/* "Own your wealth", its glow rising behind it. */}
      <div className={`${styles.layer} ${styles.band}`} style={onSite(20.682, 6126.404, 1447.833, 812.855)} aria-hidden="true">
        <div className={`${styles.layer} ${styles.bandArt}`} style={box(-496.396, -461.24, 2512.734, 1413.413)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${DIR}/band.svg`} alt="" />
        </div>
      </div>
      <p className={styles.wealth} style={onSite(744.512, 6271.188)}>
        <em>Own</em> your wealth
      </p>
      <p className={styles.forecast} style={onSite(744.6, 6377.707, 614.295)}>
        Forecast your net worth and cash flow—instantly modeling life’s “what-if” scenarios like buying a home or
        changing careers. Get clear, real-time summaries that show how life decisions impact your money.
      </p>
    </div>
  );
}
