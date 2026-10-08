import { createBooking } from "@/lib/cal-api";

const clean = (value: unknown, max = 200) => (typeof value === "string" ? value.trim().slice(0, max) : "");

// POST /api/booking { start, name, email, timeZone } books the intro call.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const start = clean(body.start, 40);
  const name = clean(body.name);
  const email = clean(body.email);
  const timeZone = clean(body.timeZone, 60) || "UTC";
  if (!start || Number.isNaN(Date.parse(start)) || !name || !/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json({ error: "Please add your name and a valid email." }, { status: 400 });
  }
  try {
    await createBooking({ start, name, email, timeZone });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Booking failed", error);
    // Pass on Cal.com's message only when it reads like a sentence, not a code.
    const raw = error instanceof Error ? error.message : "";
    const message = raw && !raw.startsWith("Cal.com") && !/[_{}]/.test(raw) ? raw : null;
    return Response.json(
      { error: message ?? "That time couldn't be booked. Please pick another, or try again." },
      { status: 502 },
    );
  }
}
