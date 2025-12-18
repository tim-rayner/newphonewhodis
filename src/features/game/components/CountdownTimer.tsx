"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo, useSyncExternalStore } from "react";

interface CountdownTimerProps {
  startTime: string | null;
  durationSeconds: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { dimension: 48, strokeWidth: 3, fontSize: "text-sm" },
  md: { dimension: 64, strokeWidth: 4, fontSize: "text-lg" },
  lg: { dimension: 80, strokeWidth: 5, fontSize: "text-2xl" },
};

function calculateTimeRemaining(
  startTime: string | null,
  durationSeconds: number
): number | null {
  if (!startTime) return null;
  const start = new Date(startTime).getTime();
  const elapsed = Date.now() - start;
  return Math.max(0, durationSeconds - Math.floor(elapsed / 1000));
}

/**
 * Visual countdown timer with animated progress ring
 */
export function CountdownTimer({
  startTime,
  durationSeconds,
  className,
  size = "md",
}: CountdownTimerProps) {
  const config = sizeConfig[size];
  const radius = (config.dimension - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Use useSyncExternalStore to track time without effect-based setState
  const subscribe = useMemo(() => {
    return (callback: () => void) => {
      if (!startTime) return () => {};
      const interval = setInterval(callback, 1000);
      return () => clearInterval(interval);
    };
  }, [startTime]);

  const getSnapshot = useMemo(() => {
    return () => calculateTimeRemaining(startTime, durationSeconds);
  }, [startTime, durationSeconds]);

  const timeRemaining = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot
  );

  if (timeRemaining === null) {
    return null;
  }

  const progress = timeRemaining / durationSeconds;
  const strokeDashoffset = circumference * (1 - progress);
  const isWarning = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      style={{ width: config.dimension, height: config.dimension }}
    >
      {/* Background circle */}
      <svg
        className="absolute inset-0 -rotate-90"
        width={config.dimension}
        height={config.dimension}
      >
        <circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-secondary"
        />
        <motion.circle
          cx={config.dimension / 2}
          cy={config.dimension / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            isCritical
              ? "text-red-500"
              : isWarning
              ? "text-orange-500"
              : "text-primary"
          )}
        />
      </svg>

      {/* Time text */}
      <motion.span
        className={cn(
          "font-mono font-bold",
          config.fontSize,
          isCritical
            ? "text-red-500"
            : isWarning
            ? "text-orange-500"
            : "text-foreground"
        )}
        animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
      >
        {timeRemaining}
      </motion.span>
    </div>
  );
}

