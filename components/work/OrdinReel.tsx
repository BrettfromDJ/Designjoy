import { Marcellus } from "next/font/google";
import { BrandReel } from "./BrandReel";
import { ORDIN_SLIDES } from "./OrdinSlides";

// The design's OVR Demorny is a paid face; Marcellus has the same flared,
// carved capitals.
const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-marcellus", preload: false });

// Ordin's own ways between slides, from its artwork: the next slide showing
// through the column mark as it grows; two dark panels closing like temple
// doors; opening out from the logomark's safe area; and rising like a plinth.
const TRANSITIONS = ["mark", "doors", "frame", "lift"] as const;

/** The Ordin identity system (see OrdinSlides), as a reel. */
export function OrdinReel() {
  return (
    <BrandReel
      slides={ORDIN_SLIDES}
      transitions={[...TRANSITIONS]}
      bars={["#121212", "#121212"]}
      frame={[310, 520, 315, 520]}
      mark="/work/ordin/o1-mark.svg"
      className={marcellus.variable}
      label="Ordin identity system: logomark, typography, signage, billboards and an embossed mark"
    />
  );
}
