import type { CSSProperties, ReactNode } from "react";
import styles from "./BrandReel.module.css";
import own from "./OffCanvasSlides.module.css";

// The fourteen Off Canvas logo explorations from the Figma file, each drawn
// at its own 1440 × 1024 and placed in the design's pixels (the reel scales
// them to the tile). Light on black throughout.

const DIR = "/work/offcanvas";
const LIGHT = "#d4d4d4";

type Box = [left: number, top: number, width?: number, height?: number];

const at = ([left, top, width, height]: Box, extra?: CSSProperties): CSSProperties => ({
  position: "absolute",
  left,
  top,
  width,
  height,
  ...extra,
});

function Art({ name, box, style }: { name: string; box: Box; style?: CSSProperties }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`${DIR}/${name}.svg`} alt="" className={styles.art} style={at(box, style)} />
  );
}

/** A block of the brand's colour. */
function Block({ box, round }: { box: Box; round?: boolean }) {
  return <div style={at(box, { background: LIGHT, borderRadius: round ? 120 : undefined })} />;
}

/** Words in the logotype's face (Delight in the design), at (x, y). */
function Word({
  x,
  y,
  size = 72,
  dark,
  children,
}: {
  x: number;
  y: number;
  size?: number;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <p className={own.word} style={{ left: x, top: y, fontSize: size, color: dark ? "#000" : LIGHT }}>
      {children}
    </p>
  );
}

/** Lines of the small mono type (DX Mono in the design), at (x, y). */
function Mono({ x, y, lines }: { x: number; y: number; lines: string[] }) {
  return (
    <p className={own.mono} style={{ left: x, top: y }}>
      {lines.map((line, i) => (
        <span key={i}>{line}</span>
      ))}
    </p>
  );
}

/** A box with its content turned to run up (or, `down`, down) the page. */
function Turned({ box, down, children }: { box: Box; down?: boolean; children: ReactNode }) {
  return (
    <div className={own.turned} style={{ ...at(box), "--turn": down ? "90deg" : "-90deg" } as CSSProperties}>
      {children}
    </div>
  );
}

const BUILT = "BUILT INDEPENDENTLY";
const MADE = "MADE PURPOSEFULLY";
const STACKED = ["BUILT", "INDEPENDENTLY", MADE];

/** The slide itself: black, with the design on it. */
function Slide({ children }: { children: ReactNode }) {
  return (
    <div className={styles.slide} style={{ background: "#000" }}>
      {children}
    </div>
  );
}

// ---------- 1. Two tabs ----------
function Tabs() {
  return (
    <Slide>
      <Block box={[639, 456, 325, 95]} />
      <Word x={653} y={460} dark>
        CANVAS
      </Word>
      <Word x={928} y={467} size={24.527} dark>
        ®
      </Word>
      <Block box={[476, 442, 159, 95]} />
      <Word x={490} y={446} dark>
        OFF
      </Word>
      <Mono x={476} y={568} lines={[BUILT]} />
      <Mono x={715} y={568} lines={["//"]} />
      <Mono x={837} y={568} lines={[MADE]} />
    </Slide>
  );
}

// ---------- 2. A dash between ----------
function Dash() {
  return (
    <Slide>
      <Word x={353} y={461}>
        OFF
      </Word>
      <Word x={789} y={464}>
        CANVAS
      </Word>
      <Word x={1063} y={463} size={24.527}>
        ®
      </Word>
      <Block box={[606, 506, 63, 5]} />
      <Mono x={353} y={555} lines={[BUILT]} />
      <Mono x={961} y={555} lines={[MADE]} />
    </Slide>
  );
}

