# Build a Streaming AI Assistant in TypeScript

A Mezie Labs live workshop. No Python required: in two hours you'll build a writing assistant that streams its replies and remembers the conversation, in TypeScript, with React, Express and a free Groq API key.

Ask it for a draft, watch the draft arrive word by word, then refine it with follow-ups like "make it shorter" or "more formal".

You should be comfortable with React basics (components and `useState`) and with reading TypeScript. The page is already built, so you'll spend the two hours on the AI parts: the server route and the `useChat` hook.

## Before the workshop

Get all of this working **before the session starts**. There's no setup help during the two hours. It takes about 20 minutes.

1. **Install Node 22.18 or newer, and Git.** Check with `node -v` and `git --version`. Any Node 24 works.
2. **Clone this repo and install dependencies:**

   ```bash
   git clone https://github.com/mezielabs/build-a-streaming-ai-assistant-in-typescript.git
   cd build-a-streaming-ai-assistant-in-typescript
   npm ci
   ```

3. **Create a free Groq API key** at [console.groq.com/keys](https://console.groq.com/keys). No card is needed.
4. **Add your key.** Copy `.env.example` to a new file called `.env` in this folder, and paste your key after `GROQ_API_KEY=`. Never share this file or show it on screen.
5. **Run the check:**

   ```bash
   npm run check
   ```

   You should see:

   ```text
   ✓ Node 22.x.x is fine.
   ✓ Groq key works.
   ```

6. **Start the app** with `npm run dev`, then open [http://localhost:3000](http://localhost:3000). You should see the Writing assistant page. Sending a message shows "Not built yet"; that's what the workshop is for. If it says `.env: not found`, go back to step 4.
7. **Join the [Mezie Labs Discord](https://discord.gg/buTNVnYDAX)** and the workshop channel. Post setup questions there, with the error text and the command you ran.
8. **Test your Google Meet connection**, including screen sharing and chat.

## Agenda (2 hours)

| Start | Block |
| --- | --- |
| 0:00 | Open and demo |
| 0:08 | How LLMs work |
| 0:23 | First call from Node |
| 0:38 | Chat with memory |
| 1:03 | Break |
| 1:08 | Streaming |
| 1:45 | Break it, watch it grow |
| 1:52 | Close |

## During the workshop: the help protocol

1. At each checkpoint, post `DONE` or `HELP: <one-line error>` in Google Meet chat.
2. Paste error text, not screenshots.
3. Stuck for three minutes? Rejoin from the checkpoint branch and keep building. Bring the problem to the break, or to the workshop channel on Discord afterwards.

### Rejoin from a checkpoint

Stop the app with Ctrl+C first, then:

```bash
git stash -u && git switch <branch> && npm ci
```

Your own work is saved in the stash, and your `.env` file stays where it is. Start the app again with `npm run dev`.

| Branch | What it holds | Use it when |
| --- | --- | --- |
| `main` | The starter: the page loads, nothing calls Groq yet | Before the workshop |
| `checkpoint/first-call` | `examples/first-call.ts` makes a real request | Behind at 0:38 |
| `checkpoint/chat` | Chat with memory, without streaming | Behind at 1:01, or in the break |
| `checkpoint/streaming` | Streaming replies, saved only when `done` arrives | Behind at 1:43 |
| `reference` | The finished app | After the workshop |

## Commands

| Command | What it does |
| --- | --- |
| `npm run check` | Checks Node, your `.env` file and your Groq key |
| `npm run dev` | Runs the app at http://localhost:3000. The server restarts when you save `server.ts`, and the page updates when you save files in `src/` |
| `npm run first-call` | Runs `examples/first-call.ts` (block 2) |
| `npm run typecheck` | Checks the types. Node and Vite run TypeScript without checking it |

## Project layout

```text
server.ts               Express server: the /api routes, plus Vite serving the React app
shared/chat.ts          The contract between browser and server: zod schema and types (provided)
examples/first-call.ts  Your first model call (block 2)
src/useChat.ts          The chat logic: history, sending, streaming (blocks 3 and 4)
src/App.tsx             The page (provided)
src/ndjson.ts           Reads a streamed response one record at a time (provided)
src/main.tsx            Mounts the React app (provided)
src/styles.css          Styles
scripts/check.ts        The pre-work check
```

Node 22.18 and newer run `.ts` files directly by removing the types, so there's no build step. That only works for syntax that can simply be erased, so this project doesn't use enums or namespaces, and imports include the `.ts` extension. `tsconfig.json` enforces both.

## Safety

- Your API key lives only in `.env`, which Git ignores. It's read by the server and never reaches browser code.
- If your key ever appears on screen or in a chat, delete it at [console.groq.com/keys](https://console.groq.com/keys) and create a new one.
