import React, { useState } from "react";
import { Send, Paperclip } from "lucide-react";

export default function ChatInput({ onSendMessage, disabled }) {
      const [input, setInput] = useState("");
    
      const send = () => {
        if (!input.trim()) return;
        onSendMessage(input);
        setInput("");
      };
    
      return (
        <div className="px-4 py-3 border-t flex items-center gap-2 bg-white rounded-b-2xl">
          <Paperclip className="w-5 h-5 text-gray-400" />
    
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="flex-1 rounded-full border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
            disabled={disabled}
          />
    
          <button
            onClick={send}
            disabled={disabled}
            className="p-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      );
    }