// ---------- 3. A slash down between ----------
function Slash() {
  return (
    <Slide>
      <Word x={358} y={374}>
        OFF
      </Word>
      <Word x={790} y={559}>
        CANVAS
      </Word>
      {/* The line turned about the middle of its 209px box. */}
      <Art name="slash" box={[543 + 104.652 - 0.5, 396 + 104.652 - 148, 1, 296]} style={{ rotate: "-45deg" }} />
      <Word x={1064} y={559} size={18.396}>
        ®
      </Word>
      <Mono x={358} y={465} lines={[BUILT]} />
      <Mono x={956} y={527} lines={[MADE]} />
    </Slide>
  );
}

// ---------- 4. A step ----------
function Step() {
  return (
    <Slide>
      <Block box={[358, 399, 200, 167]} />
      <Word x={391} y={416} dark>
        OFF
      </Word>
      <Block box={[358, 512, 406, 54]} />
      <Word x={784} y={492}>
        CANVAS
      </Word>
      <Word x={1059} y={499} size={24.527}>
        ®
      </Word>
      <Mono x={358} y={583} lines={STACKED} />
    </Slide>
  );
}

// ---------- 5. A switch ----------
function Switch() {
  return (
    <Slide>
      <Block box={[472, 441, 496, 142]} round />
      <Word x={727} y={482} size={46.681} dark>
        CANVAS
      </Word>
      <Word x={905.3} y={486.54} size={15.902} dark>
        ®
      </Word>
      <div style={at([486, 455, 214, 114], { background: "#000", borderRadius: 120 })} />
      <Word x={549.92} y={482} size={46.681}>
        OFF
      </Word>
    </Slide>
  );
}

// ---------- 6. A frame, corner to corner ----------
function Frame() {
  return (
    <Slide>
      <div style={at([481, 374, 478, 276], { boxSizing: "border-box", border: `1px solid ${LIGHT}` })} />
      <Mono x={492} y={385} lines={["BUILT", "INDEPENDENTLY"]} />
      <Mono x={859} y={612} lines={["MADE", "PURPOSEFULLY"]} />
      <Art name="box-diagonal" box={[482, 375 - 0.433, 477.498, 274.867]} />
      <Turned box={[422, 563, 59, 87]}>
        <Word x={0} y={0} size={46.681}>
          OFF
        </Word>
      </Turned>
      <Turned box={[959, 374, 59, 178]} down>
        <Word x={0} y={0} size={46.681}>
          CANVAS
        </Word>
      </Turned>
      <Turned box={[993.46, 552.3, 20, 16]} down>
        <Word x={0} y={0} size={15.902}>
          ®
        </Word>
      </Turned>
    </Slide>
  );
}

// ---------- 7. Letters in rings ----------
function Rings() {
  return (
    <Slide>
      {[388, 500, 612].map((x) => (
        <Art key={x} name="circle" box={[x, 456, 112, 112]} />
      ))}
      <Word x={417} y={468}>
        O
      </Word>
      <Word x={536} y={468}>
        F
      </Word>
      <Word x={648} y={468}>
        F
      </Word>
      <Word x={753} y={468}>
        CANVAS
      </Word>
      <Word x={1028} y={475} size={24.527}>
        ®
      </Word>
      <Mono x={926} y={568} lines={STACKED} />
    </Slide>
  );
}

// ---------- 8. A tab, and off it ----------
function Tab() {
  return (
    <Slide>
      <Block box={[455, 434, 244, 95]} />
      <Word x={469} y={438} dark>
        OFF
      </Word>
      <Word x={688} y={499}>
        CANVAS
      </Word>
      <Word x={962} y={493} size={24.527}>
        ®
      </Word>
      <Mono x={455} y={549} lines={STACKED} />
    </Slide>
  );
}

// ---------- 9. A curve down ----------
function Curve() {
  return (
    <Slide>
      <Art name="curve" box={[552, 423.5, 407.5, 194.5]} />
      <Word x={459} y={394} size={46.681}>
        OFF
      </Word>
      <Word x={773} y={572} size={46.681}>
        CANVAS
      </Word>
      <Word x={965} y={581} size={15.902}>
        ®
      </Word>
      <Mono x={459} y={576} lines={STACKED} />
    </Slide>
  );
}

