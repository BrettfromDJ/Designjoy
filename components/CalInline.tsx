"use client";

import { useEffect, useId } from "react";
import { CAL_LINK, CAL_NAMESPACE, loadCal } from "@/lib/cal";

/** The booking calendar embedded in the page. */
export function CalInline({ className }: { className?: string }) {
  const id = `cal-inline-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    loadCal().ns[CAL_NAMESPACE]("inline", {
      elementOrSelector: `#${id}`,
      calLink: CAL_LINK,
      config: { layout: "month_view", useSlotsViewOnSmallScreen: "true", theme: "dark" },
    });
  }, [id]);

  return <div id={id} className={className} />;
}
