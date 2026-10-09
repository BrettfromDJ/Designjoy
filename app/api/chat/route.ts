import { after } from "next/server";
import { faqs } from "@/content/site";
import { BILLING_TAG, BOOK_CALL_TAG, UNSURE_TAG, parseAnswer } from "@/lib/chat";
import { logQuestion, pageFrom } from "@/lib/questions";
import { suggestAnswer } from "@/lib/suggest";

const PLANS_TAG = "[plans]";
const HOW_IT_WORKS_TAG = "[how-it-works]";
import { getKnowledgeForChat } from "@/lib/knowledge";

type Message = { role: "user" | "assistant"; content: string };

const MAX_HISTORY = 12;
const MAX_MESSAGE_LENGTH = 2000;

async function systemPrompt() {
  const knowledge = await getKnowledgeForChat();
  return [
    "You are the assistant on designjoy.co, answering questions from prospective and current clients.",
    "Answer only using the knowledge base below. If the answer isn't there, say you're not sure and suggest booking a 15 minute intro call.",
    "Be friendly, concise (2-4 sentences), and never make up prices, policies, or timelines.",
    `Whenever you suggest booking an intro call, or the visitor seems ready to talk to someone (pricing for their specific needs, wanting to get started, questions you can't answer), end your reply with ${BOOK_CALL_TAG} on its own line. The site turns it into a booking button, so don't mention the tag or describe a button.`,
    `When the visitor is weighing up cost, plans or what's included, end your reply with ${PLANS_TAG} on its own line; the site turns it into a "Compare plans" button.`,
    `When they ask how the process works (requests, the Trello board, turnaround, revisions), end your reply with ${HOW_IT_WORKS_TAG} on its own line; the site turns it into a "See how it works" button that plays a short tour.`,
    `If the knowledge base doesn't answer the question, also end your reply with ${UNSURE_TAG} on its own line. The site hides it; it flags the question so the owner can add an answer.`,
    "Use at most two of these tags in one reply, most useful first, and only when they fit the question. Never mention the tags or describe the buttons.",
    `When a current client asks about billing, invoices, updating their card, switching plans or cancelling, tell them they can do it themselves at designjoy.co/billing (they sign in with a code sent to their email), and end your reply with ${BILLING_TAG} on its own line. The site turns it into a "Manage billing" button.`,
    "",
    "<knowledge_base>",
    knowledge.replace(/<!--[\s\S]*?-->/g, "").trim(),
    "",
    "## FAQ (as shown on the site)",
    ...faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`),
    "</knowledge_base>",
  ].join("\n");
}

function parseMessages(body: unknown): Message[] | null {
  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;
  const valid = messages.every(
    (m) =>
      (m?.role === "user" || m?.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.length <= MAX_MESSAGE_LENGTH,
  );
  return valid ? (messages as Message[]).slice(-MAX_HISTORY) : null;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  const messages = parseMessages(await request.json().catch(() => null));
  if (!messages) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Log the visitor's question with the answer, once the answer has finished.
  const question = messages[messages.length - 1];
  const page = pageFrom(request);
  let finished: (answer: { text: string; unsure: boolean }) => void = () => {};
  const answered = new Promise<{ text: string; unsure: boolean }>((resolve) => {
    finished = resolve;
    // If the visitor leaves mid-answer the stream never finishes; log anyway.
    setTimeout(() => resolve({ text: "(The answer was cut off.)", unsure: false }), 60_000);
  });
  if (question.role === "user") {
    after(async () => {
      const { text, unsure } = await answered;
      // Questions it couldn't answer get flagged, with a drafted answer to approve.
      const suggestion = unsure ? await suggestAnswer(question.content) : undefined;
      await logQuestion({
        question: question.content,
        answer: text,
        source: "typed",
        page,
        ...(unsure ? { flagged: true, suggestion } : {}),
      });
    });
  }

  if (!apiKey) {
    finished({ text: "(Chat isn't connected, so no answer was given.)", unsure: false });
    return Response.json(
      { error: "Chat isn't connected yet — please book an intro call with any questions.", bookCall: true },
      { status: 503 },
    );
  }

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      stream: true,
      messages: [{ role: "system", content: await systemPrompt() }, ...messages],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    finished({ text: "(The chat failed to answer.)", unsure: false });
    console.error("OpenAI error", upstream.status, await upstream.text().catch(() => ""));
    return Response.json(
      { error: "Sorry, I couldn't answer that right now. Please try again." },
      { status: 502 },
    );
  }

  // Convert OpenAI's server-sent events into a plain text stream of the answer.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let answer = "";
  const stream = upstream.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const data = line.replace(/^data: /, "").trim();
          if (!data || data === "[DONE]" || !line.startsWith("data: ")) continue;
          try {
            const text = JSON.parse(data).choices?.[0]?.delta?.content;
            if (text) {
              answer += text;
              controller.enqueue(encoder.encode(text));
            }
          } catch {
            // Ignore keep-alives and partial frames.
          }
        }
      },
      flush() {
        const { text, unsure } = parseAnswer(answer);
        finished({ text, unsure });
      },
    }),
  );

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
