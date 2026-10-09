import { getKnowledgeForChat } from "./knowledge";

/**
 * Drafts an answer for a question the chatbot couldn't answer, for the owner
 * to check in /admin/questions. Anything the knowledge base doesn't say is
 * left as a [bracketed] placeholder rather than guessed.
 */
export async function suggestAnswer(question: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return "";
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: [
              "You help the owner of Designjoy, a design subscription, fill gaps in the knowledge base their website chatbot answers from.",
              "A visitor asked a question the chatbot couldn't answer. Draft a short answer (1-3 sentences) in a friendly, plain, confident voice, written as Designjoy (\"we\").",
              "Use the knowledge base for anything it covers. For any fact it doesn't state (prices, policies, timelines, yes/no on whether something is offered), don't guess: write a [bracketed placeholder] for the owner to fill in, e.g. \"Yes, we [do / don't] offer [service].\"",
              "Reply with only the answer text.",
              "",
              "<knowledge_base>",
              (await getKnowledgeForChat()).replace(/<!--[\s\S]*?-->/g, "").trim(),
              "</knowledge_base>",
            ].join("\n"),
          },
          { role: "user", content: question },
        ],
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    return String(data.choices?.[0]?.message?.content ?? "").trim().slice(0, 1500);
  } catch (error) {
    console.error("Could not draft an answer", error);
    return "";
  }
}
