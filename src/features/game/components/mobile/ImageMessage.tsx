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
  // Initialize with cached value if available
  const [gifUrl, setGifUrl] = useState<string | undefined>(() => {
    if (!hasImage) return undefined;
    return getCachedGif(cardId);
  });
  // Track fetch completion to derive loading state
  const [fetchComplete, setFetchComplete] = useState(() => {
    // If we have a cached URL on init, fetch is already complete
    if (!hasImage) return true;
    return !!getCachedGif(cardId);
  });

  // Derive loading state instead of setting it synchronously in effect
  const isLoading = hasImage && !fetchComplete;

  // Fetch GIF on mount or when cardId changes
  // getGifForCard handles caching internally and returns quickly if cached
  useEffect(() => {
    if (!hasImage) return;

    let cancelled = false;

    getGifForCard(cardId)
      .then((url) => {
        if (!cancelled && url) {
          setGifUrl(url);
          setFetchComplete(true);
        }
      })
      .catch((error) => {
        console.error(
          `[ImageMessage] Error fetching GIF for ${cardId}:`,
          error
        );
        if (!cancelled) {
          setFetchComplete(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasImage, cardId, getGifForCard]);

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

