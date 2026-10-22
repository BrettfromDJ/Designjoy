import type { CSSProperties, ReactNode } from "react";
import styles from "./BrandReel.module.css";
import own from "./OrdinSlides.module.css";

// The eight Ordin identity slides from the Figma file, each drawn at its own
// 1440 × 1024 and placed in the design's pixels (the reel scales them to the
// tile). Classes from BrandReel.module.css bring each one in as it shows.

const DIR = "/work/ordin";
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

function Art({ name, box, className, style }: { name: string; box: Box; className?: string; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src(name)} alt="" className={`${styles.art} ${className ?? ""}`} style={at(box, style)} />
  );
}

/** A photo filling the slide (each was cropped to just what its slide
 *  shows), with a small version for phones: their sharp screens would
 *  otherwise pick the large one, for a difference too small to see there. */
function Photo({ name, box, className }: { name: string; box: Box; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src(`${name}.webp`)}
      srcSet={`${src(`${name}-800.webp`)} 800w, ${src(`${name}.webp`)} 1600w`}
      sizes="(min-width: 820px) 75vw, 60vw"
      alt=""
      className={`${styles.art} ${styles.cover} ${className ?? ""}`}
      style={at(box)}
    />
  );
}

/** The labels in the corners of the photo slides. */
function Corners() {
  return (
    <div className={`${styles.meta} ${own.corners}`}>
      <p style={{ left: 24, top: 24 }}>ORDIN™ IDENTITY SYSTEM</p>
      <p style={{ right: 24, top: 24 }}>V1.0</p>
      <p style={{ left: 24, top: 984 }}>AN OFFMARKET BRAND</p>
      <p style={{ right: 24, top: 984 }}>INTELLIGENCE ABOVE MACHINES™</p>
    </div>
  );
}

/** Lines of the display face, centred on x. */
function Display({
  x,
  y,
  size,
  tracking,
  lineHeight = 1,
  center,
  className,
  style,
  children,
}: {
  x: number;
  y: number;
  size: number;
  tracking: number;
  lineHeight?: number;
  center?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <p
      className={`${own.display} ${className ?? ""}`}
      style={{
        left: x,
        top: y,
        fontSize: size,
        letterSpacing: tracking,
        lineHeight,
        ...(center && { translate: "-50% 0", textAlign: "center" }),
        ...style,
      }}
    >
      {children}
    </p>
  );
}

