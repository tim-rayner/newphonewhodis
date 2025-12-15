"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { motion } from "framer-motion";
import { Crown, Shuffle, Users } from "lucide-react";

interface LobbyPhaseProps {
  state: GameSnapshotSchema;
  isHost: boolean;
  isJudge: boolean;
  isPending: boolean;
  onPickJudge: () => void;
  onDealCards: () => void;
}

/**
 * Lobby phase UI - waiting for judge selection and card dealing
 */
export function LobbyPhase({
  state,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Lobby
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player count */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <span className="text-4xl font-bold text-foreground">
              {playerCount}
            </span>
            <span>player{playerCount !== 1 ? "s" : ""} ready</span>
          </div>

          {/* Judge status */}
          <div className="text-center">
            {judgePlayer ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full"
              >
                <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-medium text-amber-800 dark:text-amber-200">
                  {judgePlayer.name} is the judge
                </span>
              </motion.div>
            ) : (
              <p className="text-muted-foreground">
                Waiting for host to pick a judge...
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4">
            {isHost && !state.round.judgeId && (
              <Button
                onClick={onPickJudge}
                disabled={isPending}
                size="lg"
                className="gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Pick Judge
              </Button>
            )}

            {isJudge && state.round.judgeId && (
              <Button
                onClick={onDealCards}
                disabled={isPending}
                size="lg"
                className="gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Deal Cards
              </Button>
            )}

            {!isHost && !isJudge && (
              <p className="text-sm text-muted-foreground animate-pulse">
                {state.round.judgeId
                  ? "Waiting for judge to deal cards..."
                  : "Waiting for host to start..."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
