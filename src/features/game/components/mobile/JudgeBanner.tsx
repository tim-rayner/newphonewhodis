"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Gavel } from "lucide-react";

interface JudgeBannerProps {
  judgeName: string | null;
  isCurrentUserJudge: boolean;
  className?: string;
}

/**
 * Persistent banner showing the current round's judge
 * Different styling when current user is the judge
 */
export function JudgeBanner({
  judgeName,
  isCurrentUserJudge,
  className,
}: JudgeBannerProps) {
  if (!judgeName) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={judgeName}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "w-full py-2 px-4",
          isCurrentUserJudge
            ? "bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500"
            : "bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700",
          className
        )}
      >
        <div className="flex items-center justify-center gap-2">
          {/* Icon */}
          <motion.div
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
          >
            {isCurrentUserJudge ? (
              <Crown className="w-5 h-5 text-white" />
            ) : (
              <Gavel className="w-4 h-4 text-amber-400" />
            )}
          </motion.div>

          {/* Text */}
          <span
            className={cn(
              "text-sm font-medium",
              isCurrentUserJudge ? "text-white" : "text-slate-200"
            )}
          >
            {isCurrentUserJudge ? (
              <>
                <span className="font-bold">You</span> are judging this round!
              </>
            ) : (
              <>
                <span className="font-bold text-amber-400">{judgeName}</span> is
                judging
              </>
            )}
          </span>

          {/* Animated crown for current judge */}
          {isCurrentUserJudge && (
            <motion.div
              animate={{
                y: [0, -2, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Crown className="w-4 h-4 text-white/80" />
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Compact judge indicator for use in headers/cards
 */
export function JudgeIndicator({
  judgeName,
  isCurrentUserJudge,
  className,
}: JudgeBannerProps) {
  if (!judgeName) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
        isCurrentUserJudge
          ? "bg-amber-500 text-white"
          : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200",
        className
      )}
    >
      <Crown className="w-3 h-3" />
      <span>{isCurrentUserJudge ? "You're judging" : judgeName}</span>
    </div>
  );
}
