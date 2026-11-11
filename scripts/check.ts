// Pre-work check: run `npm run check` before the workshop.
// It makes one tiny request to prove your Node version, .env file and Groq key all work.
import { createGroq } from "@ai-sdk/groq";
import { APICallError, generateText } from "ai";

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 18)) {
  fail(`Node ${process.versions.node} is too old. Install Node 22.18 or newer (any Node 24 works).`);
}

if (!process.env.GROQ_API_KEY) {
  fail("GROQ_API_KEY is missing. Copy .env.example to .env in this folder and paste your key into it.");
}

const groq = createGroq({ baseURL: process.env.GROQ_BASE_URL || undefined });

try {
  await generateText({
    model: groq("openai/gpt-oss-20b"),
    prompt: "Reply with the word OK.",
    reasoning: "low",
    maxOutputTokens: 64,
    maxRetries: 0,
  });
} catch (error) {
  if (APICallError.isInstance(error) && error.statusCode === 401) {
    fail("Groq rejected your key (401). Check GROQ_API_KEY in .env has no spaces or quotes, or create a new key.");
  }
  if (APICallError.isInstance(error) && error.statusCode === 429) {
    fail("Groq says too many requests (429). Wait a minute and run the check again.");
  }
  fail(`The request to Groq failed: ${error instanceof Error ? error.message : String(error)}`);
}

console.log(`\n✓ Node ${process.versions.node} is fine.`);
console.log("✓ Groq key works.\n");
console.log("You're ready for the workshop. Run `npm run dev` and open http://localhost:3000\n");
