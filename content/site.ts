// Everything editable on the homepage lives here: navigation, pricing plans,
// the portfolio work that fills the masonry grid, and the fixed cards that
// always sit in the same slot.

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "/how-it-works" },
  { label: "FAQs", href: "/faqs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Intro call", href: "/intro-call" },
];

export type Plan = {
  id: "monthly-club" | "pro";
  name: string;
  price: string;
  description: string;
  features: string[];
};

export const plans: Plan[] = [
  {
    id: "monthly-club",
    name: "Monthly Club",
    price: "$4,995",
    description: "Lorem ipsum dolor sit amet.",
    features: [
      "One request at a time",
      "Avg. 48 hour delivery",
      "Unlimited brands, requests & revisions",
      "Front-end development",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$7,995",
    description: "Lorem ipsum dolor sit amet.",
    features: [
      "Two requests at a time",
      "Avg. 48 hour delivery",
      "Unlimited brands, requests & revisions",
      "Front-end development",
    ],
  },
];

export const introCallHref = "/intro-call";

export type ClientLogo = {
  name: string;
  /** Logo file in public/logos/, e.g. "/logos/acme.svg". Without one, the name is shown as text. */
  src?: string;
  /** Display height in px (default 18). Tweak per logo so they look the same size. */
  height?: number;
  /** For text logos (no `src`): the typeface style and an optional small mark. */
  font?: "serif" | "serif-italic" | "display" | "grotesk" | "mono" | "sans";
  mark?: "dot" | "ring" | "square" | "triangle" | "arc";
};

// Companies shown in the "Trusted by" strip on the pricing card (hidden when
// empty). Logos are shown in white, so any colour logo works; SVG or
// transparent PNG looks best.
// These are placeholder wordmarks with made-up names. Swap in real clients:
// { name: "Acme", src: "/logos/acme.svg" }
export const clientLogos: ClientLogo[] = [
  { name: "Halcyon", font: "serif" },
  { name: "NORTHBOUND", font: "mono", mark: "triangle" },
  { name: "kestrel", font: "display" },
  { name: "Lumen&Co", font: "grotesk", mark: "dot" },
  { name: "Fieldnote", font: "serif-italic" },
  { name: "Parcel", font: "sans", mark: "square" },
  { name: "VANTAGE", font: "display" },
  { name: "Orbit", font: "grotesk", mark: "ring" },
  { name: "Meridian", font: "serif" },
  { name: "STILLWATER", font: "mono", mark: "arc" },
  { name: "quarry", font: "display" },
  { name: "Tandem", font: "sans", mark: "dot" },
];

export type WorkItem = {
  id: string;
  title: string;
  kind: "image" | "video";
  src: string;
  width: number;
  height: number;
};

// Sample portfolio pieces, shown until projects are uploaded at /admin.
// Work flows into the masonry grid around the fixed cards, in order, each
// piece going into whichever column is currently shortest.
export const sampleWork: WorkItem[] = [
  { id: "ordin-subway-poster", kind: "image", title: "Ordin — subway poster", src: "/work/ordin-subway-poster.png", width: 340, height: 242 },
  { id: "ordin-billboard-night", kind: "image", title: "Ordin — billboard", src: "/work/ordin-billboard-night.png", width: 340, height: 241 },
  { id: "ordin-billboard-bridge", kind: "image", title: "Ordin — street billboard", src: "/work/ordin-billboard-bridge.png", width: 340, height: 241 },
  { id: "ordin-horse-poster", kind: "image", title: "Ordin — poster", src: "/work/ordin-horse-poster.png", width: 340, height: 241 },
  { id: "ordin-operating-system", kind: "image", title: "Ordin — illustration", src: "/work/ordin-operating-system.png", width: 340, height: 242 },
  { id: "ordin-machine-order", kind: "image", title: "Ordin — typography", src: "/work/ordin-machine-order.png", width: 340, height: 242 },
  { id: "ordin-machines-in-motion", kind: "image", title: "Ordin — logomark", src: "/work/ordin-machines-in-motion.png", width: 338, height: 240 },
  { id: "ordin-embossed-mark", kind: "image", title: "Ordin — embossed mark", src: "/work/ordin-embossed-mark.png", width: 340, height: 242 },
  { id: "ordin-type-specimen", kind: "image", title: "Ordin — type specimen", src: "/work/ordin-type-specimen.png", width: 340, height: 237 },
];

export type ColumnCount = 1 | 2 | 3 | 4;

// Where a fixed card sits for each column count: `column` is 0-based (or
// "last" for the right-most column) and `row` is its position within that
// column. Work items never take a fixed card's slot.
export type Slot = { column: number | "last"; row: number };

export type FixedCard =
  | { id: string; kind: "pricing"; slots: Record<ColumnCount, Slot> }
  // The "Scope of work" board; its services come from `scopeOfWork`.
  | { id: string; kind: "scope"; minHeight: number; slots: Record<ColumnCount, Slot> }
  | {
      id: string;
      kind: "info";
      // Approximate height at a 340px column width; the card grows to fit its content.
      minHeight: number;
      eyebrow?: string;
      title?: string;
      body?: string;
      slots: Record<ColumnCount, Slot>;
    };

// Services listed on the "Scope of work" board, in the order they appear.
export const scopeOfWork = [
  "Front-end development",
  "Web design",
  "MVP builds",
  "Logos",
  "Slide decks",
  "Branding",
  "Social media",
  "UI/UX design",
  "Webflow development",
  "Mobile apps",
  "Print design",
  "Email",
  "Display ads",
  "Icons",
  "Brand guides",
];

// Info cards stay hidden until they have an eyebrow, title, or body.
export const fixedCards: FixedCard[] = [
  {
    id: "pricing",
    kind: "pricing",
    slots: {
      4: { column: "last", row: 0 },
      3: { column: "last", row: 0 },
      2: { column: "last", row: 0 },
      1: { column: 0, row: 1 },
    },
  },
  {
    id: "info-a",
    kind: "info",
    minHeight: 230,
    slots: {
      4: { column: "last", row: 1 },
      3: { column: "last", row: 1 },
      2: { column: "last", row: 1 },
      1: { column: 0, row: 4 },
    },
  },
  {
    id: "info-b",
    kind: "info",
    minHeight: 338,
    slots: {
      4: { column: "last", row: 2 },
      3: { column: 0, row: 3 },
      2: { column: 0, row: 3 },
      1: { column: 0, row: 7 },
    },
  },
  {
    id: "scope",
    kind: "scope",
    minHeight: 429,
    slots: {
      4: { column: 1, row: 2 },
      3: { column: 1, row: 2 },
      2: { column: 1, row: 4 },
      1: { column: 0, row: 10 },
    },
  },
];
