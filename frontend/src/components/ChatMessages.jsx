import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatMessages({ messages, isTyping }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
      ))}

      {isTyping && (
        <div className="flex justify-start chat-message">
          <div
            className="
          bg-white border border-gray-200
          rounded-2xl px-4 py-2
          shadow-sm
          min-w-[120px]
          max-w-[75%]
        "
          >
            <div className="text-xs text-gray-500 mb-1">
              Spur Agent is Typing{" "}
              <div className="typing-dots flex gap-1">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
