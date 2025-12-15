"use client";

import { Button } from "@/components/ui/button";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Crown, Shuffle, Users } from "lucide-react";
import { GameCodeBadge } from "../mobile/GameCodeBadge";
import { JudgeBanner } from "../mobile/JudgeBanner";

interface LobbyPhaseProps {
  state: GameSnapshotSchema;
  gameCode: string;
  isHost: boolean;
  isJudge: boolean;
  isPending: boolean;
  onPickJudge: () => void;
  onDealCards: () => void;
}

/**
 * Lobby phase UI - waiting for judge selection and card dealing
 * Mobile-first design with prominent game code sharing
 */
export function LobbyPhase({
  state,
  gameCode,
  isHost,
  isJudge,
  isPending,
  onPickJudge,
  onDealCards,
}: LobbyPhaseProps) {
  const judgePlayer = state.round.judgeId
    ? state.players[state.round.judgeId]
    : null;
  const playerCount = Object.keys(state.players).length;
  const judgeName = judgePlayer?.name || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Game Code Section - Most prominent on mobile */}
      <GameCodeBadge gameCode={gameCode} variant="large" />

      {/* Judge Banner if selected */}
      {judgeName && (
        <JudgeBanner judgeName={judgeName} isCurrentUserJudge={isJudge} />
      )}

      {/* Lobby Card */}
      <motion.div
        className={cn(
          "bg-card rounded-2xl border-2 border-dashed border-border",
          "p-6 space-y-6"
        )}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Lobby</h2>
        </div>

        {/* Player count - large and centered */}
        <div className="flex flex-col items-center gap-2">
          <motion.span
            className="text-6xl font-bold text-primary"
            key={playerCount}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {playerCount}
          </motion.span>
          <span className="text-muted-foreground">
            player{playerCount !== 1 ? "s" : ""} ready
          </span>
        </div>

        {/* Player avatars */}
        <div className="flex flex-wrap justify-center gap-2">
          {Object.entries(state.players).map(([id, player]) => (
            <motion.div
              key={id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full text-sm",
                "bg-secondary/50",
                player.isHost && "ring-2 ring-amber-400"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                  "bg-gradient-to-br from-primary/20 to-primary/10 text-primary"
                )}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{player.name}</span>
              {player.isHost && (
                <span className="text-xs text-amber-500">Host</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Judge status */}
        <div className="text-center py-4">
          {judgePlayer ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-full",
                "bg-amber-100 dark:bg-amber-900/30"
              )}
            >
              <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-amber-800 dark:text-amber-200">
                {judgePlayer.name} is the judge
              </span>
            </motion.div>
          ) : (
            <p className="text-muted-foreground">
              Waiting for host to pick a judge...
            </p>
          )}
        </div>

        {/* Action buttons - large touch targets */}
        <div className="flex flex-col gap-3">
          {isHost && !state.round.judgeId && (
            <Button
              onClick={onPickJudge}
              disabled={isPending || playerCount < 2}
              size="lg"
              className="w-full gap-2 min-h-[52px] text-base"
            >
              <Shuffle className="w-5 h-5" />
              Pick Random Judge
            </Button>
          )}

          {isJudge && state.round.judgeId && (
            <Button
              onClick={onDealCards}
              disabled={isPending}
              size="lg"
              className="w-full gap-2 min-h-[52px] text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Shuffle className="w-5 h-5" />
              Deal Cards & Start
            </Button>
          )}

          {!isHost && !isJudge && (
            <motion.div
              className="text-center py-4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-sm text-muted-foreground">
                {state.round.judgeId
                  ? "Waiting for judge to deal cards..."
                  : "Waiting for host to start..."}
              </p>
            </motion.div>
          )}

          {/* Minimum players warning */}
          {playerCount < 3 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-amber-600 dark:text-amber-400"
            >
              Need at least 3 players to start
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* Helpful tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-muted-foreground space-y-1"
      >
        <p>Share the game code above to invite friends</p>
        <p>The judge reads the prompt and picks the funniest reply</p>
      </motion.div>
    </motion.div>
  );
}
