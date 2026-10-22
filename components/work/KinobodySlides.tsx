import type { CSSProperties, ReactNode } from "react";
import styles from "./BrandReel.module.css";
import own from "./KinobodySlides.module.css";

// The six Kinobody rebrand slides from the Figma file, each drawn at its own
// 1440 × 1024 and placed in the design's pixels (the reel scales them to the
// tile). Classes from BrandReel.module.css bring each one in as it shows.

const DIR = "/work/kinobody";
const src = (name: string) => `${DIR}/${name}`;

type Box = [left: number, top: number, width?: number, height?: number];

const at = ([left, top, width, height]: Box, extra?: CSSProperties): CSSProperties => ({
  position: "absolute",
  left,
  top,
  width,
  height,
  ...extra,
});

/** A motion's delay (ms), as styles. */
const play = (delay = 0): CSSProperties => ({ "--d": `${delay}ms` }) as CSSProperties;

const GREY = "#9fa09f";

function Art({ name, box, className, style }: { name: string; box: Box; className?: string; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src(name)} alt="" className={`${styles.art} ${className ?? ""}`} style={at(box, style)} />
  );
}

/** A photo filling the slide (each was cropped to just what its slide
 *  shows), with a small version for phones. */
function Photo({ name, className }: { name: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src(`${name}.webp`)}
      srcSet={`${src(`${name}-800.webp`)} 800w, ${src(`${name}.webp`)} 1600w`}
      sizes="(min-width: 820px) 75vw, 60vw"
      alt=""
      className={`${styles.art} ${styles.cover} ${className ?? ""}`}
      style={at([0, 0, 1440, 1024])}
    />
  );
}

/** A label in the brand's mono, turned to run up (or down) the page. */
function Label({
  box,
  down,
  wide,
  color = "#000",
  className,
  style,
  children,
}: {
  box: Box;
  down?: boolean;
  wide?: boolean;
  color?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className={`${styles.turned} ${className ?? ""}`} style={at(box, style)}>
      <p
        className={`${own.mono} ${wide ? own.wide : ""}`}
        style={{ color, ...(down && { rotate: "90deg" }), ...(wide && { width: box[3] }) }}
      >
        {children}
      </p>
    </div>
  );
}

/** One of the dashed construction lines round the mark, 741 long, centred
 *  on (x, y); turned upright with `upright`. */
function Dash({ x, y, upright, delay }: { x: number; y: number; upright?: boolean; delay: number }) {
  return (
    <Art
      name="k2-dash.svg"
      box={[x - 370.5, y - 0.72, 741, 1.442]}
      className={styles.wipe}
      style={{ ...(upright && { rotate: "-90deg" }), ...play(delay) }}
    />
  );
}

// ---------- 1. Business cards ----------
function CardsSlide() {
  return (
    <div className={styles.slide} style={{ background: "#a2a2a2" }}>
      <Photo name="k1-cards" className={own.deal} />
      <Label box={[40, 40, 25, 84]} className={styles.fade} style={play(500)}>
        KINOBODY
      </Label>
    </div>
  );
}

// ---------- 2. The icon mark, on its grid ----------
function IconMarkSlide() {
  return (
    <div className={styles.slide} style={{ background: "#000" }}>
      <Dash x={720.5} y={351} delay={0} />
      <Dash x={720.5} y={512} delay={80} />
      <Dash x={720.5} y={673} delay={160} />
      <Dash x={526.22} y={511.5} upright delay={120} />
      <Dash x={720.5} y={511.5} upright delay={200} />
      <Dash x={915.22} y={511.5} upright delay={280} />
      <Art name="k-mark.svg" box={[524.3, 351.08, 390.703, 321.84]} className={own.slashIn} style={play(450)} />
      <p className={`${own.reg} ${styles.fade}`} style={{ left: 931, top: 282, ...play(1000) }}>
        ®
      </p>
      <Label box={[40, 40, 25, 84]} color={GREY}>
        KINOBODY
      </Label>
      <Label box={[1375, 890, 25, 94]} down color={GREY} className={styles.fade} style={play(900)}>
        ICON MARK
      </Label>
    </div>
  );
}

// ---------- 3. The lockup ----------
function LockupSlide() {
  return (
    <div className={styles.slide} style={{ background: "#000" }}>
      <p className={`${own.wordmark} ${styles.rise}`} style={{ left: 360, top: 655, ...play(350) }}>
        Kinobody
      </p>
      <p className={`${own.reg} ${styles.fade}`} style={{ left: 1316, top: 701, ...play(800) }}>
        ®
      </p>
      <Label box={[367, 418, 50, 206]} wide color={GREY} className={styles.fade} style={play(700)}>
        Revolutionary transformation
      </Label>
      <Label box={[367, 117, 25, 100]} wide color={GREY} className={styles.fade} style={play(800)}>
        KINOBODY
      </Label>
      <Art name="k-mark.svg" box={[845, 119, 495.297, 408]} className={own.slashIn} style={play(150)} />
      <div className={styles.drawUp} style={at([0, 0, 101, 1024], { background: "#ff5300" })} />
    </div>
  );
}

// ---------- 4. The swing tag ----------
function TagSlide() {
  return (
    <div className={styles.slide} style={{ background: "#a2a2a2" }}>
      {/* (Its label is under the photo in the design, so not drawn.) */}
      <Photo name="k4-tag" className={own.swing} />
    </div>
  );
}

// ---------- 5. Paper bags ----------
function BagsSlide() {
  return (
    <div className={styles.slide} style={{ background: "#a2a2a2" }}>
      <Photo name="k5-bags" className={styles.settle} />
      <Label box={[40, 40, 25, 84]} className={styles.fade} style={play(500)}>
        KINOBODY
      </Label>
    </div>
  );
}

// ---------- 6. The box ----------
function BoxSlide() {
  return (
    <div className={styles.slide} style={{ background: "#a2a2a2" }}>
      {/* (Its label is under the photo in the design, so not drawn.) */}
      <Photo name="k6-box" className={own.hoist} />
    </div>
  );
}

export const KINOBODY_SLIDES = [CardsSlide, IconMarkSlide, LockupSlide, TagSlide, BagsSlide, BoxSlide];
