import type { CSSProperties, ReactNode } from "react";
import styles from "./AltosReel.module.css";

// The ten Altos brand slides from the Figma file, each drawn at its own
// 1440 × 1024 and placed in the design's pixels (the reel scales them to the
// tile). Classes from AltosReel.module.css bring each one in as it shows.

const DIR = "/work/altos";
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

/** A motion class and its delay (ms), as styles. */
const play = (delay = 0): CSSProperties => ({ "--d": `${delay}ms` }) as CSSProperties;

/** A layer of the design: an image filling its box. */
function Art({ name, box, className, style }: { name: string; box: Box; className?: string; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src(name)} alt="" className={`${styles.art} ${className ?? ""}`} style={at(box, style)} />
  );
}

/** A layer shown through a mask, as Figma does it: the mask image placed at
 *  `pos` and sized `size` within the layer's box. */
function Masked({
  name,
  mask,
  box,
  pos,
  size,
  className,
}: {
  name: string;
  mask: string;
  box: Box;
  pos: [number, number];
  size: [number, number];
  className?: string;
}) {
  const m = `url(${src(mask)})`;
  return (
    <div
      className={className}
      style={at(box, {
        maskImage: m,
        WebkitMaskImage: m,
        maskPosition: `${pos[0]}px ${pos[1]}px`,
        WebkitMaskPosition: `${pos[0]}px ${pos[1]}px`,
        maskSize: `${size[0]}px ${size[1]}px`,
        WebkitMaskSize: `${size[0]}px ${size[1]}px`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      })}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src(name)} alt="" className={styles.fill} />
    </div>
  );
}

/** A box that clips what's in it, optionally through a mask. */
function Clip({
  box,
  mask,
  children,
  className,
  style,
}: {
  box: Box;
  mask?: { name: string; pos: [number, number]; size: [number, number] };
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const m = mask && `url(${src(mask.name)})`;
  return (
    <div
      className={className}
      style={at(box, {
        overflow: "hidden",
        ...(mask && {
          maskImage: m,
          WebkitMaskImage: m,
          maskPosition: `${mask.pos[0]}px ${mask.pos[1]}px`,
          WebkitMaskPosition: `${mask.pos[0]}px ${mask.pos[1]}px`,
          maskSize: `${mask.size[0]}px ${mask.size[1]}px`,
          WebkitMaskSize: `${mask.size[0]}px ${mask.size[1]}px`,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }),
        ...style,
      })}
    >
      {children}
    </div>
  );
}

/** A dashed guide drawn as a vertical line, turned to lie flat across the
 *  slide when `flat` (centred on x, y), else standing at x from `top`. */
function Line({
  name,
  x,
  y,
  length,
  width = 1,
  flat,
  className,
  style,
}: {
  name: string;
  x: number;
  y: number;
  length: number;
  width?: number;
  flat?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={className}
      style={at(flat ? [x - width / 2, y - length / 2, width, length] : [x - width / 2, y, width, length], {
        rotate: flat ? "-90deg" : undefined,
        ...style,
      })}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src(name)} alt="" className={styles.fill} />
    </div>
  );
}

/** The small Anta labels round the edges (right-aligned to x when `right`). */
function Label({
  x,
  y,
  right,
  mono,
  children,
}: {
  x: number;
  y: number;
  right?: boolean;
  mono?: boolean;
  children: ReactNode;
}) {
  return (
    <p
      className={`${styles.label} ${mono ? styles.mono : ""}`}
      style={right ? { right: 1440 - x, top: y } : { left: x, top: y }}
    >
      {children}
    </p>
  );
}

function Body({ x, y, w, children }: { x: number; y: number; w: number; children: ReactNode }) {
  return (
    <p className={styles.body} style={{ left: x, top: y, width: w }}>
      {children}
    </p>
  );
}

