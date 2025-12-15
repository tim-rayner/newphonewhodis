"use client";

import { getReplyDisplayText } from "@/features/game/assets/cards";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { GameCard } from "./GameCard";

interface WinnerRevealProps {
  winnerName: string;
  winningCardId: string;
  onComplete?: () => void;
  autoHideAfter?: number; // milliseconds
}

interface ConfettiParticle {
  id: number;
  colorClass: string;
  initialX: string;
  initialScale: number;
  animateX: string;
  rotateDirection: number;
  duration: number;
  delay: number;
}

const CONFETTI_COLORS = [
  "bg-yellow-400",
  "bg-pink-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-purple-400",
];

// Pre-generated deterministic confetti particles based on index
// This avoids calling Math.random during render
function seededRandom(seed: number): number {
  // Simple deterministic pseudo-random based on index
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const CONFETTI_PARTICLES: ConfettiParticle[] = Array.from({ length: 50 }).map(
  (_, i) => ({
    id: i,
    colorClass: CONFETTI_COLORS[i % 5],
    initialX: `${50 + (seededRandom(i) - 0.5) * 20}%`,
    initialScale: 0.5 + seededRandom(i + 100) * 0.5,
    animateX: `${50 + (seededRandom(i + 200) - 0.5) * 80}%`,
    rotateDirection: seededRandom(i + 300) > 0.5 ? 1 : -1,
    duration: 2 + seededRandom(i + 400) * 2,
    delay: seededRandom(i + 500) * 0.5,
  })
);

/**
 * Celebration overlay when a round winner is announced
 */
export function WinnerReveal({
  winnerName,
  winningCardId,
  onComplete,
  autoHideAfter = 4000,
}: WinnerRevealProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, autoHideAfter);

    return () => clearTimeout(timer);
  }, [autoHideAfter, onComplete]);

  const handleDismiss = () => {
    setIsVisible(false);
    onComplete?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleDismiss}
        >
          {/* Confetti particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {CONFETTI_PARTICLES.map((particle) => (
              <motion.div
                key={particle.id}
                className={cn(
                  "absolute w-3 h-3 rounded-sm",
                  particle.colorClass
                )}
                initial={{
                  x: particle.initialX,
                  y: "-10%",
                  rotate: 0,
                  scale: particle.initialScale,
                }}
                animate={{
                  y: "110%",
                  rotate: 360 * particle.rotateDirection,
                  x: particle.animateX,
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: "easeIn",
                }}
              />
            ))}
          </div>

          {/* Winner content */}
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative flex flex-col items-center gap-6 p-8"
          >
            {/* Trophy icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>

            {/* Winner text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <p className="text-white/80 text-lg mb-1">Round Winner</p>
              <h2 className="text-4xl font-bold text-white">{winnerName}</h2>
            </motion.div>

            {/* Winning card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GameCard
                variant="reply"
                text={getReplyDisplayText(winningCardId)}
                size="lg"
                isSelected
              />
            </motion.div>

            {/* Tap to dismiss */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1 }}
              className="text-white/60 text-sm"
            >
              Tap to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
