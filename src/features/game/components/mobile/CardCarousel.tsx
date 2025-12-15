"use client";

import {
  cardHasImage,
  getReplyCard,
  getReplyDisplayText,
} from "@/features/game/assets/cards";
import { useGifCacheContext } from "@/features/game/context";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, PanInfo, useAnimation } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface CardCarouselProps {
  cardIds: string[];
  canSubmit: boolean;
  submittedCardId: string | null;
  onSubmit: (cardId: string) => void;
  isPending: boolean;
}

/**
 * Mobile-optimized card carousel with swipe gestures
 * Shows one card prominently with peek of adjacent cards
 */
export function CardCarousel({
  cardIds,
  canSubmit,
  submittedCardId,
  onSubmit,
  isPending,
}: CardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const controls = useAnimation();

  const cardCount = cardIds.length;

  const goToCard = useCallback(
    (index: number) => {
      const newIndex = Math.max(0, Math.min(index, cardCount - 1));
      setCurrentIndex(newIndex);
    },
    [cardCount]
  );

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 50;
      const velocity = info.velocity.x;
      const offset = info.offset.x;

      if (offset > threshold || velocity > 500) {
        // Swiped right - go to previous
        goToCard(currentIndex - 1);
      } else if (offset < -threshold || velocity < -500) {
        // Swiped left - go to next
        goToCard(currentIndex + 1);
      }
    },
    [currentIndex, goToCard]
  );

  const handleCardSelect = (cardId: string) => {
    if (!canSubmit || isPending) return;
    setSelectedCardId(cardId === selectedCardId ? null : cardId);
  };

  const handleConfirmSubmit = () => {
    if (selectedCardId && canSubmit && !isPending) {
      onSubmit(selectedCardId);
    }
  };

  // Show submitted card state
  if (submittedCardId) {
    return (
      <motion.div
        className="flex flex-col items-center gap-4 py-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center gap-2 text-green-500">
          <Check className="w-5 h-5" />
          <span className="text-sm font-medium">Card Submitted!</span>
        </div>
        <ReplyCard
          cardId={submittedCardId}
          text={getReplyDisplayText(submittedCardId)}
          isSubmitted
          size="lg"
        />
      </motion.div>
    );
  }

  if (cardCount === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No cards in hand</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Card display area */}
      <div className="relative h-64 overflow-hidden">
        {/* Navigation buttons */}
        <button
          onClick={() => goToCard(currentIndex - 1)}
          disabled={currentIndex === 0}
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 z-20",
            "w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm",
            "flex items-center justify-center",
            "text-white transition-opacity",
            currentIndex === 0 ? "opacity-30" : "opacity-100 active:scale-95"
          )}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => goToCard(currentIndex + 1)}
          disabled={currentIndex === cardCount - 1}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 z-20",
            "w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm",
            "flex items-center justify-center",
            "text-white transition-opacity",
            currentIndex === cardCount - 1
              ? "opacity-30"
              : "opacity-100 active:scale-95"
          )}
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Cards */}
        <motion.div
          className="flex items-center justify-center h-full"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          animate={controls}
        >
          <AnimatePresence mode="popLayout">
            {cardIds.map((cardId, index) => {
              const offset = index - currentIndex;
              const isActive = offset === 0;
              const isVisible = Math.abs(offset) <= 1;

              if (!isVisible) return null;

              return (
                <motion.div
                  key={cardId}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    x: offset * 200,
                    scale: isActive ? 1 : 0.85,
                    opacity: isActive ? 1 : 0.5,
                    zIndex: isActive ? 10 : 5,
                    rotateY: offset * -5,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <ReplyCard
                    cardId={cardId}
                    text={getReplyDisplayText(cardId)}
                    isSelected={selectedCardId === cardId}
                    isActive={isActive}
                    onClick={() => isActive && handleCardSelect(cardId)}
                    disabled={!canSubmit || isPending}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2">
        {cardIds.map((_, index) => (
          <button
            key={index}
            onClick={() => goToCard(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentIndex
                ? "bg-primary w-4"
                : "bg-muted-foreground/30"
            )}
          />
        ))}
      </div>

      {/* Card counter */}
      <p className="text-center text-sm text-muted-foreground">
        {currentIndex + 1} of {cardCount} cards
      </p>

      {/* Submit button */}
      {selectedCardId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            onClick={handleConfirmSubmit}
            disabled={isPending}
            className={cn(
              "px-8 py-3 rounded-full font-semibold text-white",
              "bg-gradient-to-r from-green-500 to-emerald-600",
              "shadow-lg shadow-green-500/30",
              "active:scale-95 transition-transform",
              isPending && "opacity-50"
            )}
          >
            {isPending ? "Submitting..." : "Send Reply"}
          </button>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Individual reply card component for the carousel
 */
interface ReplyCardProps {
  cardId: string;
  text: string;
  isSelected?: boolean;
  isActive?: boolean;
  isSubmitted?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: "md" | "lg";
}

function ReplyCard({
  cardId,
  text,
  isSelected = false,
  isActive = true,
  isSubmitted = false,
  onClick,
  disabled = false,
  size = "md",
}: ReplyCardProps) {
  const { getGifForCard, getCachedGif } = useGifCacheContext();
  const card = getReplyCard(cardId);
  const hasImage = cardHasImage(card);

  const [gifUrl, setGifUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Fetch GIF on mount or when cardId changes
  useEffect(() => {
    if (!hasImage) return;

    // Check cache first
    const cached = getCachedGif(cardId);
    if (cached) {
      setGifUrl(cached);
      return;
    }

    // Fetch new GIF
    let cancelled = false;
    setIsLoading(true);

    getGifForCard(cardId)
      .then((url) => {
        if (!cancelled) {
          setGifUrl(url);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasImage, cardId, getCachedGif, getGifForCard]);

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl cursor-pointer select-none overflow-hidden",
        // Size variations
        size === "md" ? "w-48 h-52" : "w-56 h-60",
        // Base styling - white card
        "bg-gradient-to-br from-white to-slate-50",
        "border-2 shadow-xl",
        // Selected state
        isSelected
          ? "border-green-500 ring-4 ring-green-500/30"
          : "border-slate-200",
        // Submitted state
        isSubmitted && "border-green-500 bg-green-50",
        // Interactive states
        !disabled && isActive && "active:scale-[0.98]",
        disabled && "opacity-60 cursor-not-allowed"
      )}
      onClick={!disabled ? onClick : undefined}
      whileTap={!disabled && isActive ? { scale: 0.98 } : undefined}
    >
      {/* Card content */}
      <div className="flex flex-col h-full">
        {/* Reply indicator */}
        <div className="flex items-center gap-1 p-3 pb-0">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            Reply
          </span>
        </div>

        {/* GIF Image (if card has one) */}
        {hasImage && (
          <div className="relative mx-3 mt-2 h-20 bg-slate-100 rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : gifUrl ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  </div>
                )}
                <Image
                  src={gifUrl}
                  alt="GIF"
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-200",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  unoptimized
                />
              </>
            ) : null}
          </div>
        )}

        {/* Card text */}
        <p
          className={cn(
            "flex-1 text-slate-800 font-medium leading-snug p-3",
            hasImage && "pt-2",
            size === "md" ? "text-sm" : "text-base"
          )}
        >
          {text}
        </p>

        {/* Selection indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          >
            <Check className="w-4 h-4 text-white" />
          </motion.div>
        )}

        {/* Submitted indicator */}
        {isSubmitted && (
          <div className="absolute bottom-3 right-3">
            <Check className="w-5 h-5 text-green-600" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
