"use client";

import { WILDCARD_MAX_LENGTH } from "@/features/game/utils/wildcards";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Send, X } from "lucide-react";
import { useCallback, useState } from "react";

interface WildcardInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  isPending?: boolean;
}

/**
 * Modal overlay for entering wildcard card text
 * Appears when a player selects a wildcard to submit
 */
export function WildcardInput({
  isOpen,
  onClose,
  onSubmit,
  isPending = false,
}: WildcardInputProps) {
  const [text, setText] = useState("");
  const charCount = text.length;
  const isValid = text.trim().length > 0 && charCount <= WILDCARD_MAX_LENGTH;
  const isOverLimit = charCount > WILDCARD_MAX_LENGTH;

  const handleSubmit = useCallback(() => {
    if (isValid && !isPending) {
      onSubmit(text.trim());
      setText("");
    }
  }, [isValid, isPending, onSubmit, text]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal content */}
          <motion.div
            className="relative w-full max-w-md mx-4 mb-4 bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-2xl"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Pencil className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    Wildcard!
                  </h3>
                  <p className="text-[11px] text-[#8e8e93]">
                    Write your own reply
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input area */}
            <div className="p-4">
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your reply..."
                  autoFocus
                  rows={3}
                  maxLength={WILDCARD_MAX_LENGTH + 10} // Allow slight over-typing to show error
                  className={cn(
                    "w-full px-4 py-3 bg-[#2c2c2e] rounded-xl",
                    "text-white placeholder:text-[#8e8e93] text-[15px]",
                    "border-2 transition-colors resize-none",
                    "focus:outline-none",
                    isOverLimit
                      ? "border-red-500 focus:border-red-500"
                      : "border-transparent focus:border-[#0a84ff]"
                  )}
                />

                {/* Character count */}
                <div
                  className={cn(
                    "absolute bottom-2 right-3 text-[11px]",
                    isOverLimit ? "text-red-500" : "text-[#8e8e93]"
                  )}
                >
                  {charCount}/{WILDCARD_MAX_LENGTH}
                </div>
              </div>

              {/* Helper text */}
              <p className="mt-2 text-[11px] text-[#8e8e93] text-center">
                Make it funny, make it weird, make it yours!
              </p>
            </div>

            {/* Submit button */}
            <div className="px-4 pb-4">
              <button
                onClick={handleSubmit}
                disabled={!isValid || isPending}
                className={cn(
                  "w-full py-3 rounded-xl font-semibold text-white",
                  "flex items-center justify-center gap-2",
                  "transition-all",
                  isValid && !isPending
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 active:scale-[0.98]"
                    : "bg-[#2c2c2e] text-[#8e8e93] cursor-not-allowed"
                )}
              >
                {isPending ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Wildcard card preview component
 * Shows a distinctive wildcard card in the hand
 */
interface WildcardCardProps {
  isSelected?: boolean;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: "md" | "lg";
}

export function WildcardCard({
  isSelected = false,
  isActive = true,
  onClick,
  disabled = false,
  size = "md",
}: WildcardCardProps) {
  return (
    <motion.div
      className={cn(
        "relative rounded-2xl cursor-pointer select-none",
        // Size variations
        size === "md" ? "w-48 h-52" : "w-56 h-60",
        // Wildcard gradient background
        "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
        "border-2 shadow-xl",
        // Selected state
        isSelected
          ? "border-green-500 ring-4 ring-green-500/30"
          : "border-white/20",
        // Interactive states
        !disabled && isActive && "active:scale-[0.98]",
        disabled && "opacity-60 cursor-not-allowed"
      )}
      onClick={!disabled ? onClick : undefined}
      whileTap={!disabled && isActive ? { scale: 0.98 } : undefined}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "20px 20px"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Card content */}
      <div className="relative flex flex-col h-full p-4">
        {/* Header */}
        <div className="flex items-center gap-1.5">
          <motion.div
            className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Pencil className="w-3.5 h-3.5 text-white" />
          </motion.div>
          <span className="text-[10px] text-white/80 uppercase tracking-wider font-bold">
            Wildcard
          </span>
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <motion.div
            className="text-4xl"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ✨
          </motion.div>
          <p className="text-white font-bold text-center text-sm">
            Write Your Own!
          </p>
          <p className="text-white/70 text-xs text-center">
            Tap to enter your reply
          </p>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

