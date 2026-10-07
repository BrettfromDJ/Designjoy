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
    "",
    "<knowledge_base>",
    knowledge.replace(/<!--[\s\S]*?-->/g, "").trim(),
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
  if (!apiKey) {
    return Response.json(
      { error: "Chat isn't connected yet — please book an intro call with any questions." },
      { status: 503 },
    );
  }

  const messages = parseMessages(await request.json().catch(() => null));
  if (!messages) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
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
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            // Ignore keep-alives and partial frames.
          }
        }
      },
    }),
  );

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
