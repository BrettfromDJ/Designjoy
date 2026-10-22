import { DM_Mono, Inter_Tight } from "next/font/google";
import { BrandReel } from "./BrandReel";
import { KINOBODY_SLIDES } from "./KinobodySlides";

// The design's labels are in DM Mono; its wordmark is in Metrik Black, a paid
// face, stood in for by Inter Tight's black.
const dmMono = DM_Mono({ subsets: ["latin"], weight: "400", variable: "--font-dm-mono", preload: false });
const interTight = Inter_Tight({ subsets: ["latin"], weight: "900", variable: "--font-kinobody", preload: false });

// Kinobody's own ways between slides, from its artwork: cutting in along the
// K's diagonal; zooming through the K into its stem; the orange bar from the
// lockup sweeping across; dealt in like a business card; lifted like a bag;
// and pushed along like the row of cards.
const TRANSITIONS = ["slash", "mark", "across", "deal", "lift", "push"] as const;

/** The Kinobody rebrand (see KinobodySlides), as a reel. */
export function KinobodyReel() {
  return (
    <BrandReel
      slides={KINOBODY_SLIDES}
      transitions={[...TRANSITIONS]}
      bars={["#ff5300"]}
      mark="/work/kinobody/k-mark.svg"
      // The mark grown 19.5 times, with the middle of its solid stem (which
      // is then wider than the slide) over the middle of the slide.
      markEnd={[7619, 6276, -60, -2627.5]}
      className={`${dmMono.variable} ${interTight.variable}`}
      label="Kinobody rebrand: business cards, icon mark, lockup, swing tag, paper bags and packaging"
    />
  );
}