/** The labels most slides share; `top` and `foot` turn sets of them on. */
function Meta({ title, top = true, foot = true }: { title?: string; top?: boolean; foot?: boolean }) {
  return (
    <div className={styles.meta}>
      {title && (
        <>
          <Label x={32} y={32}>
            {title}
          </Label>
          <Label x={32} y={53}>
            VERSION 1.0
          </Label>
        </>
      )}
      {top && (
        <>
          <Label x={1408} y={32} right>
            DESIGNJOY
          </Label>
          <Label x={1408} y={53} right>
            STATUS: SOLD
          </Label>
        </>
      )}
      {foot && (
        <>
          <Label x={1408} y={956} right>
            A DESIGNJOY BRAND
          </Label>
          <Label x={1408} y={977} right mono>
            ©2026
          </Label>
        </>
      )}
    </div>
  );
}

/** "ALTOS" set in Anta, with the mark for the O, as on the posters. */
function Wordmark({
  alt,
  s,
  mark,
  size,
  tracking,
}: {
  alt: [number, number];
  s: [number, number];
  mark: { name: string; box: Box };
  size: number;
  tracking: number;
}) {
  const type: CSSProperties = { fontSize: size, letterSpacing: tracking };
  return (
    <>
      <p className={styles.logotype} style={{ ...type, left: alt[0], top: alt[1] }}>
        ALT
      </p>
      <p className={styles.logotype} style={{ ...type, left: s[0], top: s[1] }}>
        S
      </p>
      <Art name={mark.name} box={mark.box} />
    </>
  );
}

// ---------- 1. Wordmark ----------
function WordmarkSlide() {
  return (
    <div className={styles.slide} style={{ background: "#afb9ea" }}>
      <Line name="s1-dash-h.svg" x={720} y={477.28} length={1440} flat className={styles.drawFlat} style={play(0)} />
      <Line name="s1-dash-h.svg" x={720} y={548.41} length={1440} flat className={styles.drawFlat} style={play(120)} />
      <Line name="s1-dash-v.svg" x={563} y={0} length={1024} className={styles.drawUp} style={play(240)} />
      <Line name="s1-dash-v.svg" x={875} y={0} length={1024} className={styles.drawUp} style={play(360)} />
      <Art name="s1-wordmark.svg" box={[563.36, 477.28, 310.456, 71.129]} className={styles.wipe} style={play(500)} />
      <p className={`${styles.tm} ${styles.fade}`} style={{ left: 877, top: 472, fontSize: 19, ...play(900) }}>
        ™
      </p>
      <Meta title="WORDMARK" />
      <Body x={32} y={912} w={428}>
        The Altos mark transforms the “O” into a distinct geometric symbol built around an open center. Its opposing
        forms create a sense of movement, focus, and forward momentum, giving the wordmark a recognizable focal point
        without sacrificing clarity. The mark can also stand alone as an icon across digital, social, and physical
        applications.
      </Body>
    </div>
  );
}

// ---------- 2. Horizon pattern ----------
function HorizonSlide() {
  return (
    <div className={styles.slide} style={{ background: "#d9e0ff" }}>
      <Clip box={[0, -173, 1440, 960]}>
        <Art name="s2-base.svg" box={[0, 0, 1440, 960]} />
        <Art name="s2-stripes.svg" box={[12.672, -1.248, 1414.656, 962.496]} className={styles.drop} style={play(0)} />
        {/* The arcs rise like the sun coming up. */}
        <Masked
          name="s2-g2.svg"
          mask="s2-m1.svg"
          box={[0, -1.248, 1440, 962.496]}
          pos={[408.96, 650.16]}
          size={[622.08, 622.08]}
          className={styles.sunrise}
        />
        <Masked
          name="s2-g4.svg"
          mask="s2-m3.svg"
          box={[0, -1.248, 1440, 962.496]}
          pos={[581.76, 822.96]}
          size={[276.48, 276.48]}
          className={`${styles.sunrise} ${styles.later}`}
        />
      </Clip>
      <Meta top={false} />
      <div className={styles.meta}>
        <Label x={32} y={819}>
          HORIZON PATTERN
        </Label>
      </div>
      <Body x={32} y={912} w={428}>
        The Horizon Pattern is a signature Altos graphic device built from repeating vertical bars and expanding arcs. It
        represents clarity, momentum, and a brighter future coming into view. Use it as a bold supporting element across
        layouts, presentations, and digital applications to add rhythm, depth, and instant brand recognition.
      </Body>
    </div>
  );
}

