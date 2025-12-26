import { motion, AnimatePresence } from "framer-motion";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

export default function ChatWindow({
  onClose,
  messages,
  isTyping,
  onSendMessage,
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed bottom-8 right-8 z-50"
      >
        <div className="w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col">
          <ChatHeader onClose={onClose} />
          <ChatMessages messages={messages} isTyping={isTyping} />
          <ChatInput onSendMessage={onSendMessage} disabled={isTyping} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
