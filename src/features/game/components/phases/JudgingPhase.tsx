"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPromptCard,
  getReplyDisplayText,
} from "@/features/game/assets/cards";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import { useState } from "react";
import { GameCard } from "../GameCard";

interface JudgingPhaseProps {
  state: GameSnapshotSchema;
  isJudge: boolean;
  isPending: boolean;
  onVote: (winningPlayerId: string) => void;
}

/**
 * Judging phase - judge picks the winning submission
 */
export function JudgingPhase({
  state,
  isJudge,
  isPending,
  onVote,
}: JudgingPhaseProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const promptCard = state.round.promptCard
    ? getPromptCard(state.round.promptCard)
    : null;

  const submissions = Object.entries(state.round.submissions);

  const handleSelect = (playerId: string) => {
    if (isJudge && !isPending) {
      setSelectedId(playerId);
    }
  };

  const handleConfirmVote = () => {
    if (selectedId) {
      onVote(selectedId);
    }
  };

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

      {/* Phase Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            {isJudge ? "Pick the Winner!" : "Judge is deciding..."}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Submissions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {submissions.map(([playerId, cardId], index) => {
                const isSelected = selectedId === playerId;

                return (
                  <motion.div
                    key={playerId}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-center"
                  >
                    <div
                      className={`relative ${isJudge ? "cursor-pointer" : ""}`}
                      onClick={() => handleSelect(playerId)}
                    >
                      <GameCard
                        variant="reply"
                        text={getReplyDisplayText(cardId)}
                        isSelected={isSelected}
                        size="md"
                      />
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                        >
                          <Sparkles className="w-4 h-4 text-primary-foreground" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Confirm button for judge */}
          {isJudge && (
            <div className="flex justify-center">
              <Button
                onClick={handleConfirmVote}
                disabled={!selectedId || isPending}
                size="lg"
                className="gap-2"
              >
                <Crown className="w-4 h-4" />
                Confirm Winner
              </Button>
            </div>
          )}

          {!isJudge && (
            <p className="text-center text-muted-foreground animate-pulse">
              Waiting for judge to pick the winner...
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
