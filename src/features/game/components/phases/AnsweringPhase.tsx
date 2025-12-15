"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPromptCard } from "@/features/game/assets/cards";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { motion } from "framer-motion";
import { Check, Clock, StopCircle } from "lucide-react";
import { GameCard } from "../GameCard";
import { PlayerHand } from "../PlayerHand";

interface AnsweringPhaseProps {
  state: GameSnapshotSchema;
  playerId: string | null;
  isJudge: boolean;
  isPending: boolean;
  timeRemaining: number | null;
  onSubmitCard: (cardId: string) => void;
  onEndRound: () => void;
}

/**
 * Answering phase - players submit their reply cards
 */
export function AnsweringPhase({
  state,
  playerId,
  isJudge,
  isPending,
  timeRemaining,
  onSubmitCard,
  onEndRound,
}: AnsweringPhaseProps) {
  const promptCard = state.round.promptCard
    ? getPromptCard(state.round.promptCard)
    : null;

  const currentPlayer = playerId ? state.players[playerId] : null;
  const submissionCount = Object.keys(state.round.submissions).length;
  const totalPlayers = Object.keys(state.players).length;
  const expectedSubmissions = totalPlayers - 1; // Exclude judge

  const hasSubmitted = currentPlayer?.submittedCard !== null;
  const canSubmit = !isJudge && !hasSubmitted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Prompt Card */}
      <div className="flex justify-center">
        {promptCard && (
          <GameCard variant="prompt" text={promptCard.value} size="lg" />
        )}
      </div>

      {/* Timer and submission count */}
      <div className="flex items-center justify-center gap-6">
        {timeRemaining !== null && (
          <motion.div
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              timeRemaining <= 10
                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                : "bg-secondary"
            }`}
            animate={timeRemaining <= 10 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">{timeRemaining}s</span>
          </motion.div>
        )}

        <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
          <Check className="w-4 h-4" />
          <span>
            {submissionCount} / {expectedSubmissions} submitted
          </span>
        </div>
      </div>

      {/* Judge view */}
      {isJudge && (
        <Card>
          <CardHeader>
            <CardTitle>Players are answering...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.entries(state.players)
                .filter(([id]) => id !== state.round.judgeId)
                .map(([id, player]) => {
                  const hasSubmitted = !!state.round.submissions[id];
                  return (
                    <motion.div
                      key={id}
                      className={`px-3 py-1 rounded-full text-sm ${
                        hasSubmitted
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-secondary text-muted-foreground"
                      }`}
                      animate={hasSubmitted ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {player.name}
                      {hasSubmitted && " ✓"}
                    </motion.div>
                  );
                })}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={onEndRound}
                disabled={isPending || submissionCount === 0}
                variant="destructive"
                className="gap-2"
              >
                <StopCircle className="w-4 h-4" />
                End Answering Phase
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player hand */}
      {!isJudge && currentPlayer && (
        <Card>
          <CardHeader>
            <CardTitle>
              {hasSubmitted ? "Card Submitted!" : "Choose your reply"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PlayerHand
              cardIds={currentPlayer.hand}
              canSubmit={canSubmit}
              submittedCardId={currentPlayer.submittedCard}
              onSubmit={onSubmitCard}
              isPending={isPending}
            />
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