// ---------- 3. Posters ----------
const POSTER_MASK = "s3-poster-mask.svg";
const POSTER_STRIPES: Box = [-7.03, -293.33, 550.48, 716.13];
const POSTER_ARCS: Box = [-91.98, -1.957, 2630.31, 1634.81];

function PostersSlide() {
  return (
    <div className={styles.slide} style={{ background: "#afb9ea" }}>
      <div className={`${styles.layer} ${styles.rise}`} style={play(0)}>
        <div style={at([193, 123, 511, 704], { background: "#828600" })} />
        <Clip box={[167.92, 284, 536.423, 422]} mask={{ name: POSTER_MASK, pos: [25.084, -161], size: [511, 704] }}>
          <Art name="s3-g.svg" box={POSTER_STRIPES} />
          <Masked name="s3-g2.svg" mask="s3-g1.svg" box={POSTER_STRIPES} pos={[-145.304, 295.122]} size={[841.111, 841.111]} />
          <Masked name="s3-g4.svg" mask="s3-g3.svg" box={POSTER_STRIPES} pos={[4.895, 445.32]} size={[540.714, 540.714]} />
          <Masked name="s3-g6.svg" mask="s3-g5.svg" box={POSTER_STRIPES} pos={[155.093, 595.519]} size={[240.317, 240.318]} />
          <Clip box={[-885.15, -698.24, 2446.35, 1630.9]}>
            <Art name="s3-rise83083.svg" box={[0, 0, 2446.35, 1630.9]} />
            <Art name="s3-g7.svg" box={[-91.98, -2.12, 2630.31, 1634.98]} />
            <Masked name="s3-g9.svg" mask="s3-g8.svg" box={POSTER_ARCS} pos={[310.578, -1002.607]} size={[2009.291, 2009.291]} />
            <Masked name="s3-g11.svg" mask="s3-g10.svg" box={POSTER_ARCS} pos={[669.38, -643.805]} size={[1291.687, 1291.687]} />
            <Masked name="s3-g13.svg" mask="s3-g12.svg" box={POSTER_ARCS} pos={[1028.182, -285.003]} size={[574.083, 574.083]} />
          </Clip>
        </Clip>
        <p className={styles.copy} style={{ left: 217, top: 147, width: 169, fontSize: 15 }}>
          Research
          <br />
          Build
          <br />
          Test
          <br />
          Deploy
        </p>
        <Wordmark
          alt={[217, 726]}
          s={[371.59, 726]}
          mark={{ name: "s3-oooo.svg", box: [328.65, 741.95, 36.807, 41.203] }}
          size={57.063}
          tracking={1.1413}
        />
        <p className={styles.copy} style={{ left: 519, top: 745, width: 169, fontSize: 15 }}>
          Delegate beyond
          <br />
          the browser.
        </p>
      </div>

      <div className={`${styles.layer} ${styles.rise}`} style={play(180)}>
        <div style={at([736, 123, 511, 704], { background: "#ff4000" })} />
        <Clip box={[1089, -139, 1844, 1229.333]} mask={{ name: POSTER_MASK, pos: [-353, 262], size: [511, 704] }}>
          <Art name="s3-rise72453.svg" box={[0, 0, 1844, 1229.333]} />
          <Art name="s3-g14.svg" box={[35.59, -1.6, 1772.82, 1232.41]} />
          <Masked name="s3-g16.svg" mask="s3-g15.svg" box={[0, -1.475, 1844, 1232.28]} pos={[-708.096, -91.893]} size={[1416.192, 1416.192]} />
          <Masked name="s3-g18.svg" mask="s3-g17.svg" box={[0, -1.598, 1844, 1232.41]} pos={[-314.709, 301.494]} size={[629.419, 629.419]} />
        </Clip>
        <Wordmark
          alt={[768, 155]}
          s={[922.59, 155]}
          mark={{ name: "s3-oooo.svg", box: [879.65, 170.95, 36.807, 41.203] }}
          size={57.063}
          tracking={1.1413}
        />
        <p className={styles.copy} style={{ left: 768, top: 684, width: 253, fontSize: 42, lineHeight: "37px", letterSpacing: -1.26 }}>
          The last tab you need to open.
        </p>
      </div>

      <Meta title="POSTERS" />
      <div className={styles.meta}>
        <Label x={32} y={865}>
          HORIZON PATTERN IN ACTION
        </Label>
      </div>
      <Body x={32} y={896} w={428}>
        The poster system brings the Altos identity to life through bold scale, sharp contrast, and modular compositions.
        The Horizon Pattern, oversized typography, and core color palette can shift in proportion and placement from piece
        to piece, creating variety without losing recognition. Each poster should feel graphic, direct, and slightly
        experimental—using the system as a flexible framework rather than a fixed template.
      </Body>
    </div>
  );
}