// ---------- 1. Logomark, with its safe area ----------
function LogomarkSlide() {
  return (
    <div className={styles.slide} style={{ background: "#121212" }}>
      <Art name="o1-grid.svg" box={[0, -419, 1441, 1441]} className={styles.fade} />
      {/* The safe area round the mark: X either side, Y above and below. */}
      <div className={own.safe}>
        <div className={own.bar} style={{ ...at([519, 214, 401, 16]), ...play(200) }} />
        <div className={own.bar} style={{ ...at([519, 790, 401, 16]), ...play(260) }} />
        <div className={own.barTall} style={{ ...at([423, 310, 16, 400]), ...play(320) }} />
        <div className={own.barTall} style={{ ...at([1001, 310, 16, 400]), ...play(380) }} />
        <div className={styles.fade} style={{ ...at([439, 310, 81, 399], { background: "rgba(48,48,48,0.4)" }), ...play(450) }} />
        <div className={styles.fade} style={{ ...at([920, 310, 81, 400], { background: "rgba(48,48,48,0.4)" }), ...play(450) }} />
        {/* The hatching in those areas, as Figma turns and masks it. */}
        <div className={`${own.turnBox} ${styles.fade}`} style={{ ...at([26.07, 56, 894.763, 883.717]), ...play(550) }}>
          <div
            className={own.hatch}
            style={{
              rotate: "-135.36deg",
              transform: "skewX(-0.71deg)",
              maskImage: `url(${src("o1-mask-l.svg")})`,
              WebkitMaskImage: `url(${src("o1-mask-l.svg")})`,
              maskPosition: "412.931px 254.004px",
              WebkitMaskPosition: "412.931px 254.004px",
              maskSize: "81px 399px",
              WebkitMaskSize: "81px 399px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src("o1-hatch.svg")} alt="" className={styles.fill} />
          </div>
        </div>
        <div className={`${own.turnBox} ${styles.fade}`} style={{ ...at([519.17, 80.29, 894.763, 883.717]), ...play(550) }}>
          <div
            className={own.hatch}
            style={{
              rotate: "44.64deg",
              transform: "skewX(-0.71deg)",
              maskImage: `url(${src("o1-mask-r.svg")})`,
              WebkitMaskImage: `url(${src("o1-mask-r.svg")})`,
              maskPosition: "400.832px 229.713px",
              WebkitMaskPosition: "400.832px 229.713px",
              maskSize: "81px 400px",
              WebkitMaskSize: "81px 400px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src("o1-hatch.svg")} alt="" className={styles.fill} />
          </div>
        </div>
        <p className={`${own.axis} ${styles.fade}`} style={{ left: 719.5, top: 185, ...play(700) }}>
          Y
        </p>
        <p className={`${own.axis} ${styles.fade}`} style={{ left: 719.5, top: 814, ...play(700) }}>
          Y
        </p>
        <p className={`${own.axis} ${styles.fade}`} style={{ left: 404.5, top: 500, rotate: "-90deg", ...play(700) }}>
          X
        </p>
        <p className={`${own.axis} ${styles.fade}`} style={{ left: 1035.5, top: 501, rotate: "90deg", ...play(700) }}>
          X
        </p>
      </div>
      <Art name="o1-mark.svg" box={[520, 310, 400, 399]} className={styles.rise} style={play(300)} />
    </div>
  );
}

// ---------- 2. Typography in the columns ----------
function ColumnsSlide() {
  return (
    <div className={styles.slide} style={{ background: "#ddded8" }}>
      <Art name="o2-columns.svg" box={[278, 70, 884, 884]} className={own.build} />
      <Display x={719.69} y={281.52} size={75.966} tracking={-2.279} center className={styles.rise} style={play(400)}>
        <span className={own.script}>T</span>HE
        <br />
        OPERATING
      </Display>
      <div className={own.pill} style={{ ...at([536.74, 440.2, 152.775, 74.277]), ...play(650) }}>
        <Display x={610.94 - 536.74 - 3.356} y={452.02 - 440.2 - 3.356} size={48.956} tracking={-1.4687} center>
          Ordin
        </Display>
        <Art name="o2-tm.svg" box={[660.18 - 536.74 - 3.356, 461.62 - 440.2 - 3.356, 9.259, 4.751]} />
      </div>
      <Art name="o2-badge-b.svg" box={[686.41, 440.2, 74.277, 74.277]} className={styles.pop} style={play(750)} />
      <Art name="o2-badge-a.svg" box={[757.58, 440.2, 74.277, 74.277]} className={styles.pop} style={play(830)} />
      <Art name="o2-badge-c.svg" box={[828.76, 440.2, 74.277, 74.277]} className={styles.pop} style={play(910)} />
      <Display x={720} y={514.48} size={75.966} tracking={-2.279} center className={styles.rise} style={play(550)}>
        SYSTEM FOR
        <br />
        PHYSICAL AI
        <br />
        <span className={own.editorial}>©</span>2026
      </Display>
    </div>
  );
}

// ---------- 3. Signage ----------
function SignageSlide() {
  return (
    <div className={styles.slide} style={{ background: "#ddded8" }}>
      <Photo name="o3-signage" box={[0, 0, 1440, 1024]} className={styles.settle} />
      <Corners />
    </div>
  );
}

// ---------- 4. Typography: the letterforms ----------
function LetterformsSlide() {
  return (
    <div className={styles.slide} style={{ background: "#ddded8" }}>
      <Display
        x={625.11}
        y={145}
        size={261.348}
        tracking={-7.8404}
        lineHeight={0.9}
        center
        className={own.lines}
      >
        <span className={own.lineA}>Robotsare getting smarter.</span>
        <br />
        {/* The middle line is hidden behind the outlined word; its ends are
            set below, pinned where the design has them, since the stand-in
            face runs wider. */}
        &nbsp;
        <br />
        <span className={own.lineB}>Because the moment hundreds of autonomou share the same space, the problem changes.</span>
      </Display>
      <Display x={0} y={145 + 261.348 * 0.9} size={261.348} tracking={-7.8404} lineHeight={0.9} style={{ left: "auto", right: 1440 - 56 }}>
        But intelligence a
      </Display>
      <Display x={1326} y={145 + 261.348 * 0.9} size={261.348} tracking={-7.8404} lineHeight={0.9}>
        cets you so far.
      </Display>
      <p className={own.credit}>OVR DEMORNY TYPEFACE</p>
      {/* A patch of the background over the middle word, and the word's
          outlines drawn over that. */}
      <Art name="o4-curve.svg" box={[159, 376.53, 1136, 305.469]} />
      <Art name="o4-gridi.svg" box={[179, 384, 1082, 307]} className={styles.wipe} style={play(500)} />
    </div>
  );
}

// ---------- 5. Billboard ----------
function BillboardSlide() {
  return (
    <div className={styles.slide} style={{ background: "#ddded8" }}>
      <Photo name="o5-billboard" box={[0, 0, 1440, 1024]} className={styles.settle} />
    </div>
  );
}

// ---------- 6. Machines in motion ----------
function MotionSlide() {
  const type = { size: 192.863, tracking: -5.7859, lineHeight: 0.9 };
  return (
    <div className={styles.slide} style={{ background: "#121212" }}>
      <Display x={720.5} y={-36} {...type} center className={`${own.ghost} ${own.drift}`}>
        ORDER IN
        <br />
        CONTROL
      </Display>
      <Display x={720.5} y={703} {...type} center className={`${own.ghost} ${own.drift}`}>
        ORDER IN
        <br />
        CONTROL
      </Display>
      <Display x={268} y={333} {...type} className={`${own.grey} ${styles.rise}`} style={play(200)}>
        MACHINES
      </Display>
      {/* Its right edge pinned to the mark, as in the design (the stand-in
          face runs a little wider). */}
      <Display x={0} y={518} {...type} className={`${own.grey} ${styles.rise}`} style={{ left: "auto", right: 1440 - 745, ...play(350) }}>
        IN MO
      </Display>
      <Art name="o6-mark.svg" box={[751, 536, 146.366, 146]} className={styles.pop} style={play(700)} />
      <Display x={907} y={518} {...type} className={`${own.grey} ${styles.rise}`} style={play(450)}>
        ION
      </Display>
    </div>
  );
}

// ---------- 7. Billboard at night ----------
function NightSlide() {
  return (
    <div className={styles.slide} style={{ background: "#ddded8" }}>
      <Photo name="o7-billboard" box={[0, 0, 1440, 1024]} className={styles.settle} />
      <Corners />
    </div>
  );
}

// ---------- 8. Embossed ----------
function EmbossedSlide() {
  return (
    <div className={styles.slide} style={{ background: "#121212" }}>
      <Photo name="o8-emboss" box={[0, 0, 1440, 1024]} className={own.lightSweep} />
      <div className={own.warm} />
    </div>
  );
}

export const ORDIN_SLIDES = [
  LogomarkSlide,
  ColumnsSlide,
  SignageSlide,
  LetterformsSlide,
  BillboardSlide,
  MotionSlide,
  NightSlide,
  EmbossedSlide,
];
