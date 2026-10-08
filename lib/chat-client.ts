// Browser side of /api/chat: sends the conversation and streams back the answer.

export type ChatMessage = { role: "user" | "assistant"; content: string };

export class ChatError extends Error {
  constructor(
    message: string,
    /** True when the reply should offer the intro call button. */
    readonly bookCall = false,
  ) {
    super(message);
  }
}

/** Streams the answer to `messages`, calling `onText` with the full text so far. */
export async function streamChat(messages: ChatMessage[], onText: (text: string) => void) {
  let res: Response;
  try {
    res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });
  } catch {
    throw new ChatError("Couldn't reach the chat. Check your connection and try again.");
  }
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => null);
    throw new ChatError(
      data?.error ?? "Something went wrong. Please try again.",
      Boolean(data?.bookCall),
    );
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let answer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    answer += decoder.decode(value, { stream: true });
    onText(answer);
  }
  return answer;
}