// ---------- 4. Logo mark ----------
function LogoMarkSlide() {
  const dots: [number, number][] = [
    [583, 647],
    [583, 360],
    [842, 647],
    [842, 360],
  ];
  return (
    <div className={`${styles.slide} ${styles.light}`} style={{ background: "#828600" }}>
      <Line name="s4-dash-h.svg" x={720} y={512} length={1440} flat className={styles.drawFlat} style={play(0)} />
      <Line name="s4-dash-v.svg" x={720.5} y={0} length={1024} className={styles.drawUp} style={play(100)} />
      <Art name="s4-circle.webp" box={[526, 317, 389, 389]} className={styles.spin} style={play(200)} />
      <Line name="s4-guide-v.svg" x={591} y={261} length={503} className={styles.drawUp} style={play(300)} />
      <Line name="s4-guide-v.svg" x={850} y={261} length={503} className={styles.drawUp} style={play(380)} />
      <Line name="s4-guide-h.svg" x={720.5} y={368} length={503} flat className={styles.drawFlat} style={play(460)} />
      <Line name="s4-guide-h.svg" x={720.5} y={655} length={503} flat className={styles.drawFlat} style={play(540)} />
      <Art name="s4-mark.svg" box={[591.96, 368, 256.663, 287.32]} className={styles.grow} style={play(650)} />
      {dots.map(([x, y], i) => (
        <Art key={i} name="s4-dot.svg" box={[x, y, 16, 16]} className={styles.pop} style={play(900 + i * 80)} />
      ))}
      <Meta title="LOGO MARK" />
      <Body x={32} y={912} w={369}>
        A simple, modular mark built from four forms arranged around an open center. Its balanced geometry represents
        connection, structure, and flexibility while remaining recognizable at any scale. The mark can be used
        independently as an icon, avatar, favicon, or graphic element across digital and physical applications.
      </Body>
    </div>
  );
}

// ---------- 5. Pattern angles ----------
type Tile = {
  box: Box;
  base: string;
  group: { name: string; box: Box };
  masks: { name: string; mask: string; pos: [number, number]; size: number }[];
  from: string;
};

