"use client";

import { useEffect, useState } from "react";
import { bookCall } from "@/lib/ask-box";
import styles from "./CallCard.module.css";

type Days = Record<string, string[]>;

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Open times over the next week, in the visitor's time zone: null while loading, [] if none or it fails. */
function useSlots() {
  const [days, setDays] = useState<Days | null>(null);
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + 7);
    const params = new URLSearchParams({ start: isoDate(start), end: isoDate(end), tz });
    fetch(`/api/booking/slots?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("slots"))))
      .then((data: { days?: Days }) => setDays(data.days ?? {}))
      .catch(() => setDays({}));
  }, []);
  return days;
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
const fmtDay = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "short" });
};

/**
 * "Not sure yet?": the next few open times for the 15 min intro call.
 * Tapping one opens booking with it already picked. With no times open
 * this week (or the calendar unreachable), a plain button opens booking.
 */
export function CallCard() {
  const days = useSlots();
  // The visitor's time zone, which the times are shown in, e.g. "Los Angeles
  // time". Set after mount, since the server doesn't know it.
  const [zone, setZone] = useState("");
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) setZone(`${tz.split("/").pop()?.replace(/_/g, " ")} time`);
  }, []);
  // The first few open times, a couple from each day.
  const next = days
    ? Object.keys(days)
        .sort()
        .flatMap((key) => days[key].slice(0, 2))
        .slice(0, 3)
    : null;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <p className={styles.label}>Not sure yet?</p>
        {next && next.length > 0 && (
          <span className={styles.live}>
            <span className={styles.dot} aria-hidden="true" />
            Open this week
          </span>
        )}
      </div>
      <p className={styles.title}>Grab 15 minutes with us.</p>
      {next && next.length === 0 ? (
        <button type="button" className={styles.button} onClick={() => bookCall()}>
          Book a 15 min intro call
        </button>
      ) : (
        <>
          <div className={styles.slots} aria-busy={!next}>
            {next
              ? next.map((iso) => (
                  <button key={iso} type="button" className={styles.slot} onClick={() => bookCall(iso)}>
                    <span>{fmtDay(iso)}</span>
                    {fmtTime(iso)}
                  </button>
                ))
              : [0, 1, 2].map((i) => <span key={i} className={styles.slotEmpty} aria-hidden="true" />)}
          </div>
          <div className={styles.foot}>
            <button type="button" className={styles.more} onClick={() => bookCall()}>
              See all times <span aria-hidden="true">→</span>
            </button>
            {zone && <span className={styles.zone}>{zone}</span>}
          </div>
        </>
      )}
    </div>
  );
}
