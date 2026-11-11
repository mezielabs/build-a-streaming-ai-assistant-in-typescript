// The contract between the browser and the server. Both sides import from this file.
import type { UIMessage } from "ai";
import { z } from "zod";

export const MAX_MESSAGES = 20;
export const MAX_CHARS = 4000;

// useChat keeps each message as a list of parts. This app only uses text, so join the text parts.
export function textOf(message: Pick<UIMessage, "parts">): string {
  return message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
}

// TypeScript types disappear when the code runs, so they can't check what the browser sends.
// A zod schema checks the data at runtime. useChat sends every message with an id, a role and its parts.
const PartSchema = z.discriminatedUnion(
  "type",
  [
    z.object({ type: z.literal("text"), text: z.string() }),
    // The SDK marks where each model step starts. It carries no text.
    z.object({ type: z.literal("step-start") }),
  ],
  { error: "Messages can only contain text." },
);

export const ChatMessageSchema = z
  .object({
    id: z.string(),
    role: z.enum(["user", "assistant"], {
      error: "Messages can only come from the user or the assistant.",
    }),
    parts: z.array(PartSchema, { error: "Every message needs some text." }),
  })
  .refine((message) => textOf(message).trim() !== "", "Every message needs some text.")
  .refine((message) => textOf(message).length <= MAX_CHARS, `Keep each message under ${MAX_CHARS} characters.`);

export const ChatRequestSchema = z.object(
  {
    messages: z
      .array(ChatMessageSchema, { error: "Send at least one message." })
      .min(1, "Send at least one message.")
      .max(MAX_MESSAGES, "This conversation is too long. Start a new conversation.")
      .refine((messages) => messages.at(-1)?.role === "user", "The last message must come from the user."),
  },
  { error: "Send at least one message." },
);

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// Any request the server rejects before streaming: a message that's safe to show the user.
export type ChatErrorBody = { error: string };
