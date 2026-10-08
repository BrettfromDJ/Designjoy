import { getSlots } from "@/lib/cal-api";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/booking/slots?start=YYYY-MM-DD&end=YYYY-MM-DD&tz=Area/City
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const start = params.get("start") ?? "";
  const end = params.get("end") ?? "";
  const tz = params.get("tz") || "UTC";
  if (!DATE.test(start) || !DATE.test(end)) return Response.json({ error: "Bad dates." }, { status: 400 });
  try {
    return Response.json({ days: await getSlots(start, end, tz) });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Couldn't load open times." }, { status: 502 });
  }
}
