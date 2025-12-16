"use client";

import { createContext, ReactNode, useContext } from "react";
import { useGifCache } from "../hooks/useGifCache";

type GifCacheContextType = ReturnType<typeof useGifCache>;

const GifCacheContext = createContext<GifCacheContextType | null>(null);

interface GifCacheProviderProps {
  children: ReactNode;
  /** Server-assigned GIF URLs from game state - takes priority over local cache */
  serverGifUrls?: Record<string, string>;
}

/**
 * Provides GIF caching to game components
 * Pass serverGifUrls from game state to ensure all players see the same GIFs
 */
export function GifCacheProvider({
  children,
  serverGifUrls = {},
}: GifCacheProviderProps) {
  const gifCache = useGifCache(serverGifUrls);

  return (
    <GifCacheContext.Provider value={gifCache}>
      {children}
    </GifCacheContext.Provider>
  );
}

/**
 * Hook to access the GIF cache from any game component
 */
export function useGifCacheContext() {
  const context = useContext(GifCacheContext);
  if (!context) {
    throw new Error(
      "useGifCacheContext must be used within a GifCacheProvider"
    );
  }
  return context;
}
