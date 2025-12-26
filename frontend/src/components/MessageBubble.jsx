export default function MessageBubble({ role, content }) {
      if (role === "system") {
        return (
          <div className="text-center text-xs italic text-gray-400">{content}</div>
        );
      }
    
      const isUser = role === "user";
    
      return (
        <div
          className={`flex chat-message ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow
              ${
                isUser ? "bg-pink-500 text-white" : "bg-white border text-gray-800"
              }`}
          >
            {content}
          </div>
        </div>
      );
    }