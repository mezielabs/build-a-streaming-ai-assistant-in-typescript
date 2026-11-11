// The page. It's supplied: everything it needs comes from useWritingAssistant().
import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { textOf } from "../shared/chat.ts";
import { useWritingAssistant } from "./useWritingAssistant.ts";

export function App() {
  const { messages, input, setInput, error, busy, send, stop, reset } = useWritingAssistant();
  const conversationRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Keep the newest text in view as the reply arrives.
  useEffect(() => {
    conversationRef.current?.lastElementChild?.scrollIntoView({ block: "end" });
  }, [messages]);

  // Put the cursor back in the box whenever a reply finishes or fails.
  useEffect(() => {
    if (!busy) inputRef.current?.focus();
  }, [busy]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    send(text);
  }

  // Enter sends; Shift+Enter adds a new line.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  function handleNewConversation() {
    reset();
    inputRef.current?.focus();
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Writing assistant</h1>
        <button id="new-conversation" type="button" onClick={handleNewConversation} disabled={busy}>
          New conversation
        </button>
      </header>

      {/* React renders text, never HTML, so model output can't inject markup. */}
      <section id="conversation" className="conversation" aria-live="polite" ref={conversationRef}>
        {messages.length === 0 && (
          <p className="empty">Ask for a draft, then refine it with follow-ups like "make it shorter".</p>
        )}
        {messages.map((message, index) => {
          const inProgress = busy && index === messages.length - 1 && message.role === "assistant";
          return (
            <div key={message.id} className={`bubble ${message.role}${inProgress ? " pending" : ""}`}>
              {textOf(message)}
            </div>
          );
        })}
        {/* Sent, but the reply hasn't started yet. */}
        {busy && messages.at(-1)?.role === "user" && <div className="bubble assistant pending" />}
      </section>

      <p id="error" className="error" role="alert" hidden={!error}>
        {error}
      </p>

      <form id="composer" className="composer" onSubmit={handleSubmit}>
        <label htmlFor="message" className="visually-hidden">
          Message
        </label>
        <textarea
          id="message"
          ref={inputRef}
          rows={3}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a short email asking my landlord to fix the leaking kitchen tap"
        />
        {/* The keys make these two different buttons, so a click on Stop can't turn into a Send. */}
        {busy ? (
          <button key="stop" id="stop" type="button" onClick={() => void stop()}>
            Stop
          </button>
        ) : (
          <button key="send" id="send" type="submit">
            Send
          </button>
        )}
      </form>
      <p className="hint">Enter sends. Shift+Enter adds a new line.</p>
    </main>
  );
}
