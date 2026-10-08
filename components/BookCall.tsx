"use client";

import { useEffect, useState } from "react";
import { CAL_LINK } from "@/lib/cal";
import { CheckIcon } from "./Icons";
import { BotFace } from "./BotFace";
import styles from "./BookCall.module.css";

const DAYS_SHOWN = 5;
const LOOK_AHEAD_DAYS = 21;
const CAL_URL = `https://cal.com/${CAL_LINK}`;

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
// Dates come back as YYYY-MM-DD; noon avoids any day shift when formatting.
const dayOf = (key: string) => new Date(`${key}T12:00:00`);
const fmtTime = (iso: string, timeZone: string) =>
  new Date(iso)
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
    })
    .toLowerCase();
const fmtDay = (key: string) =>
  dayOf(key).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

type Days = Record<string, string[]>;

/** Book the 15 minute intro call: day → time → name and email → booked. Powered by Cal.com. */
export function BookCall() {
  const [timeZone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  );
  const [days, setDays] = useState<Days | null>(null);
  const [failed, setFailed] = useState(false);
  const [page, setPage] = useState(0);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + LOOK_AHEAD_DAYS);
    const params = new URLSearchParams({
      start: isoDate(start),
      end: isoDate(end),
      tz: timeZone,
    });
    fetch(`/api/booking/slots?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("slots"))))
      .then((data: { days?: Days }) => setDays(data.days ?? {}))
      .catch(() => setFailed(true));
  }, [timeZone]);

  async function book(event: React.FormEvent) {
    event.preventDefault();
    if (!time || booking) return;
    setBooking(true);
    setError(null);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: time, name, email, timeZone, reason }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok)
        throw new Error(data.error ?? "That time couldn't be booked.");
      setBooked(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "That time couldn't be booked.",
      );
    } finally {
      setBooking(false);
    }
  }

  const meta = (
    <div className={styles.meta}>
      <span className={styles.avatar}>
        <BotFace size={24} />
      </span>
      <div>
        <p className={styles.metaTitle}>15 min intro call</p>
        <p className={styles.metaSub}>Video call · with Designjoy</p>
      </div>
    </div>
  );

  if (booked && day && time) {
    return (
      <div className={styles.done} role="status">
        <span className={styles.check}>
          <CheckIcon />
        </span>
        <h3>You&apos;re booked.</h3>
        <p>
          {fmtDay(day)} at {fmtTime(time, timeZone)}. A calendar invite is on
          its way to {email}.
        </p>
      </div>
    );
  }

  const fallback = (message: string) => (
    <div className={styles.wrap}>
      {meta}
      <p className={styles.hint}>
        {message}{" "}
        <a href={CAL_URL} target="_blank" rel="noopener noreferrer">
          Open the calendar on Cal.com
        </a>
        .
      </p>
    </div>
  );

  if (failed) return fallback("The calendar didn't load.");
  if (!days) {
    return (
      <div className={styles.wrap} aria-busy="true">
        {meta}
        <div className={styles.skeleton} aria-hidden="true" />
      </div>
    );
  }

  const keys = Object.keys(days)
    .sort()
    .slice(0, DAYS_SHOWN * 2);
  if (keys.length === 0)
    return fallback("No open times in the next few weeks.");
  const pages = Math.ceil(keys.length / DAYS_SHOWN);
  const shown = keys.slice(page * DAYS_SHOWN, page * DAYS_SHOWN + DAYS_SHOWN);
  const month = dayOf(shown[0]).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={styles.wrap}>
      {meta}
      <div className={styles.month}>
        <p>{month}</p>
        <div className={styles.arrows}>
          <button
            type="button"
            aria-label="Earlier days"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Later days"
            disabled={page >= pages - 1}
            onClick={() => setPage(page + 1)}
          >
            →
          </button>
        </div>
      </div>
      <div className={styles.days} role="group" aria-label="Pick a day">
        {shown.map((key) => (
          <button
            key={key}
            type="button"
            className={styles.day}
            aria-pressed={key === day}
            onClick={() => {
              setDay(key);
              setTime(null);
              setError(null);
            }}
          >
            <small>
              {dayOf(key).toLocaleDateString("en-US", { weekday: "short" })}
            </small>
            <b>{dayOf(key).getDate()}</b>
          </button>
        ))}
      </div>

      {!day ? (
        <p className={styles.hint}>
          Pick a day to see open times. Times in {timeZone.replace(/_/g, " ")}.
        </p>
      ) : (
        <form className={styles.form} onSubmit={book}>
          <label className="visually-hidden" htmlFor="book-time">
            Time
          </label>
          <div className={styles.select}>
            <select
              id="book-time"
              required
              value={time ?? ""}
              onChange={(e) => {
                setTime(e.target.value || null);
                setError(null);
              }}
            >
              <option value="" disabled>
                Pick a time ({days[day].length} open)
              </option>
              {days[day].map((slot) => (
                <option key={slot} value={slot}>
                  {fmtTime(slot, timeZone)}
                </option>
              ))}
            </select>
          </div>
          <label className="visually-hidden" htmlFor="book-name">
            Your name
          </label>
          <input
            id="book-name"
            required
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label className="visually-hidden" htmlFor="book-email">
            Email
          </label>
          <input
            id="book-email"
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="visually-hidden" htmlFor="book-reason">
            Reason for this meeting
          </label>
          <input
            id="book-reason"
            autoComplete="off"
            maxLength={200}
            placeholder="Reason for this meeting"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button type="submit" className={styles.confirm} disabled={booking}>
            {booking ? "Booking…" : time ? `Confirm ${fmtTime(time, timeZone)}` : "Confirm booking"}
          </button>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
