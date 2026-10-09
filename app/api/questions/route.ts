import { after } from "next/server";
import { faqs } from "@/content/site";
import { parseAnswer } from "@/lib/chat";
import { logQuestion, pageFrom } from "@/lib/questions";

// Logs a tapped FAQ chip. Typed questions are logged by /api/chat itself.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { question?: unknown } | null;
  const faq = faqs.find((f) => f.question === body?.question);
  if (!faq) return Response.json({ error: "Unknown question." }, { status: 400 });
  const page = pageFrom(request);
  after(() =>
    logQuestion({ question: faq.question, answer: parseAnswer(faq.answer).text, source: "faq", page }),
  );
  return new Response(null, { status: 204 });
}
