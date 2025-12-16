// Giphy API utility for fetching filtered, meme-appropriate GIFs

import { GiphySearchResponse, selectRandomFromTop } from "./giphyFilter";

const GIPHY_SEARCH_URL = "https://api.giphy.com/v1/gifs/search";

/**
 * Meme-relevant search terms for fetching reaction-worthy GIFs
 * These are rotated to provide variety while staying in the "funny/meme" space
 */
const MEME_SEARCH_TERMS = [
  "reaction",
  "meme",
  "funny",
  "fail",
  "win",
  "wtf",
  "lol",
  "mood",
  "me when",
  "shocked",
  "excited",
  "awkward",
  "cringe",
  "celebrate",
  "facepalm",
  "laugh",
  "dancing",
  "gaming",
  "rage",
  "epic",
];

/**
 * Get a random search term from the meme-relevant list
 */
function getRandomSearchTerm(): string {
  const index = Math.floor(Math.random() * MEME_SEARCH_TERMS.length);
  return MEME_SEARCH_TERMS[index];
}

/**
 * Fetches a filtered, meme-appropriate GIF from GIPHY
 *
 * Uses the Search API with meme-relevant queries, then applies
 * filtering to remove quote tiles, static images, and non-meme content.
 *
 * @param searchTerm - Optional specific search term (defaults to random meme term)
 * @param retryCount - Internal retry counter
 * @returns URL to a reasonably sized GIF (fixed_width variant)
 */
export async function fetchFilteredGif(
  searchTerm?: string,
  retryCount: number = 0
): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

  if (!apiKey) {
    console.warn("[Giphy] API key not configured - using placeholder");
    return null;
  }

  // Max 3 retries with different search terms
  const MAX_RETRIES = 3;
  if (retryCount >= MAX_RETRIES) {
    console.warn("[Giphy] Max retries reached, no suitable GIF found");
    return null;
  }

  const query = searchTerm || getRandomSearchTerm();

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      q: query,
      rating: "pg-13", // Keep it relatively safe for game context
      limit: "25", // Fetch batch for filtering
      // Random offset to get different results each time
      offset: String(Math.floor(Math.random() * 100)),
    });

    const response = await fetch(`${GIPHY_SEARCH_URL}?${params}`, {
      // Disable Next.js fetch caching
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Giphy API error: ${response.status}`);
    }

    const data: GiphySearchResponse = await response.json();

    if (data.data.length === 0) {
      console.warn(`[Giphy] No results for "${query}", trying another term`);
      return fetchFilteredGif(undefined, retryCount + 1);
    }

    // Apply filters and select best candidate
    const bestGif = selectRandomFromTop(data.data, 5);

    if (!bestGif) {
      // All GIFs filtered out, try different search term
      console.warn(
        `[Giphy] All ${data.data.length} results filtered out for "${query}", retrying`
      );
      return fetchFilteredGif(undefined, retryCount + 1);
    }

    // Return fixed_width URL for consistent sizing in chat bubbles
    return bestGif.images.fixed_width.url;
  } catch (error) {
    console.error("[Giphy] Failed to fetch filtered GIF:", error);
    return null;
  }
}

/**
 * Fetches a random GIF from Giphy API
 * Returns the URL to a reasonably sized GIF (fixed_width variant)
 *
 * This is the main entry point - uses filtered search internally
 * to ensure meme-appropriate content.
 */
export async function fetchRandomGif(): Promise<string | null> {
  return fetchFilteredGif();
}

/**
 * Placeholder GIF URL for when API is unavailable
 * Uses a simple placeholder service
 */
export const PLACEHOLDER_GIF_URL =
  "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif";