const TILES: Tile[] = [
  {
    // Left
    box: [635.72, 20, 168.281, 168.281],
    base: "s5-rise37122.svg",
    group: { name: "s5-g27.svg", box: [-2.709, -0.1346, 173.7, 168.55] },
    masks: [
      { name: "s5-g29.svg", mask: "s5-g28.svg", pos: [-82.102, -0.533], size: 169.627 },
      { name: "s5-g31.svg", mask: "s5-g30.svg", pos: [-34.983, 46.586], size: 75.39 },
    ],
    from: "fromLeft",
  },
  {
    // Right
    box: [635, 206.98, 169, 169],
    base: "s5-rise23680.svg",
    group: { name: "s5-g8.svg", box: [-2.9575, -0.135, 174.915, 169.27] },
    masks: [
      { name: "s5-g10.svg", mask: "s5-g9.svg", pos: [20.534, -66.783], size: 302.848 },
      { name: "s5-g12.svg", mask: "s5-g11.svg", pos: [74.614, -12.703], size: 194.688 },
      { name: "s5-g14.svg", mask: "s5-g13.svg", pos: [128.693, 41.377], size: 86.528 },
    ],
    from: "fromRight",
  },
  {
    // Center
    box: [603, 395, 234, 234],
    base: "s5-rise80502.svg",
    group: { name: "s5-g.svg", box: [-4.235, -0.187, 242.47, 234.37] },
    masks: [
      { name: "s5-g2.svg", mask: "s5-g1.svg", pos: [-62.215, -66.261], size: 366.912 },
      { name: "s5-g4.svg", mask: "s5-g3.svg", pos: [3.305, -0.741], size: 235.872 },
      { name: "s5-g7.svg", mask: "s5-g6.svg", pos: [68.825, 64.779], size: 104.832 },
    ],
    from: "grow",
  },
  {
    // Top
    box: [635.72, 648, 168.281, 168.281],
    base: "s5-rise37122.svg",
    group: { name: "s5-g15.svg", box: [-4.207, -0.1346, 176.695, 168.55] },
    masks: [
      { name: "s5-g17.svg", mask: "s5-g16.svg", pos: [21.708, -66.499], size: 133.278 },
      { name: "s5-g19.svg", mask: "s5-g18.svg", pos: [58.73, -29.477], size: 59.235 },
    ],
    from: "fromTop",
  },
  {
    // Bottom
    box: [635.72, 834.98, 168.281, 168.281],
    base: "s5-rise37122.svg",
    group: { name: "s5-g20.svg", box: [-2.625, -0.1346, 173.531, 168.55] },
    masks: [
      { name: "s5-g22.svg", mask: "s5-g21.svg", pos: [-64.01, 17.641], size: 301.559 },
      { name: "s5-g24.svg", mask: "s5-g23.svg", pos: [-10.16, 71.491], size: 193.86 },
      { name: "s5-g26.svg", mask: "s5-g25.svg", pos: [43.69, 125.341], size: 86.16 },
    ],
    from: "fromBottom",
  },
];

function AnglesSlide() {
  const labels: [string, number][] = [
    ["[LEFT]", 92],
    ["[RIGHT]", 276],
    ["[CENTER]", 500],
    ["[TOP]", 721],
    ["[BOTTOM]", 911],
  ];
  return (
    <div className={styles.slide} style={{ background: "#afb9ea" }}>
      <Art name="s5-sides.svg" box={[432.68, 395, 574.643, 234.497]} className={styles.grow} style={play(500)} />
      {TILES.map((t, i) => (
        <div key={i} className={styles[t.from]} style={{ ...at(t.box), ...play(i * 110) }}>
          <Clip box={[0, 0, t.box[2], t.box[3]]}>
            <Art name={t.base} box={[0, 0, t.box[2], t.box[3]]} />
            <Art name={t.group.name} box={t.group.box} />
            {t.masks.map((m) => (
              <Masked
                key={m.name}
                name={m.name}
                mask={m.mask}
                box={t.group.box}
                pos={m.pos}
                size={[m.size, m.size]}
              />
            ))}
          </Clip>
        </div>
      ))}
      <Wordmark
        alt={[24, 4]}
        s={[276, 4]}
        mark={{ name: "s5-oooo.svg", box: [206, 30, 60, 67.167] }}
        size={93.021}
        tracking={1.8604}
      />
      <p className={styles.tm} style={{ left: 338, top: 23, fontSize: 19 }}>
        ™
      </p>
      <Meta foot={false} />
      <div className={styles.meta}>
        {labels.map(([text, y]) => (
          <p key={text} className={`${styles.label} ${styles.robotoMono}`} style={{ right: 1440 - 589, top: y }}>
            {text}
          </p>
        ))}
        <Label x={32} y={865}>
          HORIZON PATTERN ANGLES
        </Label>
      </div>
      <Art name="s5-globe.svg" box={[1311, 940, 97, 52]} />
      <Body x={32} y={896} w={407}>
        The Horizon Pattern is designed to be flexible, with angled crops and shifting orientations that create a sense of
        movement across the system. By positioning the pattern from the left, right, top, bottom, or center, Altos can
        frame content in different ways while still feeling cohesive. These directional variations add energy and depth,
        turning a single graphic asset into a dynamic brand device.
      </Body>
    </div>
  );
}

