"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Share2 } from "lucide-react";
import { useCallback, useState } from "react";

interface GameCodeBadgeProps {
  gameCode: string;
  className?: string;
  variant?: "default" | "large" | "compact";
}

/**
 * Game code display with tap-to-copy and share functionality
 * Designed for mobile-first sharing experience
 */
export function GameCodeBadge({
  gameCode,
  className,
  variant = "default",
}: GameCodeBadgeProps) {
  const [copied, setCopied] = useState(false);
  const [showShareError, setShowShareError] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [gameCode]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: "New Phone Who Dis?",
      text: `Join my game! Code: ${gameCode}`,
      url: `${window.location.origin}/join-game?code=${gameCode}`,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy
        await handleCopy();
      }
    } catch (err) {
      // User cancelled share or share failed
      if ((err as Error).name !== "AbortError") {
        setShowShareError(true);
        setTimeout(() => setShowShareError(false), 2000);
      }
    }
  }, [gameCode, handleCopy]);

  if (variant === "compact") {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1",
          "bg-secondary/80 rounded-md text-xs font-mono",
          "active:scale-95 transition-transform",
          className
        )}
      >
        <span className="text-muted-foreground">Code:</span>
        <span className="font-bold">{gameCode}</span>
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check className="w-3 h-3 text-green-500" />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Copy className="w-3 h-3 text-muted-foreground" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    );
  }

  if (variant === "large") {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-4 p-6",
          "bg-gradient-to-br from-primary/10 to-primary/5",
          "rounded-2xl border border-primary/20",
          className
        )}
      >
        <p className="text-sm text-muted-foreground font-medium">
          Share this code with friends
        </p>

        {/* Large game code */}
        <motion.div
          className="relative"
          whileTap={{ scale: 0.98 }}
          onClick={handleCopy}
        >
          <div
            className={cn(
              "px-8 py-4 rounded-xl",
              "bg-background border-2 border-dashed border-primary/30",
              "cursor-pointer select-all"
            )}
          >
            <span className="text-4xl font-mono font-bold tracking-widest text-primary">
              {gameCode}
            </span>
          </div>

          {/* Copy feedback */}
          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2"
              >
                <span className="flex items-center gap-1 text-sm text-green-600 font-medium">
                  <Check className="w-4 h-4" />
                  Copied!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5",
              "bg-secondary rounded-lg text-sm font-medium",
              "active:scale-95 transition-transform"
            )}
          >
            <Copy className="w-4 h-4" />
            Copy Code
          </button>

          <button
            onClick={handleShare}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5",
              "bg-primary text-primary-foreground rounded-lg text-sm font-medium",
              "active:scale-95 transition-transform"
            )}
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {showShareError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs text-red-500"
            >
              Couldn&apos;t share. Try copying instead.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2",
        "bg-secondary/50 rounded-lg",
        className
      )}
    >
      <span className="text-xs text-muted-foreground">Game Code:</span>
      <span className="font-mono font-bold text-sm">{gameCode}</span>

      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={handleCopy}
          className={cn(
            "p-1.5 rounded-md",
            "hover:bg-secondary active:scale-95 transition-all",
            copied && "text-green-500"
          )}
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>

        {/* <button
          onClick={handleShare}
          className={cn(
            "p-1.5 rounded-md",
            "hover:bg-secondary active:scale-95 transition-all"
          )}
          title="Share game"
        >
          <Share2 className="w-4 h-4" />
        </button> */}
      </div>
    </div>
  );
}
