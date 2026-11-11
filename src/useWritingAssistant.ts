import type { UIMessage } from "ai";
import { useState } from "react";

// Block 3: you'll build this with the AI SDK's useChat, live with the facilitator.
export function useWritingAssistant() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const busy = false;

  function send(_text: string) {
    setError("Not built yet. You'll connect this page to the model in block 3.");
  }

  function stop() {}

  function reset() {
    setMessages([]);
    setError("");
  }

  return { messages, input, setInput, error, busy, send, stop, reset };
}
