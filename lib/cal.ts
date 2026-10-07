// Cal.com booking embed for the 15 minute intro call.

export const CAL_LINK = "designjoy/15min";
export const CAL_NAMESPACE = "15min";
const CAL_CONFIG = { layout: "month_view", useSlotsViewOnSmallScreen: "true", theme: "dark" };

/** Spread onto any button to make clicking it open the booking pop-up. */
export const calTrigger = {
  "data-cal-link": CAL_LINK,
  "data-cal-namespace": CAL_NAMESPACE,
  "data-cal-config": JSON.stringify(CAL_CONFIG),
} as const;

type CalApi = ((...args: unknown[]) => void) & {
  loaded?: boolean;
  ns: Record<string, (...args: unknown[]) => void>;
  q?: unknown[];
};

declare global {
  interface Window {
    Cal?: CalApi;
  }
}

/**
 * Loads Cal.com's embed script once (their standard loader, ported from the
 * embed snippet) and sets up the intro-call namespace. Safe to call repeatedly.
 */
export function loadCal(): CalApi {
  const w = window;
  if (!w.Cal) {
    const push = (api: { q: unknown[] }, args: unknown) => api.q.push(args);
    const cal = function (this: unknown, ...args: unknown[]) {
      const c = w.Cal!;
      if (!c.loaded) {
        c.ns = {};
        c.q = c.q || [];
        document.head.appendChild(document.createElement("script")).src =
          "https://app.cal.com/embed/embed.js";
        c.loaded = true;
      }
      if (args[0] === "init") {
        const api = Object.assign((...a: unknown[]) => push(api, a), { q: [] as unknown[] });
        const namespace = args[1];
        if (typeof namespace === "string") {
          c.ns[namespace] = c.ns[namespace] || api;
          push(c.ns[namespace] as unknown as { q: unknown[] }, args);
          push(c as unknown as { q: unknown[] }, ["initNamespace", namespace]);
        } else push(c as unknown as { q: unknown[] }, args);
        return;
      }
      push(c as unknown as { q: unknown[] }, args);
    } as CalApi;
    w.Cal = cal;

    cal("init", CAL_NAMESPACE, { origin: "https://app.cal.com" });
    cal.ns[CAL_NAMESPACE]("ui", {
      theme: "dark",
      cssVarsPerTheme: { light: { "cal-brand": "#000000" }, dark: { "cal-brand": "#fafafa" } },
      hideEventTypeDetails: false,
      layout: "month_view",
    });
  }
  return w.Cal;
}
