import "server-only";
import { CAL_LINK } from "./cal";

// Cal.com's API, for showing open times and booking the intro call with our
// own calendar design. Bookings land in the Cal.com account, which sends the
// confirmation emails and calendar invites as usual.
const API = "https://api.cal.com/v2";
const [USERNAME, EVENT_SLUG] = CAL_LINK.split("/");

function headers(version: string): HeadersInit {
  const key = process.env.CAL_API_KEY;
  return {
    "Content-Type": "application/json",
    "cal-api-version": version,
    ...(key ? { Authorization: `Bearer ${key}` } : {}),
  };
}

/** Open start times (ISO strings), grouped by date, between two YYYY-MM-DD dates. */
export async function getSlots(start: string, end: string, timeZone: string) {
  const params = new URLSearchParams({
    username: USERNAME,
    eventTypeSlug: EVENT_SLUG,
    start,
    end,
    timeZone,
  });
  const res = await fetch(`${API}/slots?${params}`, {
    headers: headers("2024-09-04"),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => null)) as {
    data?: Record<string, unknown[]>;
  } | null;
  if (!res.ok || !body?.data)
    throw new Error(`Cal.com slots failed (${res.status})`);
  const days: Record<string, string[]> = {};
  for (const [date, slots] of Object.entries(body.data)) {
    // Each slot is { start } (or { time } in older responses).
    const times = slots
      .map((slot) =>
        typeof slot === "string"
          ? slot
          : ((slot as { start?: string; time?: string }).start ??
            (slot as { time?: string }).time),
      )
      .filter((t): t is string => typeof t === "string");
    if (times.length) days[date] = times;
  }
  return days;
}

export type BookingRequest = {
  start: string;
  name: string;
  email: string;
  timeZone: string;
  reason?: string;
};

/** Books the intro call. Returns Cal.com's error message if it can't. */
export async function createBooking({
  start,
  name,
  email,
  timeZone,
  reason,
}: BookingRequest) {
  const res = await fetch(`${API}/bookings`, {
    method: "POST",
    headers: headers("2024-08-13"),
    body: JSON.stringify({
      start: new Date(start).toISOString(),
      username: USERNAME,
      eventTypeSlug: EVENT_SLUG,
      attendee: { name, email, timeZone, language: "en" },
      // The event's required "What is this meeting about?" field: their reason,
      // or a sensible default.
      bookingFieldsResponses: { title: reason || `15 min intro call with ${name}` },
    }),
  });
  const body = (await res.json().catch(() => null)) as {
    error?: { message?: string };
    message?: string;
  } | null;
  if (!res.ok) {
    const message = body?.error?.message ?? body?.message;
    throw new Error(
      typeof message === "string"
        ? message
        : `Cal.com booking failed (${res.status})`,
    );
  }
}
