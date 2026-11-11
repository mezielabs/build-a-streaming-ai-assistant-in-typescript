import { createServer } from "node:http";
import express from "express";
import { createGroq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText } from "ai";
import { createServer as createViteServer } from "vite";
import { ChatRequestSchema } from "./shared/chat.ts";

// The provider reads GROQ_API_KEY from .env. Switching to another provider means
// changing these two lines and installing its package; nothing else in the app changes.
const groq = createGroq({ baseURL: process.env.GROQ_BASE_URL || undefined });
const model = groq("openai/gpt-oss-20b");

// The server owns the instructions. The browser never sends them.
const INSTRUCTIONS =
  "You are a writing assistant. Write clear, natural drafts in plain text. " +
  "When the user asks for a change, revise your most recent draft and reply " +
  "with the full revised draft only, with no preamble.";

const app = express();

app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

function errorText(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

app.post("/api/chat", async (req, res) => {
  // req.body is whatever the browser sent. Check it before trusting it.
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }
  const { messages } = parsed.data;

  const result = streamText({
    model,
    instructions: INSTRUCTIONS,
    // The whole conversation goes to the model on every request. That's the app's memory.
    messages: await convertToModelMessages(messages),
    reasoning: "low",
    maxOutputTokens: 1024,
    // Fail fast: retrying a 429 leaves the page waiting with no feedback. The user can retry.
    maxRetries: 0,
  });

  // Stream the reply to useChat in the browser. Reasoning stays on the server.
  try {
    await result.pipeUIMessageStreamToResponse(res, { sendReasoning: false });
  } catch (error) {
    // The connection to Groq broke mid-reply. End the response so the browser isn't left waiting.
    console.error("[chat] stream failed:", errorText(error));
    res.end();
  }
});

// Vite serves the React app and turns its TypeScript into JavaScript the browser can run.
const server = createServer(app);
const vite = await createViteServer({
  server: { middlewareMode: true, hmr: { server } },
  appType: "spa",
  configLoader: "native", // Node loads vite.config.ts itself, the same way it runs this file.
});
app.use(vite.middlewares);

const port = Number(process.env.PORT ?? 3000);

server.listen(port, () => {
  console.log(`Writing assistant running at http://localhost:${port}`);
});