// ---------- 6. Box truck ----------
function TruckSlide() {
  return (
    <div className={`${styles.slide} ${styles.onPhoto}`} style={{ background: "#d9e0ff" }}>
      <Art name="s6-truck.webp" box={[-26, 0, 1466, 1026]} className={`${styles.cover} ${styles.settle}`} />
      <Meta foot={false} />
    </div>
  );
}

// ---------- 7. Sign ----------
function SignSlide() {
  return (
    <div className={styles.slide} style={{ background: "#afb9ea" }}>
      {/* The photo shows in the slide's left half (its mask in Figma). */}
      <Clip box={[0, 0, 720, 1024]}>
        <Art name="s7-photo.webp" box={[-0.0, -0.25, 719.88, 1024.27]} className={`${styles.cover} ${styles.settle}`} />
      </Clip>
      <div className={styles.rise} style={{ ...at([926, 148.26, 308, 727.48]), ...play(150) }}>
        <Clip box={[0, 0, 308, 727.48]} style={{ background: "#828600" }}>
          <Line name="s7-dash-h.svg" x={177.78} y={363.54} length={828.063} width={0.575} flat />
          <Line name="s7-dash-v.svg" x={177.78} y={363.74 - 294.42} length={588.845} width={0.575} />
          <Art name="s7-circle.webp" box={[65.93, 251.61, 223.692, 223.692]} />
          <Line name="s7-guide-v.svg" x={103.31} y={219.41} length={289.247} width={0.575} />
          <Line name="s7-guide-v.svg" x={252.25} y={219.41} length={289.247} width={0.575} />
          <Line name="s7-guide-h.svg" x={177.78} y={280.93} length={289.247} width={0.575} flat />
          <Line name="s7-guide-h.svg" x={177.78} y={445.97} length={289.247} width={0.575} flat />
          <Art name="s7-mark.svg" box={[103.86, 280.93, 147.593, 165.222]} />
          {[
            [98.71, 441.37],
            [98.71, 276.33],
            [247.65, 441.37],
            [247.65, 276.33],
          ].map(([x, y], i) => (
            <Art key={i} name="s7-dot.svg" box={[x, y, 9.201, 9.201]} />
          ))}
          <Wordmark
            alt={[56.37, 8.93]}
            s={[207.61, 8.93]}
            mark={{ name: "s7-oooo.svg", box: [165.6, 24.53, 36.011, 40.312] }}
            size={55.829}
            tracking={1.1166}
          />
          <p className={styles.tm} style={{ left: 244.82, top: 20.34, fontSize: 11.403 }}>
            ™
          </p>
          <Art name="s7-arrow.svg" box={[196.17 + 3.993, 95.76 + 2.336, 89.085, 91.087]} className={styles.nudge} />
          <p className={styles.sign} style={{ left: 56.37, top: 645.3, fontSize: 8.933 }}>
            Analyzing objective
            <br />
            Reviewing context
            <br />
            Connecting tools
            <br />
            Building workflow
            <br />
            Running task
          </p>
          <p className={styles.sign} style={{ left: 53.51, top: 525.24, fontSize: 58.956 }}>
            すべて
          </p>
          <p className={styles.sign} style={{ left: 215.46, top: 683.17, fontSize: 15.007, letterSpacing: 1.5007 }}>
            ALTOS.IO
          </p>
          <div style={at([0, 0, 45.378, 727.48], { background: "#8b97d4" })} />
          <div style={at([0, 682.1, 45.378, 45.378], { background: "#ff4000" })} />
          {/* The name up the side. */}
          <div className={styles.turned} style={at([5.36, 608.42, 35, 51])}>
            <span className={styles.logotype} style={{ position: "static", fontSize: 27.366, letterSpacing: 0.5473 }}>
              ALT
            </span>
          </div>
          <div className={styles.turned} style={at([5.36, 566.29, 35, 19])}>
            <span className={styles.logotype} style={{ position: "static", fontSize: 27.366, letterSpacing: 0.5473 }}>
              S
            </span>
          </div>
          <div className={styles.turned} style={at([13.01, 588.23, 19.76, 17.651])}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src("s7-oooo-side.svg")} alt="" style={{ width: 17.651, height: 19.76, flex: "none" }} />
          </div>
          <div className={styles.turned} style={at([10.95, 563.05, 7, 4])}>
            <span className={styles.tm} style={{ position: "static", fontSize: 5.59 }}>
              ™
            </span>
          </div>
        </Clip>
      </div>
      <Meta />
    </div>
  );
}

