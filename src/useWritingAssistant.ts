import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useRef, useState } from "react";
import { textOf, type ChatErrorBody } from "../shared/chat.ts";

// The SDK streams the reply and keeps the messages. Deciding what counts as history is still your job.
export function useWritingAssistant() {
  const [input, setInput] = useState("");
  const [problem, setProblem] = useState("");
  // The server's message for a failed reply. onError gets it; onFinish uses it.
  const serverProblem = useRef("");

  const { messages, sendMessage, setMessages, status, stop, clearError } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),

    // A failed request. The text comes from the server, which made it safe to show.
    // A rejected request (400) arrives as the JSON body, so take the error out of it.
    onError(error) {
      serverProblem.current = messageFrom(error);
    },

    // Runs once the reply has stopped, whether it finished or not.
    onFinish({ message, messages, isAbort, isDisconnect, isError, finishReason }) {
      if (isAbort) {
        rollBack(messages, "Stopped. Your message is back in the box.");
      } else if (isDisconnect) {
        rollBack(messages, "Couldn't reach the server. Check it's running and try again.");
      } else if (isError) {
        rollBack(messages, serverProblem.current || "Something went wrong. Try again.");
      } else if (finishReason === "length") {
        rollBack(messages, "The reply was cut off. Try asking for something shorter.");
      } else if (finishReason !== "stop") {
        rollBack(messages, "The reply didn't finish. Try again.");
      } else if (textOf(message).trim() === "") {
        rollBack(messages, "The reply came back empty. Try again.");
      }
      // Anything else finished normally, so it stays in the history.
    },
  });

  // Roll back: the failed turn never happened, and its text goes back in the box.
  function rollBack(messages: UIMessage[], reason: string) {
    const lastUser = messages.findLastIndex((message) => message.role === "user");
    if (lastUser !== -1) {
      setInput(textOf(messages[lastUser]));
      setMessages(messages.slice(0, lastUser));
    }
    setProblem(reason);
  }

  const busy = status === "submitted" || status === "streaming";

  function send(text: string) {
    serverProblem.current = "";
    setInput("");
    setProblem("");
    void sendMessage({ text });
  }

  function reset() {
    setMessages([]);
    clearError();
    setProblem("");
  }

  return { messages, input, setInput, error: problem, busy, send, stop, reset };
}

// The server sends { "error": "..." } when it rejects a request, and plain text when a stream fails.
function messageFrom(error: Error) {
  try {
    const body = JSON.parse(error.message) as Partial<ChatErrorBody>;
    if (typeof body.error === "string") return body.error;
  } catch {
    // Not JSON: the message is already plain text.
  }
  return error.message;
}
