"use client";

import { Button } from "@/components/ui/button";
import { getPromptCard } from "@/features/game/assets/cards";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
import { JudgeIndicator } from "../mobile/JudgeBanner";
import { MessageBubble } from "../mobile/MessageBubble";
import { PhoneFrame } from "../mobile/PhoneFrame";

interface DealtPhaseProps {
  state: GameSnapshotSchema;
  isJudge: boolean;
  isPending: boolean;
  onStartRound: () => void;
}

/**
 * Cards dealt phase - showing prompt, waiting for judge to start round
 * Mobile-first design with PhoneFrame
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

  const judgeName = state.round.judgeId
    ? state.players[state.round.judgeId]?.name
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Cards dealt notification */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1 }}
        className="flex items-center justify-center gap-2 text-primary"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-semibold">Cards Dealt!</span>
        <Sparkles className="w-5 h-5" />
      </motion.div>

      {/* Phone Frame with prompt reveal */}
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <PhoneFrame hostName={judgeName || "Judge"} variant="compact">
          {promptCard && (
            <MessageBubble
              type="prompt"
              text={promptCard.value}
              isRead
              delay={0.4}
            />
          )}

          {/* Waiting indicator */}
          <motion.div
            className="self-center py-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-[#8e8e93] text-sm">
              {isJudge
                ? "Ready to start the round?"
                : "Waiting for judge to begin..."}
            </p>
          </motion.div>
        </PhoneFrame>
      </motion.div>

      {/* Action area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        <div className="flex justify-center">
          <JudgeIndicator judgeName={judgeName} isCurrentUserJudge={isJudge} />
        </div>

        {isJudge ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-center text-sm text-muted-foreground">
              Review the prompt above, then start the round when ready!
            </p>
            <Button
              onClick={onStartRound}
              disabled={isPending}
              size="lg"
              className="gap-2 min-h-[52px] px-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              <Play className="w-5 h-5" />
              Start Round
            </Button>
          </div>
        ) : (
          <motion.p
            className="text-center text-sm text-muted-foreground"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Get ready to pick your best reply...
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