// ---------- 8. Colours ----------
const COLUMNS: [left: number, width: number][] = [
  [0, 802],
  [802, 367],
  [1169, 271],
];
const SWATCHES: [name: string, hex: string][][] = [
  [
    ["TERRAIN", "828600"],
    ["SIGNAL MOSS", "9DA113"],
    ["DEEP FIELD", "656800"],
  ],
  [
    ["ATOMOSPHERE", "AFB9EA"],
    ["HIGH AIR", "C4CCF3"],
    ["DUSK SIGNAL", "919DD9"],
  ],
  [
    ["IGNITION", "FF4000"],
    ["AFTERGLOW", "FF6D3C"],
    ["BURN", "D11803"],
  ],
  [
    ["VOID", "000000"],
    ["CARBON", "1D1D1D"],
    ["GRAPHITE", "2C2C2C"],
  ],
];

function ColorsSlide() {
  return (
    <div className={styles.slide} style={{ background: "#d9e0ff" }}>
      {SWATCHES.map((row, r) =>
        row.map(([name, hex], c) => {
          const [left, width] = COLUMNS[c];
          return (
            <div
              key={hex}
              className={styles.swatch}
              style={{ ...at([left, r * 256, width, 256], { background: `#${hex}` }), ...play(r * 120 + c * 90) }}
            >
              <p className={styles.swatchText} style={{ color: r === 3 ? "#afb9ea" : "#000" }}>
                {name}
                <br />
                <span>{hex}</span>
              </p>
            </div>
          );
        }),
      )}
    </div>
  );
}

// ---------- 9. Typography ----------
function TypographySlide() {
  return (
    <div className={styles.slide} style={{ background: "#d9e0ff" }}>
      <Art name="s9-a.svg" box={[-98.02, -353, 1636.04, 1658]} className={styles.settleIn} />
      <Meta title="TYPOGRAPHY" />
      <div className={`${styles.meta} ${styles.fade}`} style={play(500)}>
        <Label x={561} y={643}>
          ANTARTICA
        </Label>
      </div>
      <Body x={561} y={674} w={279}>
        A contemporary Neo-Grotesque typeface built for clarity, flexibility, and range. Its clean construction gives Altos
        a precise, modern voice, while an unusually broad family—from ultra-condensed to ultra-expanded styles—allows the
        typography to shift between quiet utility and bold expression without losing consistency.
      </Body>
    </div>
  );
}

