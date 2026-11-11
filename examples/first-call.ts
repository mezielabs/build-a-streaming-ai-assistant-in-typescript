// Block 2: your first model call.
// Run it with: npm run first-call
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

// The provider reads your key from GROQ_API_KEY in .env, never from code.
const groq = createGroq({ baseURL: process.env.GROQ_BASE_URL || undefined });

const result = await generateText({
  model: groq("openai/gpt-oss-20b"),
  instructions: "You are a writing assistant. Reply with the draft only, in plain text.",
  prompt: "Write a two-sentence welcome message for a developer workshop.",
  reasoning: "low",
  maxOutputTokens: 1024,
});

console.log("Text:", result.text);
console.log("Finish reason:", result.finishReason);
console.log("Tokens:", { input: result.usage.inputTokens, output: result.usage.outputTokens });
