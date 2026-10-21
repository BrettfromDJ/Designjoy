"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./QuoteableReel.module.css";

const DIR = "/work/quoteable";
// The app's home screen sits in the Figma frame at (610, 114); its layers
// are placed in its own coordinates.
const HOME_X = 610;
const HOME_Y = 114;
const STEP_MS = 1600;
// How long the portrait shows before it turns back into the app.
const PORTRAIT_MS = 3800;
// The colour blocks turn a quarter about this point (in the frame) to go
// from one design to the other: it's where the two layouts line up.
const PIVOT = [717.2, 595.2];

/** Places a layer at the design's coordinates, in its pixels (`--u`). With
 *  no size it sizes to its content (rather than taking its parent's). */
const box = (x: number, y: number, w?: number, h?: number) =>
  ({ "--x": x, "--y": y, "--w": w ?? "initial", "--h": h ?? "initial" }) as CSSProperties;

// The sidebar's pages, as placed in the design: the icon's top, and how its
// drawing is inset in its 58.4px box (top, right, bottom, left, in %).
const PAGES = [
  { name: "Home", icon: "home", top: 341.86, inset: [3.57, 3.57, 3.57, 3.57] },
  { name: "Quotes", icon: "script", top: 508.41, inset: [0, 0, 0, 0] },
  { name: "Workflows", icon: "workflow", top: 660.34, inset: [0, 7.15, 0, 7.14] },
  { name: "Knowledge", icon: "book", top: 812.28, inset: [3.97, 3.57, 8.13, 3.57] },
];
const ICON_X = 134.41;
const ICON = 58.438;
// The dark button sits 32.14px above and 35.07px left of its icon.
const BUTTON_X = 99.34;
const BUTTON_OFFSET = 32.14;

/**
 * Quoteable, from two Figma designs that share their colour blocks: the
 * app's home screen, and a portrait card. A cursor steps through the app's
 * sidebar (the dark button following each click); then the blocks turn a
 * quarter as the app's window closes in to the portrait, and after a while
 * it all turns back. It only runs while on screen, and holds on the app with
 * reduced motion.
 */
