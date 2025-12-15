"use client";

import { getReplyDisplayText } from "@/features/game/assets/cards";
import { AnimatePresence, motion } from "framer-motion";
import { GameCard } from "./GameCard";

interface PlayerHandProps {
  cardIds: string[];
  canSubmit: boolean;
  submittedCardId: string | null;
  onSubmit: (cardId: string) => void;
  isPending: boolean;
}

/**
 * Fan-layout hand of cards with hover effects
 * Cards fan out and can be selected during ANSWERING phase
 */
export function PlayerHand({
  cardIds,
  canSubmit,
  submittedCardId,
  onSubmit,
  isPending,
}: PlayerHandProps) {
  const cardCount = cardIds.length;
  const maxRotation = 15; // degrees
  const cardSpacing = 80; // pixels between card centers

  // Calculate rotation for each card to create fan effect
  const getCardRotation = (index: number) => {
    if (cardCount <= 1) return 0;
    const normalizedIndex =
      (index - (cardCount - 1) / 2) / ((cardCount - 1) / 2);
    return normalizedIndex * maxRotation;
  };

  // Calculate horizontal offset for each card
  const getCardOffset = (index: number) => {
    const centerIndex = (cardCount - 1) / 2;
    return (index - centerIndex) * cardSpacing;
  };

  if (submittedCardId) {
    return (
      <motion.div
        className="flex flex-col items-center gap-4 py-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-sm text-muted-foreground">Your submission:</p>
        <GameCard
          variant="reply"
          text={getReplyDisplayText(submittedCardId)}
          isSelected
          size="lg"
        />
      </motion.div>
    );
  }

  if (cardIds.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No cards in hand</p>
      </div>
    );
  }

  return (
    <div className="relative h-72 flex items-end justify-center">
      <AnimatePresence mode="popLayout">
        {cardIds.map((cardId, index) => {
          const rotation = getCardRotation(index);
          const offset = getCardOffset(index);

          return (
            <motion.div
              key={cardId}
              className="absolute bottom-0"
              style={{ originY: 1 }}
              initial={{ opacity: 0, y: 100, rotate: 0 }}
              animate={{
                opacity: 1,
                y: 0,
                x: offset,
                rotate: rotation,
                zIndex: index,
              }}
              exit={{ opacity: 0, y: 100, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                delay: index * 0.05,
              }}
              whileHover={{
                y: -40,
                zIndex: 50,
                rotate: 0,
                transition: { duration: 0.2 },
              }}
            >
              <GameCard
                variant="reply"
                text={getReplyDisplayText(cardId)}
                isDisabled={!canSubmit || isPending}
                onClick={() => canSubmit && !isPending && onSubmit(cardId)}
                size="md"
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
