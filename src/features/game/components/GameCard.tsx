"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type CardVariant = "prompt" | "reply" | "back";

interface GameCardProps {
  variant: CardVariant;
  text?: string;
  isFlipped?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-32 h-44 text-xs",
  md: "w-40 h-56 text-sm",
  lg: "w-48 h-64 text-base",
};

const variantStyles = {
  prompt: {
    front: "bg-gradient-to-br from-blue-600 to-blue-800 text-white",
    back: "bg-gradient-to-br from-blue-900 to-blue-950",
  },
  reply: {
    front: "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900",
    back: "bg-gradient-to-br from-slate-800 to-slate-900",
  },
  back: {
    front: "bg-gradient-to-br from-slate-800 to-slate-900",
    back: "bg-gradient-to-br from-slate-800 to-slate-900",
  },
};

/**
 * Animated game card with flip effect
 * Used for both prompt and reply cards
 */
export function GameCard({
  variant,
  text,
  isFlipped = false,
  isSelected = false,
  isDisabled = false,
  onClick,
  className,
  size = "md",
}: GameCardProps) {
  const styles = variantStyles[variant];
  const canInteract = onClick && !isDisabled;

  return (
    <motion.div
      className={cn("relative perspective-1000", sizeClasses[size], className)}
      initial={false}
      whileHover={canInteract ? { scale: 1.05, y: -8 } : undefined}
      whileTap={canInteract ? { scale: 0.98 } : undefined}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front of card */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl shadow-lg p-4 flex flex-col",
            "backface-hidden border-2",
            styles.front,
            isSelected && "ring-4 ring-primary ring-offset-2",
            canInteract && "cursor-pointer",
            isDisabled && "opacity-50 cursor-not-allowed"
          )}
          style={{ backfaceVisibility: "hidden" }}
          onClick={canInteract ? onClick : undefined}
        >
          {/* Card header decoration */}
          <div className="flex justify-between items-start mb-2">
            <div className="w-6 h-6 rounded-full bg-white/20" />
            {variant === "prompt" && (
              <span className="text-[10px] uppercase tracking-wider opacity-70">
                Prompt
              </span>
            )}
          </div>

          {/* Card text */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-center font-medium leading-snug">
              {text || "???"}
            </p>
          </div>

          {/* Card footer decoration */}
          <div className="flex justify-end">
            <div className="w-4 h-4 rounded-full bg-white/10" />
          </div>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl shadow-lg",
            "backface-hidden border-2 border-slate-700",
            styles.back,
            "flex items-center justify-center"
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Card back pattern */}
          <div className="grid grid-cols-3 gap-1 opacity-30">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-sm bg-slate-600" />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
