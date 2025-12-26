import React from "react";
import { X } from "lucide-react";

// You may want to pass onClose as prop
export default function ChatHeader({ onClose }) {
        return (
          <div
            className="
              relative flex items-center justify-between
              px-4 py-3
              bg-linear-to-r from-pink-600 via-rose-500 to-red-500
              text-white
              rounded-t-2xl
              shadow-md
              z-10
            "
          >
            {/* Left: Avatar + Store Info */}
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-pink-600 font-bold">
                  S
                </div>
      
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              </div>
      
              {/* Store text */}
              <div className="leading-tight">
                <p className="text-xs uppercase tracking-widest opacity-90">
                  Spur Store
                </p>
                <p className="text-sm font-medium opacity-95">
                  Customer Support
                </p>
              </div>
            </div>
      
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close chat"
              className="p-2 rounded-full hover:bg-white/20 transition"
            >
              <X className="w-5 h-5 font-bold text-white hover:text-gray-200 transition " />
            </button>
          </div>
        );
      }