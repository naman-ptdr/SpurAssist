import ReactMarkdown from "react-markdown";

export default function MessageBubble({ role, content }) {
  if (role === "system") {
    return (
      <div className="text-center text-xs italic text-gray-400">
        {content}
      </div>
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
            isUser
              ? "bg-pink-500 text-white"
              : "bg-white border text-gray-800"
          }`}
      >
        <ReactMarkdown
          components={{
            a: ({ node, ...props }) => (
              <a
                {...props}
                className="text-blue-600 underline"
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc ml-4" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal ml-4" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="mb-1 last:mb-0" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
