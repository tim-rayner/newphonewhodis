"use client";

import { fetchRandomGif, PLACEHOLDER_GIF_URL } from "@/features/game/utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface GifCacheState {
  [cardId: string]: {
    url: string;
    loading: boolean;
  };
}

/**
 * Hook to manage GIF caching per card ID
 * Prioritizes server-assigned URLs from game state, falls back to client-side fetching
 *
 * Uses refs for cache storage to prevent stale closure issues.
 * Functions are stable (no dependencies) to avoid triggering consumer effects.
 *
 * @param serverGifUrls - Map of cardId -> gifUrl from game state (server-assigned)
 */
export function useGifCache(serverGifUrls: Record<string, string> = {}) {
  // Use ref for cache storage - prevents stale closure issues
  const cacheRef = useRef<GifCacheState>({});
  const pendingFetches = useRef<Set<string>>(new Set());
  // Store server URLs in a ref to avoid closure issues
  const serverUrlsRef = useRef<Record<string, string>>(serverGifUrls);

  // Update ref in effect to keep in sync with prop
  useEffect(() => {
    serverUrlsRef.current = serverGifUrls;
  }, [serverGifUrls]);

  // State trigger for re-renders when cache updates
  const [, forceUpdate] = useState({});

  /**
   * Get a GIF for a card - checks server URLs first, then local cache, then fetches
   */
  const getGifForCard = useCallback(
    async (cardId: string): Promise<string> => {
      // Priority 1: Server-assigned URL (source of truth)
      const serverUrl = serverUrlsRef.current[cardId];
      if (serverUrl) {
        return serverUrl;
      }

      // Priority 2: Local cache
      if (cacheRef.current[cardId]?.url) {
        return cacheRef.current[cardId].url;
      }

      // Prevent duplicate fetches for the same card
      if (pendingFetches.current.has(cardId)) {
        return PLACEHOLDER_GIF_URL;
      }

      // Fallback: Fetch from Giphy (should be rare - only for edge cases)
      pendingFetches.current.add(cardId);
      cacheRef.current[cardId] = { url: "", loading: true };
      forceUpdate({});

      try {
        const gifUrl = await fetchRandomGif();
        const finalUrl = gifUrl || PLACEHOLDER_GIF_URL;

        cacheRef.current[cardId] = { url: finalUrl, loading: false };
        pendingFetches.current.delete(cardId);
        forceUpdate({});

        return finalUrl;
      } catch (error) {
        console.error(`[GifCache] Error fetching GIF for ${cardId}:`, error);
        pendingFetches.current.delete(cardId);
        cacheRef.current[cardId] = { url: PLACEHOLDER_GIF_URL, loading: false };
        forceUpdate({});
        return PLACEHOLDER_GIF_URL;
      }
    },
    [] // Stable function - uses refs internally
  );

  /**
   * Check if a GIF is currently loading for a card
   */
  const isLoading = useCallback((cardId: string): boolean => {
    // If server has the URL, it's not loading
    if (serverUrlsRef.current[cardId]) return false;
    return cacheRef.current[cardId]?.loading ?? false;
  }, []); // Stable function - uses refs internally

  /**
   * Get cached GIF URL synchronously (returns undefined if not cached)
   * Checks server URLs first, then local cache
   */
  const getCachedGif = useCallback((cardId: string): string | undefined => {
    // Priority 1: Server-assigned URL
    const serverUrl = serverUrlsRef.current[cardId];
    if (serverUrl) {
      return serverUrl;
    }
    // Priority 2: Local cache
    const localUrl = cacheRef.current[cardId]?.url || undefined;

    // Debug: Log cache miss for GIF cards
    if (!localUrl) {
      console.debug(
        `[GifCache] Cache miss for ${cardId}. Server URLs:`,
        Object.keys(serverUrlsRef.current).length
      );
    }

    return localUrl;
  }, []); // Stable function - uses refs internally

  /**
   * Clear all locally cached GIFs (useful for new game)
   * Note: Server URLs are managed by game state, not cleared here
   */
  const clearCache = useCallback(() => {
    cacheRef.current = {};
    pendingFetches.current.clear();
    forceUpdate({});
  }, []);

  return {
    getGifForCard,
    getCachedGif,
    isLoading,
    clearCache,
  };
}