export function QuoteableReel() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  // Where the cursor is headed, and the page it has clicked.
  const [target, setTarget] = useState(0);
  const [active, setActive] = useState(0);
  const [scene, setScene] = useState<"app" | "portrait">("app");

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The cursor moves to the next page, then clicks it, down to the last.
  useEffect(() => {
    if (!visible || scene !== "app" || active === PAGES.length - 1) return;
    const move = setTimeout(() => setTarget((t) => t + 1), STEP_MS - 550);
    return () => clearTimeout(move);
  }, [visible, scene, active]);

  useEffect(() => {
    if (!visible || target === active) return;
    const click = setTimeout(() => setActive(target), 480);
    return () => clearTimeout(click);
  }, [visible, target, active]);

  // After the last page, over to the portrait; after a while, back, the app
  // starting again from Home (reset while it's out of sight).
  useEffect(() => {
    if (!visible) return;
    if (scene === "app") {
      if (active !== PAGES.length - 1) return;
      const turn = setTimeout(() => setScene("portrait"), 900);
      return () => clearTimeout(turn);
    }
    const reset = setTimeout(() => {
      setTarget(0);
      setActive(0);
    }, 1100);
    const back = setTimeout(() => setScene("app"), PORTRAIT_MS);
    return () => {
      clearTimeout(reset);
      clearTimeout(back);
    };
  }, [visible, scene, active]);

  const page = PAGES[active];
  const pointed = PAGES[target];

  return (
    <div
      ref={ref}
      className={styles.tile}
      data-running={visible || undefined}
      data-scene={scene}
      aria-label="Quoteable: a quoting app's home screen, its sidebar in motion, turning into a portrait and back"
    >
      {/* The colour blocks behind it all; for the portrait they turn a
          quarter about PIVOT (and the second design has them just so). */}
      <div
        className={`${styles.layer} ${styles.blocks}`}
        style={{ ...box(0, 0, 1532.81, 1092), "--px": PIVOT[0], "--py": PIVOT[1] } as CSSProperties}
      >
        <div className={`${styles.layer} ${styles.sunset}`} style={box(0, 0, 451.328, 1092)} />
        <div className={styles.layer} style={{ ...box(451.33, 0, 451.328, 363.645), background: "#a6c1f1" }} />
        <div className={styles.layer} style={{ ...box(451.33, 363.64, 451.328, 364.711), background: "#e1d4e6" }} />
        <div className={styles.layer} style={{ ...box(451.33, 728.36, 451.328, 363.645), background: "#fedaa7" }} />
        <div className={styles.layer} style={{ ...box(902.66, 0, 315.078, 1092), background: "#e9b175" }} />
        <div className={styles.layer} style={{ ...box(1217.73, 0, 315.078, 1092), background: "#f2f2e4" }} />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${DIR}/paper.webp`}
        alt=""
        className={`${styles.layer} ${styles.paper}`}
        style={box(-1299.55, -901.25, 4779.359, 3186.628)}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${DIR}/writing.webp`}
        alt=""
        className={`${styles.layer} ${styles.writing}`}
        style={box(-395, 569, 895, 596.667)}
      />

      {/* The window: the app's screen, closing in to the portrait card. */}
      <div className={`${styles.layer} ${styles.window}`} style={box(0, 0, 1532.81, 1090)}>
        <Portrait />
        <div className={`${styles.layer} ${styles.home}`} style={box(HOME_X, HOME_Y, 4207.5, 2992)}>
          {/* Only this part of the cloud picture shows, with room to drift. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${DIR}/clouds.webp`}
            alt=""
            className={`${styles.layer} ${styles.clouds}`}
            style={box(-71.3, -56.34, 1069.4, 1092.4)}
          />
          {/* The picture's fade to white, over its full size. */}
          <div className={`${styles.layer} ${styles.cloudFade}`} style={box(-531.25, -1091.24, 4709.928, 2650.484)} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${DIR}/glow.svg`} alt="" className={styles.layer} style={box(183.96, 765.57, 3839.34, 1142.45)} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${DIR}/paper.webp`}
            alt=""
            className={`${styles.layer} ${styles.paper}`}
            style={box(-1171.68, -17.53, 5495.711, 3664.255)}
          />

          {/* The sidebar. */}
          <div className={`${styles.layer} ${styles.nav}`} style={box(52.59, 46.75, 222.063, 2898.5)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${DIR}/paper.webp`}
              alt=""
              className={`${styles.layer} ${styles.paper}`}
              style={box(-1119.08 - 52.59, 29.22 - 46.75, 5495.711, 3664.255)}
            />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${DIR}/logo.svg`} alt="" className={styles.layer} style={box(111.03, 105.19, 108.036, 108.027)} />
          {[260.05].map((y) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={y}
              src={`${DIR}/divider.svg`}
              alt=""
              className={styles.layer}
              style={box(52.59, y - 1.461, 222.062, 5.844)}
            />
          ))}
          <div
            className={`${styles.layer} ${styles.button}`}
            style={
              {
                ...box(BUTTON_X, PAGES[0].top - BUTTON_OFFSET, 128.562, 128.562),
                "--to": page.top - PAGES[0].top,
              } as CSSProperties
            }
          >
            {/* A ripple as each click lands (a new key replays it). */}
            {visible && <i key={active} className={styles.ripple} />}
          </div>
          {PAGES.map((p, i) => (
            <span
              key={p.name}
              className={`${styles.layer} ${styles.iconBox}`}
              data-on={i === active || undefined}
              style={box(ICON_X, p.top, ICON, ICON)}
            >
              <i
                className={styles.icon}
                style={
                  {
                    "--icon": `url(${DIR}/${p.icon}.svg)`,
                    inset: p.inset.map((n) => `${n}%`).join(" "),
                  } as CSSProperties
                }
              />
            </span>
          ))}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${DIR}/rates.svg`} alt="" className={styles.layer} style={box(ICON_X, 967.14, ICON, ICON)} />

          <p className={`${styles.layer} ${styles.greeting}`} style={box(575.61, 487.95)}>
            Good morning, <em>Ryan</em>
          </p>

          {/* The ask box. */}
          <div className={`${styles.layer} ${styles.ask}`} style={box(575.61, 689.56, 3330.938, 257.125)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${DIR}/paper-ask.webp`}
              alt=""
              className={`${styles.layer} ${styles.paper}`}
              style={box(534.71 - 575.61, 672.03 - 689.56, 3371.844, 303.875)}
            />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${DIR}/sparkle.svg`}
            alt=""
            className={`${styles.layer} ${styles.sparkle}`}
            style={box(671.93, 786.0, 61.359, 61.359)}
          />
          {/* Cut off by the frame after its first words, as in the design. */}
          <p className={`${styles.layer} ${styles.placeholder}`} style={box(768.45, 785.98)}>
            Ask Quoteable — “draft an add-on for the Northbound shoot”
          </p>

          {/* The cursor, stepping through the sidebar. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${DIR}/cursor.svg`}
            alt=""
            className={`${styles.layer} ${styles.cursor}`}
            style={
              {
                ...box(ICON_X + 44, PAGES[0].top + 40, 43.87, 61.881),
                "--to": pointed.top - PAGES[0].top,
              } as CSSProperties
            }
          />
        </div>
      </div>
    </div>
  );
}

/** The second design's card: clouds, the handwriting, the portrait and
 *  paper grain over them (each cropped to what the card shows). */
function Portrait() {
  return (
    <div className={`${styles.layer} ${styles.portrait}`} style={box(0, 0, 1532.81, 1090)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${DIR}/portrait-clouds.webp`}
        alt=""
        className={`${styles.layer} ${styles.cover} ${styles.portraitClouds}`}
        style={box(354.41, 69.63, 828.75, 1022.12)}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${DIR}/writing.webp`}
        alt=""
        className={`${styles.layer} ${styles.cardWriting}`}
        style={box(156.92, -110.21, 1421.471, 947.647)}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${DIR}/portrait.webp`}
        alt=""
        className={`${styles.layer} ${styles.person}`}
        style={box(540.44, 182.49, 586.207, 802.24)}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${DIR}/portrait-paper.webp`}
        alt=""
        className={`${styles.layer} ${styles.cover} ${styles.softLight}`}
        style={box(405.44, 114, 721.21, 866.84)}
      />
    </div>
  );
}
