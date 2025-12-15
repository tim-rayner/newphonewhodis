"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { motion } from "framer-motion";
import { Crown, Home, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";

interface FinishedPhaseProps {
  state: GameSnapshotSchema;
}

interface ConfettiParticle {
  id: number;
  initialX: string;
  duration: number;
  delay: number;
}

// Simple deterministic pseudo-random based on index
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// Pre-generated deterministic confetti particles
const CONFETTI_PARTICLES: ConfettiParticle[] = Array.from({ length: 20 }).map(
  (_, i) => ({
    id: i,
    initialX: seededRandom(i) * 100 + "%",
    duration: 2 + seededRandom(i + 100) * 2,
    delay: seededRandom(i + 200) * 2,
  })
);

/**
 * Game finished phase - show final scores and winner
 */
export function FinishedPhase({ state }: FinishedPhaseProps) {
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
      {/* Winner Celebration */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 p-8 text-white"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Confetti effect - simplified with CSS */}
        <div className="absolute inset-0 overflow-hidden">
          {CONFETTI_PARTICLES.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 rounded-full bg-white/40"
              initial={{
                x: particle.initialX,
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
            <Trophy className="w-16 h-16 mx-auto mb-4" />
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Final Standings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  index === 0
                    ? "bg-amber-100 dark:bg-amber-900/30"
                    : "bg-secondary/50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0
                      ? "bg-amber-500 text-white"
                      : index === 1
                      ? "bg-slate-400 text-white"
                      : index === 2
                      ? "bg-amber-700 text-white"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="flex-1 font-medium">{player.name}</span>
                <span className="font-bold text-lg">{player.score}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            Home
          </Button>
        </Link>
        <Button className="gap-2" disabled>
          <RotateCcw className="w-4 h-4" />
          Play Again (Coming Soon)
        </Button>
      </div>
    </motion.div>
  );
}
