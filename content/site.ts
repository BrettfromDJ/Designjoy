// Everything editable on the homepage lives here: navigation, pricing plans,
// the portfolio work that fills the masonry grid, and the fixed cards that
// always sit in the same slot.

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "FAQs", href: "/faqs" },
  { label: "Pricing", href: "/pricing" },
  // Shown as a white pill so it stands out as the call to action.
  { label: "Book a call", href: "/intro-call", cta: true },
];

export type Plan = {
  id: "monthly-club" | "design-partner";
  name: string;
  price: string;
  description: string;
  /** Optional short tag shown next to the plan name, e.g. "New". */
  tag?: string;
  /** Gives the plan a slowly travelling edge highlight, like the ask box. */
  highlight?: boolean;
  features: string[];
};

export const plans: Plan[] = [
  {
    id: "monthly-club",
    name: "Monthly Club",
    price: "$4,995",
    description: "Perfect for steady workloads.",
    features: [
      "Unlimited design requests",
      "Unlimited revisions",
      "~48-hour average delivery",
      "Async communication via Trello",
      "Pause or resume anytime",
    ],
  },
  {
    id: "design-partner",
    name: "Design Partner",
    tag: "New",
    highlight: true,
    price: "$7,995",
    description: "Perfect for fast-moving teams.",
    features: [
      "Everything in Monthly Club",
      "Daily design updates",
      "Direct Slack communication",
      "Faster feedback loops",
      "Closer day-to-day collaboration",
    ],
  },
];


// Stripe's billing page, where clients update their card, see invoices or
// cancel. Set NEXT_PUBLIC_STRIPE_PORTAL_URL in Vercel to the live link at launch.
export const billingPortalUrl =
  process.env.NEXT_PUBLIC_STRIPE_PORTAL_URL ||
  "https://billing.stripe.com/p/login/test_28E00j0PR49s9wT2v57bW00";

// How soon new clients can expect their Trello invite (shown after paying).
export const trelloInviteEta = "within a few hours";

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
  // "How it works": a looping board demo that opens large in a lightbox.
  | { id: string; kind: "howItWorks"; minHeight: number; slots: Record<ColumnCount, Slot> }
  // The Designjoy Labs card; it previews the tools in `content/labs.ts`.
  | { id: string; kind: "labs"; minHeight: number; slots: Record<ColumnCount, Slot> }
  // The "Highlights" card; it shuffles through `highlights`.
  | { id: string; kind: "highlights"; minHeight: number; slots: Record<ColumnCount, Slot> }
  // The "Kind words" card; its quotes come from `testimonials`.
  | { id: string; kind: "testimonial"; minHeight: number; slots: Record<ColumnCount, Slot> }
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

export type Testimonial = {
  quote: string;
  /** A person: name, role and photo (initials are shown until there's a photo). */
  name?: string;
  role?: string;
  photo?: string;
  /** Or a company: its name, and a logo file in public/logos/ (shown in white). */
  company?: string;
  logo?: string;
};

export type HighlightIcon = "trophy" | "ribbon" | "star" | "medal";
export type Highlight = {
  icon: HighlightIcon;
  /** The award or recognition, e.g. "Site of the Day". */
  title: string;
  /** Who gave it and for what, e.g. "Awwwards · Ordin, 2026". */
  detail: string;
};

// Shown one at a time in the "Highlights" card. Replace the [bracketed]
// placeholders with your real awards before launch.
export const highlights: Highlight[] = [
  { icon: "trophy", title: "[Award name]", detail: "[Awarding body] · [Project], [Year]" },
  { icon: "ribbon", title: "[Award name]", detail: "[Awarding body] · [Project], [Year]" },
  { icon: "star", title: "[Feature or mention]", detail: "[Publication] · [Project], [Year]" },
  { icon: "medal", title: "[Award name]", detail: "[Awarding body] · [Project], [Year]" },
];

// Quotes shown one at a time in the "Kind words" card, in this order.
export const testimonials: Testimonial[] = [
  { quote: "Designjoy shows that they know the art of subtlety.", company: "Webflow" },
  { quote: "Design is everything, and these guys have nailed it.", name: "Kevin O'Leary", role: "Shark Tank" },
];

export type Faq = { question: string; answer: string };

// Shown on the FAQ page as tappable questions, and given to the chatbot so it
// answers them the same way everywhere.
export const faqs: Faq[] = [
  {
    question: "How does the subscription work?",
    answer:
      "Subscribe to a plan and add as many design requests as you like. We work through them one at a time on Monthly Club, delivering each in about 48 hours on average.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Monthly Club is $4,995/mo and Design Partner is $7,995/mo. One flat price, no contracts or surprise invoices.",
  },
  {
    question: "How fast will I get my designs?",
    answer:
      "Most requests are delivered in about 48 hours. Bigger requests are broken into smaller pieces so you see progress every couple of days.",
  },
  {
    question: "Can I pause or cancel?",
    answer:
      "Yes, pause or cancel anytime. There's no lock-in. To pause, just let us know. You can cancel yourself at designjoy.co/billing. [billing]",
  },
  {
    question: "How do I manage billing?",
    answer:
      "Go to designjoy.co/billing and sign in with the code we email you. From there you can update your card, download invoices, switch plans or cancel. [billing]",
  },
  {
    question: "What kind of design do you do?",
    answer:
      "Front-end development, web design, MVP builds, logos, slide decks, branding, social media, UI/UX design, Webflow development, mobile apps, print design, email, display ads, icons and brand guides.",
  },
  {
    question: "Is there a limit to how many requests I can make?",
    answer:
      "No. Add as many requests as you like. They're worked on one at a time, in the order you choose.",
  },
  {
    question: "What if I don't love the design?",
    answer: "Revisions are unlimited. We'll keep refining until it's right.",
  },
  {
    question: "Can you build the site too?",
    answer: "Yes. Front-end development and Webflow development are included.",
  },
  {
    question: "Can I use it for more than one brand?",
    answer: "Yes. Unlimited brands are included in your subscription.",
  },
  {
    question: "Can I talk to someone first?",
    answer: "Of course. Book a 15 minute intro call and we'll walk you through how it works.",
  },
];

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
    id: "testimonials",
    kind: "testimonial",
    minHeight: 250,
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
    id: "highlights",
    kind: "highlights",
    minHeight: 230,
    slots: {
      4: { column: 2, row: 1 },
      3: { column: 0, row: 1 },
      2: { column: 0, row: 1 },
      1: { column: 0, row: 3 },
    },
  },
  {
    id: "how-it-works",
    kind: "howItWorks",
    minHeight: 330,
    slots: {
      4: { column: 0, row: 2 },
      3: { column: 1, row: 1 },
      2: { column: 1, row: 2 },
      1: { column: 0, row: 5 },
    },
  },
  {
    id: "labs",
    kind: "labs",
    minHeight: 378,
    // The slots the empty "info-b" card would take; move one if both show.
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
