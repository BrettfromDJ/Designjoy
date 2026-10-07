import { createHash } from "node:crypto";
import { getKnowledgeForChat } from "./knowledge";

// Short enough to fit the chat pill on a phone; the browser also measures
// each one and skips any that would still overflow.
export const MAX_QUESTION_LENGTH = 34;

// Shown when ChatGPT isn't connected or generation fails.
const FALLBACK = [
  "How does the subscription work?",
  "How fast is delivery?",
  "Can I pause my plan?",
  "What's included in Monthly Club?",
  "How do I book an intro call?",
];

const clean = (questions: unknown): string[] =>
  Array.isArray(questions)
    ? [
        ...new Set(
          questions
            .filter((q): q is string => typeof q === "string")
            .map((q) => q.trim().replace(/\s+/g, " "))
            .filter((q) => q.endsWith("?") && q.length >= 8 && q.length <= MAX_QUESTION_LENGTH),
        ),
      ]
    : [];

// Regenerated only when the knowledge base text changes.
let cached: { hash: string; questions: string[] } | null = null;

export async function getSampleQuestions(): Promise<string[]> {
  const knowledge = (await getKnowledgeForChat()).replace(/<!--[\s\S]*?-->/g, "").trim();
  const hash = createHash("sha256").update(knowledge).digest("hex");
  if (cached?.hash === hash) return cached.questions;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return FALLBACK;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: [
              "Write 10 example questions a prospective client of Designjoy might type into the website's chat box.",
              "Each must be clearly answered by the knowledge base below, and cover a different topic.",
              `Keep each question under ${MAX_QUESTION_LENGTH} characters, casual and specific, ending with "?".`,
              'Reply with JSON only: {"questions": ["...", "..."]}',
              "",
              "<knowledge_base>",
              knowledge,
              "</knowledge_base>",
            ].join("\n"),
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}`);
    const data = await res.json();
    const questions = clean(JSON.parse(data.choices?.[0]?.message?.content ?? "{}").questions);
    if (questions.length < 3) throw new Error("Too few usable questions");
    cached = { hash, questions };
    return questions;
  } catch (error) {
    console.error("Could not generate sample questions", error);
    return FALLBACK;
  }
}