// ---------- 10. A line along ----------
function Line() {
  return (
    <Slide>
      <Word x={406} y={437}>
        OFF
      </Word>
      <Word x={737} y={468}>
        CANVAS
      </Word>
      <Word x={1011} y={467} size={24.527}>
        ®
      </Word>
      <Mono x={406} y={525} lines={["BUILT", "INDEPENDENTLY"]} />
      <Mono x={737} y={559} lines={["MADE", "PURPOSEFULLY"]} />
      <Block box={[539, 511, 189, 5]} />
    </Slide>
  );
}

// ---------- 11. In a viewfinder ----------
function Viewfinder() {
  // The one corner, turned for each of the four.
  const corners: [number, number, string][] = [
    [466, 384, "none"],
    [912, 384, "rotate(90deg)"],
    [912, 579, "rotate(180deg)"],
    [466, 579, "scaleY(-1)"],
  ];
  return (
    <Slide>
      {corners.map(([x, y, transform]) => (
        <div key={`${x}-${y}`} style={at([x, y, 62, 62], { transform })}>
          <Art name="corner" box={[-0.5, -0.5, 62.5, 62.5]} />
        </div>
      ))}
      <Word x={506} y={409}>
        OFF
      </Word>
      <Word x={660} y={533}>
        CANVAS
      </Word>
      <Word x={934} y={533} size={18.396}>
        ®
      </Word>
      <Mono x={506} y={576} lines={["BUILT", "INDEPENDENTLY"]} />
      <Mono x={861} y={427} lines={["MADE", "PURPOSEFULLY"]} />
    </Slide>
  );
}

// ---------- 12. A label, torn into strips ----------
function Strips() {
  return (
    <Slide>
      {(
        [
          [476, 383],
          [861, 40],
          [903, 30],
          [935, 16],
          [953, 12],
        ] as const
      ).map(([x, w]) => (
        <Block key={x} box={[x, 422, w, 125]} />
      ))}
      <Word x={510} y={455} size={49.029} dark>
        OFF CANVAS
      </Word>
      <Word x={801} y={453} size={18.396} dark>
        ®
      </Word>
      <Mono x={476} y={561} lines={STACKED} />
    </Slide>
  );
}

// ---------- 13. Cropped off the canvas ----------
function Cropped() {
  return (
    <Slide>
      {/* The words cut off by the edges of a box. */}
      <div style={at([496, 429, 449, 166], { overflow: "hidden" })}>
        <Word x={-28} y={-22} size={114.044}>
          OFF
        </Word>
        <Word x={42} y={66} size={114.044}>
          CANVAS
        </Word>
      </div>
      <Word x={921} y={488} size={24.527}>
        ®
      </Word>
      <Mono x={714} y={435} lines={STACKED} />
    </Slide>
  );
}

// ---------- 14. On a grid of dots ----------
function Dots() {
  return (
    <Slide>
      <div className={own.dots} style={at([477, 333, 486, 286])}>
        {Array.from({ length: 8 * 13 }, (_, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={`${DIR}/dot.svg`} alt="" />
        ))}
      </div>
      <div style={at([622, 530, 341, 89], { background: "#000" })} />
      <Word x={640} y={546} size={49.029}>
        OFF CANVAS
      </Word>
      <Word x={931} y={544} size={18.396}>
        ®
      </Word>
      <Mono x={476} y={654} lines={[BUILT]} />
      <Mono x={715} y={654} lines={["//"]} />
      <Mono x={837} y={654} lines={[MADE]} />
    </Slide>
  );
}

export const OFF_CANVAS_SLIDES = [
  Tabs,
  Dash,
  Slash,
  Step,
  Switch,
  Frame,
  Rings,
  Tab,
  Curve,
  Line,
  Viewfinder,
  Strips,
  Cropped,
  Dots,
];
