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
import { AnimatePresence, motion, PanInfo, useAnimation } from "framer-motion";
import { ChevronLeft, ChevronRight, Crown, SkipForward } from "lucide-react";
import { useCallback, useState } from "react";
import { ImageMessage } from "../mobile/ImageMessage";
import { JudgeIndicator } from "../mobile/JudgeBanner";
import { PhoneFrame } from "../mobile/PhoneFrame";

interface JudgingPhaseProps {
  state: GameSnapshotSchema;
  isJudge: boolean;
  isPending: boolean;
  onVote: (winningPlayerId?: string | null) => void;
}

/**
 * Judging phase - judge picks the winning submission
 * Mobile-first design with swipeable PhoneFrame cards
 */
export function JudgingPhase({
  state,
  isJudge,
  isPending,
  onVote,
}: JudgingPhaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const controls = useAnimation();

  const promptCard = state.round.promptCard
    ? getPromptCard(state.round.promptCard)
    : null;

  const submissions = Object.entries(state.round.submissions);
  const submissionCount = submissions.length;

  // Current card is always the selected one
  const currentPlayerId = submissions[currentIndex]?.[0] ?? null;

  const judgeName = state.round.judgeId
    ? state.players[state.round.judgeId]?.name
    : null;

  const goToSubmission = useCallback(
    (index: number) => {
      const newIndex = Math.max(0, Math.min(index, submissionCount - 1));
      setCurrentIndex(newIndex);
    },
    [submissionCount]
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 50;
      const velocity = info.velocity.x;
      const offset = info.offset.x;

      if (offset > threshold || velocity > 500) {
        goToSubmission(currentIndex - 1);
      } else if (offset < -threshold || velocity < -500) {
        goToSubmission(currentIndex + 1);
      }
    },
    [currentIndex, goToSubmission]
  );

  const handleConfirmVote = () => {
    if (currentPlayerId) {
      onVote(currentPlayerId);
    }
  };

  // Non-judge waiting view
  if (!isJudge) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <div className="flex justify-center">
          <JudgeIndicator judgeName={judgeName} isCurrentUserJudge={false} />
        </div>

        <PhoneFrame hostName={judgeName || "Judge"} variant="compact">
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

          <motion.div
            className="self-center py-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {submissionCount > 0 ? (
              <>
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Crown className="w-8 h-8 text-amber-500" />
                </motion.div>
                <p className="text-[#8e8e93] text-sm">
                  {judgeName} is reviewing {submissionCount} answers...
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <SkipForward className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-[#8e8e93] text-sm">
                  No answers were submitted this round
                </p>
              </>
            )}
          </motion.div>
        </PhoneFrame>

        <p className="text-center text-sm text-muted-foreground animate-pulse">
          {submissionCount > 0
            ? "Waiting for judge to pick the winner..."
            : "Waiting for judge to proceed..."}
        </p>
      </motion.div>
    );
  }

  // Judge view - no submissions case
  if (submissionCount === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-center gap-2">
          <JudgeIndicator judgeName={judgeName} isCurrentUserJudge={true} />
        </div>

        <PhoneFrame hostName={judgeName || "Judge"} variant="compact">
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

          <motion.div
            className="self-center py-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <SkipForward className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-[#8e8e93] text-sm">
              No one submitted an answer this round
            </p>
          </motion.div>
        </PhoneFrame>

        <div className="flex justify-center">
          <Button
            onClick={() => onVote(null)}
            disabled={isPending}
            size="lg"
            variant="secondary"
            className="gap-2 min-h-[52px] px-8"
          >
            <SkipForward className="w-5 h-5" />
            Skip Round - No Winner
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Proceed to the next round
        </p>
      </motion.div>
    );
  }

  // Judge view - swipeable submissions
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-center gap-2">
        <JudgeIndicator judgeName={judgeName} isCurrentUserJudge={true} />
      </div>

      <h2 className="text-center text-xl font-bold">Pick the Winner!</h2>

      {/* Swipeable phone frames */}
      <div className="relative">
        {/* Navigation buttons */}
        <button
          onClick={() => goToSubmission(currentIndex - 1)}
          disabled={currentIndex === 0}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 z-20",
            "w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border",
            "flex items-center justify-center",
            "transition-opacity",
            currentIndex === 0 ? "opacity-30" : "opacity-100 active:scale-95"
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => goToSubmission(currentIndex + 1)}
          disabled={currentIndex === submissionCount - 1}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 z-20",
            "w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border",
            "flex items-center justify-center",
            "transition-opacity",
            currentIndex === submissionCount - 1
              ? "opacity-30"
              : "opacity-100 active:scale-95"
          )}
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Single phone frame - flat carousel */}
        <motion.div
          className="px-12"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          animate={controls}
        >
          <AnimatePresence mode="wait">
            {submissions.map(([playerId, cardId], index) => {
              if (index !== currentIndex) return null;

              const cardIsWildcard = isWildcard(cardId);
              const replyCard = cardIsWildcard ? null : getReplyCard(cardId);
              const displayText = cardIsWildcard
                ? state.wildcardTexts?.[cardId] || "Custom reply"
                : getReplyDisplayText(cardId, state.wildcardTexts);

              return (
                <motion.div
                  key={playerId}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <PhoneFrame
                      hostName={judgeName || "Judge"}
                      variant="compact"
                      showHeader={true}
                    >
                      {promptCard && (
                        <ImageMessage
                          type="prompt"
                          text={promptCard.value}
                          cardId={promptCard.id}
                          hasImage={cardHasImage(promptCard)}
                          isRead
                        />
                      )}

                      <ImageMessage
                        type="reply"
                        text={displayText}
                        cardId={cardId}
                        hasImage={!cardIsWildcard && cardHasImage(replyCard)}
                        isDelivered
                        isRead
                        delay={0.2}
                      />
                    </PhoneFrame>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2">
        {submissions.map(([playerId], index) => (
          <button
            key={playerId}
            onClick={() => goToSubmission(index)}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all",
              index === currentIndex
                ? "bg-primary w-5"
                : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>

      {/* Counter and confirm */}
      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          {currentIndex + 1} of {submissionCount} answers
        </p>

        {/* Confirm button */}
        <div className="flex justify-center">
          <Button
            onClick={handleConfirmVote}
            disabled={isPending || !currentPlayerId}
            size="lg"
            className="gap-2 min-h-[52px] px-8"
          >
            <Crown className="w-5 h-5" />
            Choose This Answer
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Swipe or use arrows to browse answers
        </p>
      </div>
    </motion.div>
  );
}
