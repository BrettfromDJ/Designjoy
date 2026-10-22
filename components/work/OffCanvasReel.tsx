import { Inter_Tight } from "next/font/google";
import { BrandReel } from "./BrandReel";
import { OFF_CANVAS_SLIDES } from "./OffCanvasSlides";

// The design's Delight is a paid face; Inter Tight is a close, free grotesque.
const interTight = Inter_Tight({ subsets: ["latin"], weight: "400", variable: "--font-off-canvas", preload: false });

/** The Off Canvas logo explorations (see OffCanvasSlides), flicking through
 *  one after another. */
export function OffCanvasReel() {
  return (
    <BrandReel
      slides={OFF_CANVAS_SLIDES}
      transitions={["cut"]}
      showMs={550}
      className={interTight.variable}
      label="Off Canvas logo exploration: fourteen lockups of the wordmark, one after another"
    />
  );
}
