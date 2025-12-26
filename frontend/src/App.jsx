import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import ChatFAB from "./components/ChatFAB";
import ChatWindow from "./components/ChatWindow";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Unified message shape for UI
 * role: "user" | "bot" | "system"
 */
const INITIAL_MESSAGES = [
  {
    id: crypto.randomUUID(),
    role: "bot",
    content: "Hi 👋 How can I help you today?",
  },
];

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    async function restoreChatSession() {
      const sessionId = localStorage.getItem("sessionId");

      // No session → show greeting
      if (!sessionId) {
        setMessages(INITIAL_MESSAGES);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/chat/session/${sessionId}`);

        if (!res.ok) {
          throw new Error("Session not found");
        }

        const data = await res.json();

        // Map backend roles → frontend roles
        const hydratedMessages = data.messages.map((msg) => ({
          id: crypto.randomUUID(),
          role: msg.role === "assistant" ? "bot" : "user",
          content: msg.content,
        }));

        // If session exists but empty, still greet
        setMessages(
          hydratedMessages.length > 0 ? hydratedMessages : INITIAL_MESSAGES
        );
      } catch (err) {
        // Invalid session → reset safely
        localStorage.removeItem("sessionId");
        setMessages(INITIAL_MESSAGES);
      }
    }

    restoreChatSession();
  }, []);

  /**
   * Send message → Backend → Gemini → UI
   */
  const handleSendMessage = async (text) => {
    if (!text.trim() || isTyping) return;

    // 1️⃣ Add user message immediately
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // 2️⃣ Prepare payload exactly as backend expects
    const storedSessionId = localStorage.getItem("sessionId");

    const payload = {
      message: text,
      ...(storedSessionId ? { sessionId: storedSessionId } : {}),
    };

    try {
      const res = await fetch(`${API_BASE}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.reply || "Server error");
      }

      // 3️⃣ Persist session
      if (data.sessionId) {
        localStorage.setItem("sessionId", data.sessionId);
      }

      // 4️⃣ Add bot reply
      const botMessage = {
        id: crypto.randomUUID(),
        role: "bot",
        content: data.reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // 5️⃣ System error message
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          content:
            "⚠️ Our support system is temporarily unavailable. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Landing Background */}
      <div
        className={`transition-all duration-300 ${
          isChatOpen ? "blur-sm brightness-90" : ""
        }`}
      >
        <LandingPage />
      </div>

      {/* Floating Chat Button */}
      <ChatFAB onClick={() => setIsChatOpen(true)} disabled={isChatOpen} />

      {/* Chat Window */}
      {isChatOpen && (
        <ChatWindow
          onClose={() => setIsChatOpen(false)}
          messages={messages}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}

export default App;
