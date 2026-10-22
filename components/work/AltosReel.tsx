import { Anta } from "next/font/google";
import { ALTOS_SLIDES } from "./AltosSlides";
import { BrandReel } from "./BrandReel";

// The brand's display face, for its labels and logotype.
const anta = Anta({ subsets: ["latin"], weight: "400", variable: "--font-anta", preload: false });

// The Horizon Pattern's colours, for the stripes between slides.
const BARS = ["#ff4000", "#000", "#828600", "#afb9ea", "#ff4000", "#000", "#828600", "#afb9ea", "#ff4000", "#000"];

/** The Altos brand book (see AltosSlides), as a reel. */
export function AltosReel() {
  return (
    <BrandReel
      slides={ALTOS_SLIDES}
      bars={BARS}
      className={anta.variable}
      label="Altos brand book: wordmark, Horizon Pattern, posters, logo mark, applications, colours and type"
    />
  );
}
