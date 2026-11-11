import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState } from "react";

// The SDK sends the conversation, streams the reply into messages, and tracks the status.
export function useWritingAssistant() {
  const [input, setInput] = useState("");

  const { messages, sendMessage, setMessages, status, error, stop, clearError } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const busy = status === "submitted" || status === "streaming";

  function send(text: string) {
    setInput("");
    void sendMessage({ text });
  }

  function reset() {
    setMessages([]);
    clearError();
  }

  return {
    messages,
    input,
    setInput,
    error: error ? "Something went wrong. Try again." : "",
    busy,
    send,
    stop,
    reset,
  };
}
