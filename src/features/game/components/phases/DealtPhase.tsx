"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPromptCard } from "@/features/game/assets/cards";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { GameCard } from "../GameCard";

interface DealtPhaseProps {
  state: GameSnapshotSchema;
  isJudge: boolean;
  isPending: boolean;
  onStartRound: () => void;
}

/**
 * Cards dealt phase - showing prompt, waiting for judge to start round
 */
export function DealtPhase({
  state,
  isJudge,
  isPending,
  onStartRound,
}: DealtPhaseProps) {
  const promptCard = state.round.promptCard
    ? getPromptCard(state.round.promptCard)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Prompt Card Reveal */}
      <div className="flex justify-center">
        <motion.div
          initial={{ rotateY: 180, scale: 0.8 }}
          animate={{ rotateY: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {promptCard && (
            <GameCard variant="prompt" text={promptCard.value} size="lg" />
          )}
        </motion.div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Cards Dealt!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isJudge ? (
            <>
              <p className="text-center text-muted-foreground">
                You are the judge. Review the prompt and start the round when
                ready!
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={onStartRound}
                  disabled={isPending}
                  size="lg"
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Round
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground animate-pulse">
              Waiting for judge to start the round...
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
