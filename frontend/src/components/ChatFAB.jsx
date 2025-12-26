import { MessageCircle } from "lucide-react";

export default function ChatFAB({ onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label="Open Chat"
      className={`
        fixed bottom-6 right-6 z-50
        w-16 h-16 rounded-full
        bg-rose-500 hover:bg-rose-600
        shadow-xl
        flex items-center justify-center
        transition-all duration-200
        hover:scale-110
        focus:outline-none
        disabled:opacity-50 disabled:cursor-not-allowed
        animate-pulse
      `}
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </button>
  );
}
