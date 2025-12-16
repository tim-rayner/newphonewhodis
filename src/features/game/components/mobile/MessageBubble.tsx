"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, CheckCheck, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type MessageType = "prompt" | "reply";

interface MessageBubbleProps {
  type: MessageType;
  text: string;
  gifUrl?: string | null;
  isGifLoading?: boolean;
  timestamp?: string;
  isDelivered?: boolean;
  isRead?: boolean;
  isWinner?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  delay?: number;
}

/**
 * iMessage/WhatsApp style message bubble
 * - Prompts: Gray bubble, left-aligned (incoming)
 * - Replies: Green/Blue bubble, right-aligned (outgoing)
 * - Supports optional GIF images above text
 */
export function MessageBubble({
  type,
  text,
  gifUrl,
  isGifLoading = false,
  timestamp,
  isDelivered = true,
  isRead = false,
  isWinner = false,
  isSelected = false,
  onClick,
  className,
  delay = 0,
}: MessageBubbleProps) {
  const isPrompt = type === "prompt";
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hasGif = gifUrl || isGifLoading;

  // Format current time if no timestamp provided
  const displayTime =
    timestamp ||
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <motion.div
      className={cn(
        "flex flex-col max-w-[85%]",
        isPrompt ? "self-start items-start" : "self-end items-end",
        className
      )}
      initial={{ opacity: 0, x: isPrompt ? -20 : 20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.3,
        delay,
        ease: "easeOut",
      }}
    >
      {/* Message bubble */}
      <motion.div
        className={cn(
          "relative rounded-2xl overflow-hidden",
          // Add padding only when there's no GIF
          !hasGif && "px-4 py-2.5",
          // Prompt (incoming) styles
          isPrompt && "bg-[#3a3a3c] text-white rounded-bl-md",
          // Reply (outgoing) styles - iMessage green
          !isPrompt && "bg-[#34c759] text-white rounded-br-md",
          // Winner highlight
          isWinner && "ring-2 ring-amber-400 ring-offset-2 ring-offset-black",
          // Selected state
          isSelected && "ring-2 ring-[#0a84ff] ring-offset-2 ring-offset-black",
          // Interactive state
          onClick && "cursor-pointer active:scale-[0.98] transition-transform"
        )}
        onClick={onClick}
        whileTap={onClick ? { scale: 0.98 } : undefined}
      >
        {/* GIF Image */}
        {hasGif && (
          <div className="relative w-full min-w-[200px] aspect-video bg-black/20">
            {isGifLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white/50" />
              </div>
            ) : gifUrl ? (
              <>
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-white/50" />
                  </div>
                )}
                {imageError && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs">
                    GIF failed
                  </div>
                )}
                <Image
                  src={gifUrl}
                  alt="GIF"
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-200",
                    imageLoaded && !imageError ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    console.error(
                      "[MessageBubble] Image failed to load:",
                      gifUrl
                    );
                    setImageError(true);
                  }}
                  unoptimized // GIFs need to be unoptimized to animate
                />
              </>
            ) : null}
          </div>
        )}

        {/* Message text */}
        {text && (
          <p
            className={cn(
              "text-[15px] leading-snug whitespace-pre-wrap break-words",
              hasGif ? "px-4 pt-2 pb-2.5" : ""
            )}
          >
            {text}
          </p>
        )}

        {/* Bubble tail */}
        <div
          className={cn(
            "absolute bottom-0 w-3 h-3",
            isPrompt
              ? "left-0 -translate-x-1/2 bg-[#3a3a3c]"
              : "right-0 translate-x-1/2 bg-[#34c759]"
          )}
          style={{
            clipPath: isPrompt
              ? "polygon(100% 0, 100% 100%, 0 100%)"
              : "polygon(0 0, 100% 100%, 0 100%)",
          }}
        />
      </motion.div>

      {/* Timestamp and read receipts */}
      <div className="flex items-center gap-1 mt-1 px-1">
        <span className="text-[10px] text-[#8e8e93]">{displayTime}</span>
        {!isPrompt && isDelivered && (
          <span className="text-[#8e8e93]">
            {isRead ? (
              <CheckCheck className="w-3 h-3 text-[#0a84ff]" />
            ) : (
              <Check className="w-3 h-3" />
            )}
          </span>
        )}
      </div>

      {/* Winner badge */}
      {isWinner && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="mt-1 px-2 py-0.5 bg-amber-500 rounded-full"
        >
          <span className="text-[10px] font-bold text-white uppercase tracking-wide">
            Winner!
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Typing indicator component for the winner reveal sequence
 */
export function TypingIndicator({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        "flex items-center gap-1 self-end px-4 py-3 bg-[#34c759] rounded-2xl rounded-br-md max-w-[80px]",
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-white/70 rounded-full"
          animate={{
            y: [0, -4, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </motion.div>
  );
}
