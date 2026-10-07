import { getSampleQuestions } from "@/lib/sample-questions";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    { questions: await getSampleQuestions() },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
  );
}