// ---------- 10. Design concept ----------
const CONCEPT_ARCS: Box = [-42.594, -1.612, 1945.19, 1243.22];

function ConceptSlide() {
  return (
    <div className={styles.slide} style={{ background: "#d9e0ff" }}>
      {/* Under the artwork, as in the design (so hidden). */}
      <p className={`${styles.label} ${styles.mono}`} style={{ right: 1440 - 1408, top: 977 }}>
        ©2026
      </p>
      <Clip box={[0, -108, 1860, 1240]}>
        <Art name="s10-base.svg" box={[0, 0, 1860, 1240]} />
        <div className={styles.slideIn}>
          <Art name="s10-g.svg" box={[-42.594, -1.488, 1945.19, 1243.1]} />
          <Masked name="s10-g2.svg" mask="s10-g1.svg" box={CONCEPT_ARCS} pos={[-1408.245, -1759.25]} size={[4761.601, 4761.6]} />
          <Masked name="s10-g4.svg" mask="s10-g3.svg" box={CONCEPT_ARCS} pos={[-912.245, -1263.25]} size={[3769.6, 3769.6]} />
          <Masked name="s10-g6.svg" mask="s10-g5.svg" box={CONCEPT_ARCS} pos={[-416.245, -767.25]} size={[2777.601, 2777.6]} />
          <Masked
            name="s10-g8.svg"
            mask="s10-g7.svg"
            box={[-45.012, -3.1, 1950.02, 1246.2]}
            pos={[79.951, -271.918]}
            size={[1790, 1790]}
            className={styles.sun}
          />
          <Masked name="s10-g10.svg" mask="s10-g9.svg" box={CONCEPT_ARCS} pos={[575.755, 224.75]} size={[793.6, 793.6]} />
        </div>
        <div style={at([210, 108, 445.1, 172], { background: "#828600" })} />
        <div className={styles.dropDown} style={at([201.07, 108, 462.03, 1026], { background: "#828600" })} />
        <p
          className={`${styles.copy} ${styles.rise}`}
          style={{ left: 218, top: 945, width: 359, fontSize: 62, lineHeight: "49px", letterSpacing: -1.86, ...play(500) }}
        >
          The last tab you need
          <br />
          to open.
        </p>
        <div className={styles.pop} style={at([719, 534, 422, 172], { background: "#ff4000", border: "1px solid #000", ...play(700) })} />
        <p className={`${styles.robotoMono} ${styles.list}`} style={{ left: 759, top: 566, ...play(900) }}>
          * Analyzing objective
          <br />* Reviewing available context
          <br />* Connecting tools
          <br />* Building workflow
          <br />* Running task
        </p>
        <div
          className={styles.pop}
          style={at([1169.94, 962, 478.02, 171.99], { background: "#828600", border: "1px solid #000", ...play(1000) })}
        />
        <p className={`${styles.robotoMono} ${styles.list}`} style={{ left: 1202, top: 994, ...play(1200) }}>
          * 04 agents active
          <br />* 17 tasks completed
          <br />* 03 systems connected
        </p>
        <Wordmark
          alt={[222.08, 134.04]}
          s={[473.93, 134.04]}
          mark={{ name: "s10-oooo.svg", box: [403.99, 159.96, 60.08, 67.21] }}
          size={93.021}
          tracking={1.8604}
        />
        <p className={styles.tm} style={{ left: 536.05, top: 153.02, fontSize: 19 }}>
          ™
        </p>
        <div style={at([1591, 1077, 25, 25], { background: "#000" })} />
      </Clip>
    </div>
  );
}

export const ALTOS_SLIDES = [
  WordmarkSlide,
  HorizonSlide,
  PostersSlide,
  LogoMarkSlide,
  AnglesSlide,
  TruckSlide,
  SignSlide,
  ColorsSlide,
  TypographySlide,
  ConceptSlide,
];

