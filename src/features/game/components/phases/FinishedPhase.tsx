"use client";

import { Button } from "@/components/ui/button";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Crown, Home, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";

interface FinishedPhaseProps {
  state: GameSnapshotSchema;
  isHost: boolean;
  isPending: boolean;
  onPlayAgain: () => void;
}

interface ConfettiParticle {
  id: number;
  initialX: string;
  duration: number;
  delay: number;
  color: string;
}

// Simple deterministic pseudo-random based on index
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const CONFETTI_COLORS = [
  "bg-yellow-400",
  "bg-pink-400",
  "bg-blue-400",
  "bg-green-400",
  "bg-purple-400",
];

// Pre-generated deterministic confetti particles
const CONFETTI_PARTICLES: ConfettiParticle[] = Array.from({ length: 30 }).map(
  (_, i) => ({
    id: i,
    initialX: seededRandom(i) * 100 + "%",
    duration: 2 + seededRandom(i + 100) * 2,
    delay: seededRandom(i + 200) * 2,
    color: CONFETTI_COLORS[i % 5],
  })
);

/**
 * Game finished phase - show final scores and winner
 * Mobile-first design with celebration effects
 */
export function FinishedPhase({
  state,
  isHost,
  isPending,
  onPlayAgain,
}: FinishedPhaseProps) {
  // Sort players by score
  const sortedPlayers = Object.entries(state.players)
    .map(([id, player]) => ({ id, ...player }))
    .sort((a, b) => b.score - a.score);

  const winner = sortedPlayers[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Winner Celebration Card */}
      <motion.div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 p-8 text-white"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Confetti effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {CONFETTI_PARTICLES.map((particle) => (
            <motion.div
              key={particle.id}
              className={cn("absolute w-3 h-3 rounded-sm", particle.color)}
              style={{ left: particle.initialX }}
              initial={{
                y: -20,
                rotate: 0,
              }}
              animate={{
                y: "120%",
                rotate: 360,
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
                ease: "linear",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <Trophy className="w-20 h-20 mx-auto mb-4" />
          </motion.div>
          <motion.h1
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Game Over!
          </motion.h1>
          <motion.p
            className="text-xl opacity-90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {winner.name} wins with {winner.score} points!
          </motion.p>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card rounded-2xl border p-6"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <Crown className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold">Final Standings</h2>
        </div>

        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl",
                index === 0
                  ? "bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10"
                  : "bg-secondary/50"
              )}
            >
              {/* Rank badge */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                  index === 0
                    ? "bg-amber-500 text-white"
                    : index === 1
                    ? "bg-slate-400 text-white"
                    : index === 2
                    ? "bg-amber-700 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-muted-foreground"
                )}
              >
                {index + 1}
              </div>

              {/* Player name */}
              <span className="flex-1 font-medium text-lg">{player.name}</span>

              {/* Score */}
              <span className="font-bold text-xl">{player.score}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex flex-col sm:flex-row justify-center gap-3"
      >
        <Link href="/" className="flex-1 sm:flex-initial">
          <Button
            variant="outline"
            size="lg"
            className="w-full gap-2 min-h-[52px]"
          >
            <Home className="w-5 h-5" />
            Home
          </Button>
        </Link>
        <Button
          size="lg"
          className="flex-1 sm:flex-initial gap-2 min-h-[52px]"
          disabled={!isHost || isPending}
          onClick={onPlayAgain}
        >
          <RotateCcw className={cn("w-5 h-5", isPending && "animate-spin")} />
          {isHost ? "Play Again" : "Waiting for Host..."}
        </Button>
      </motion.div>
    </motion.div>
  );
}
