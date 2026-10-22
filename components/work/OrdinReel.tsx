import { Marcellus } from "next/font/google";
import { BrandReel } from "./BrandReel";
import { ORDIN_SLIDES } from "./OrdinSlides";

// The design's OVR Demorny is a paid face; Marcellus has the same flared,
// carved capitals.
const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-marcellus", preload: false });

// Ordin's colours, for the stripes between slides.
const BARS = ["#121212", "#ddded8", "#ff7708", "#303030", "#121212", "#ddded8", "#ff7708", "#303030", "#121212", "#ddded8"];

/** The Ordin identity system (see OrdinSlides), as a reel. */
export function OrdinReel() {
  return (
    <BrandReel
      slides={ORDIN_SLIDES}
      bars={BARS}
      className={marcellus.variable}
      label="Ordin identity system: logomark, typography, signage, billboards and an embossed mark"
    />
  );
}
