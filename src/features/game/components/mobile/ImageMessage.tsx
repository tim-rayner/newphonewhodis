"use client";

import { useGifCacheContext } from "@/features/game/context";
import { useEffect, useState } from "react";
import { MessageBubble } from "./MessageBubble";

interface ImageMessageProps {
  type: "prompt" | "reply";
  text: string;
  cardId: string;
  hasImage: boolean;
  timestamp?: string;
  isDelivered?: boolean;
  isRead?: boolean;
  isWinner?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  delay?: number;
}

/**
 * Wrapper component that handles GIF fetching for message bubbles
 * Uses the GIF cache context to ensure consistent GIFs per card
 */
export function ImageMessage({
  type,
  text,
  cardId,
  hasImage,
  timestamp,
  isDelivered,
  isRead,
  isWinner,
  isSelected,
  onClick,
  className,
  delay,
}: ImageMessageProps) {
  const { getGifForCard, getCachedGif } = useGifCacheContext();
  const [gifUrl, setGifUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch GIF on mount or when cardId changes
  useEffect(() => {
    if (!hasImage) return;

    // Check cache first (synchronous)
    const cached = getCachedGif(cardId);
    if (cached) {
      setGifUrl(cached);
      return;
    }

    // Fetch new GIF (async)
    let cancelled = false;
    setIsLoading(true);

    getGifForCard(cardId)
      .then((url) => {
        if (!cancelled && url) {
          setGifUrl(url);
        }
      })
      .catch((error) => {
        console.error(
          `[ImageMessage] Error fetching GIF for ${cardId}:`,
          error
        );
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
    <MessageBubble
      type={type}
      text={text}
      gifUrl={hasImage ? gifUrl : undefined}
      isGifLoading={hasImage && isLoading}
      timestamp={timestamp}
      isDelivered={isDelivered}
      isRead={isRead}
      isWinner={isWinner}
      isSelected={isSelected}
      onClick={onClick}
      className={className}
      delay={delay}
    />
  );
}
