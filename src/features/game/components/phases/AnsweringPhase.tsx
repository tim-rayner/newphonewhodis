"use client";

import { Button } from "@/components/ui/button";
import {
  cardHasImage,
  getPromptCard,
  getReplyCard,
  getReplyDisplayText,
  isWildcard,
} from "@/features/game/assets/cards";
import type { GameSnapshotSchema } from "@/features/game/types/schema";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Clock, StopCircle } from "lucide-react";
import { CardCarousel } from "../mobile/CardCarousel";
import { ImageMessage } from "../mobile/ImageMessage";
import { JudgeIndicator } from "../mobile/JudgeBanner";
import { PhoneFrame } from "../mobile/PhoneFrame";

interface AnsweringPhaseProps {
  state: GameSnapshotSchema;
  playerId: string | null;
  isJudge: boolean;
  isPending: boolean;
  timeRemaining: number | null;
  onSubmitCard: (cardId: string, wildcardText?: string) => void;
  onEndRound: () => void;
}

/**
 * Answering phase - players submit their reply cards
 * Mobile-first design with PhoneFrame and CardCarousel
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

  const judgeName = state.round.judgeId
    ? state.players[state.round.judgeId]?.name
    : null;

  const isUrgent = timeRemaining !== null && timeRemaining <= 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Timer notification bar */}
      {timeRemaining !== null && (
        <motion.div
          className={cn(
            "flex items-center justify-center gap-2 py-2 px-4 rounded-full mx-auto w-fit",
            isUrgent ? "bg-red-500 text-white" : "bg-secondary text-foreground"
          )}
          animate={isUrgent ? { scale: [1, 1.02, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.5 }}
        >
          <Clock className="w-4 h-4" />
          <span className="font-mono font-bold">{timeRemaining}s</span>
          <span className="text-sm">remaining</span>
        </motion.div>
      )}

      {/* Phone Frame with prompt */}
      <PhoneFrame
        hostName={judgeName || "Judge"}
        isUrgent={isUrgent}
        variant="compact"
      >
        {promptCard && (
          <ImageMessage
            type="prompt"
            text={promptCard.value}
            cardId={promptCard.id}
            hasImage={cardHasImage(promptCard)}
            isRead
            delay={0.2}
          />
        )}

        {/* Typing indicator or submission count */}
        {!isJudge && !hasSubmitted && (
          <motion.div
            className="self-end text-[10px] text-[#8e8e93] mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Choose a reply card below...
          </motion.div>
        )}

        {hasSubmitted &&
          currentPlayer?.submittedCard &&
          (() => {
            const submittedId = currentPlayer.submittedCard;
            const cardIsWildcard = isWildcard(submittedId);
            const replyCard = cardIsWildcard ? null : getReplyCard(submittedId);
            const displayText = cardIsWildcard
              ? state.wildcardTexts?.[submittedId] || "Custom reply"
              : getReplyDisplayText(submittedId, state.wildcardTexts);
            return (
              <ImageMessage
                type="reply"
                text={displayText}
                cardId={submittedId}
                hasImage={!cardIsWildcard && cardHasImage(replyCard)}
                isDelivered
                isRead
                delay={0.3}
              />
            );
          })()}
      </PhoneFrame>

      {/* Submission count */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Check className="w-4 h-4" />
        <span>
          {submissionCount} / {expectedSubmissions} players answered
        </span>
      </div>

      {/* Judge view */}
      {isJudge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 p-4 bg-secondary/30 rounded-2xl"
        >
          <div className="flex items-center justify-center">
            <JudgeIndicator judgeName={judgeName} isCurrentUserJudge={true} />
          </div>

          <h3 className="text-center font-medium">Waiting for responses...</h3>

          {/* Player submission status */}
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(state.players)
              .filter(([id]) => id !== state.round.judgeId)
              .map(([id, player]) => {
                const playerHasSubmitted = !!state.round.submissions[id];
                return (
                  <motion.div
                    key={id}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium",
                      playerHasSubmitted
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "bg-secondary text-muted-foreground"
                    )}
                    animate={playerHasSubmitted ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {player.name}
                    {playerHasSubmitted && (
                      <Check className="w-3 h-3 inline ml-1" />
                    )}
                  </motion.div>
                );
              })}
          </div>

          <div className="flex justify-center pt-2">
            <Button
              onClick={onEndRound}
              disabled={isPending || submissionCount === 0}
              variant="destructive"
              size="lg"
              className="gap-2 min-h-[48px]"
            >
              <StopCircle className="w-4 h-4" />
              End Answering Phase
            </Button>
          </div>
        </motion.div>
      )}

      {/* Player card carousel */}
      {!isJudge && currentPlayer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-center text-lg font-semibold">
            {hasSubmitted ? "Card Submitted!" : "Choose your reply"}
          </h3>

          <CardCarousel
            cardIds={currentPlayer.hand}
            canSubmit={canSubmit}
            submittedCardId={currentPlayer.submittedCard}
            onSubmit={onSubmitCard}
            isPending={isPending}
            wildcardTexts={state.wildcardTexts}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

