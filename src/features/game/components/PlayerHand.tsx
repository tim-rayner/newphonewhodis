"use client";

import { getReplyDisplayText, isWildcard } from "@/features/game/assets/cards";
import { WildcardInput } from "@/features/game/components/mobile/WildcardInput";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { GameCard } from "./GameCard";

interface PlayerHandProps {
  cardIds: string[];
  canSubmit: boolean;
  submittedCardId: string | null;
  onSubmit: (cardId: string, wildcardText?: string) => void;
  isPending: boolean;
  /** Map of wildcard cardId -> custom text (from game state) */
  wildcardTexts?: Record<string, string>;
}

/**
 * Fan-layout hand of cards with hover effects
 * Cards fan out and can be selected during ANSWERING phase
 * Supports wildcard cards with custom text input
 */
export function PlayerHand({
  cardIds,
  canSubmit,
  submittedCardId,
  onSubmit,
  isPending,
  wildcardTexts = {},
}: PlayerHandProps) {
  const [selectedWildcardId, setSelectedWildcardId] = useState<string | null>(
    null
  );
  const [wildcardModalOpen, setWildcardModalOpen] = useState(false);

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

  const handleCardClick = (cardId: string) => {
    if (!canSubmit || isPending) return;

    if (isWildcard(cardId)) {
      // For wildcards, open the modal
      setSelectedWildcardId(cardId);
      setWildcardModalOpen(true);
    } else {
      // For regular cards, submit directly
      onSubmit(cardId);
    }
  };

  const handleWildcardSubmit = (wildcardText: string) => {
    if (selectedWildcardId) {
      onSubmit(selectedWildcardId, wildcardText);
      setWildcardModalOpen(false);
      setSelectedWildcardId(null);
    }
  };

  const handleWildcardModalClose = () => {
    setWildcardModalOpen(false);
    setSelectedWildcardId(null);
  };

  if (submittedCardId) {
    const submittedIsWildcard = isWildcard(submittedCardId);
    const displayText = submittedIsWildcard
      ? wildcardTexts[submittedCardId] || "Custom reply"
      : getReplyDisplayText(submittedCardId, wildcardTexts);

    return (
      <motion.div
        className="flex flex-col items-center gap-4 py-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-sm text-muted-foreground">Your submission:</p>
        {submittedIsWildcard ? (
          <SubmittedWildcard text={displayText} />
        ) : (
          <GameCard variant="reply" text={displayText} isSelected size="lg" />
        )}
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
    <>
      <div className="relative h-72 flex items-end justify-center">
        <AnimatePresence mode="popLayout">
          {cardIds.map((cardId, index) => {
            const rotation = getCardRotation(index);
            const offset = getCardOffset(index);
            const cardIsWildcard = isWildcard(cardId);

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
                {cardIsWildcard ? (
                  <WildcardGameCard
                    isDisabled={!canSubmit || isPending}
                    onClick={() => handleCardClick(cardId)}
                  />
                ) : (
                  <GameCard
                    variant="reply"
                    text={getReplyDisplayText(cardId, wildcardTexts)}
                    isDisabled={!canSubmit || isPending}
                    onClick={() => handleCardClick(cardId)}
                    size="md"
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Wildcard input modal */}
      <WildcardInput
        isOpen={wildcardModalOpen}
        onClose={handleWildcardModalClose}
        onSubmit={handleWildcardSubmit}
        isPending={isPending}
      />
    </>
  );
}

/**
 * Desktop-style wildcard card for the fan layout
 */
function WildcardGameCard({
  isDisabled,
  onClick,
}: {
  isDisabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      className={cn(
        "relative w-40 h-56 rounded-xl shadow-lg p-4 flex flex-col",
        "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
        "border-2 border-white/20",
        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      )}
      onClick={!isDisabled ? onClick : undefined}
      whileHover={!isDisabled ? { scale: 1.05, y: -8 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
    >
      {/* Card header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Pencil className="w-3 h-3 text-white" />
        </div>
        <span className="text-[10px] text-white/80 uppercase tracking-wider font-bold">
          Wildcard
        </span>
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <motion.div
          className="text-3xl"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ✨
        </motion.div>
        <p className="text-white font-bold text-center text-sm">
          Write Your Own!
        </p>
        <p className="text-white/70 text-xs text-center">
          Click to enter reply
        </p>
      </div>

      {/* Footer decoration */}
      <div className="flex justify-end">
        <div className="w-4 h-4 rounded-full bg-white/10" />
      </div>
    </motion.div>
  );
}

/**
 * Submitted wildcard display for desktop
 */
function SubmittedWildcard({ text }: { text: string }) {
  return (
    <div
      className={cn(
        "relative w-48 h-64 rounded-xl shadow-lg p-4 flex flex-col",
        "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
        "border-2 border-primary ring-4 ring-primary ring-offset-2"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Pencil className="w-3 h-3 text-white" />
        </div>
        <span className="text-[10px] text-white/80 uppercase tracking-wider font-bold">
          Wildcard
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-white font-medium text-center leading-snug">
          {text}
        </p>
      </div>
    </div>
  );
}
