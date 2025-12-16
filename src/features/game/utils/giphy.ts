// Giphy API utility for fetching random GIFs

const GIPHY_API_URL = "https://api.giphy.com/v1/gifs/random";

interface GiphyResponse {
  data: {
    id: string;
    images: {
      fixed_height: {
        url: string;
        width: string;
        height: string;
      };
      fixed_width: {
        url: string;
        width: string;
        height: string;
      };
      downsized: {
        url: string;
        width: string;
        height: string;
      };
    };
  };
}

/**
 * Fetches a random GIF from Giphy API
 * Returns the URL to a reasonably sized GIF (fixed_width variant)
 */
export async function fetchRandomGif(): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

  if (!apiKey) {
    console.warn("[Giphy] API key not configured - using placeholder");
    return null;
  }

  try {
    const randomId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const params = new URLSearchParams({
      api_key: apiKey,
      rating: "pg-13", // Keep it relatively safe
      // Add random parameter to bust any caching
      random_id: randomId,
    });

    const response = await fetch(`${GIPHY_API_URL}?${params}`, {
      // Disable Next.js fetch caching - each call should get a unique random GIF
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Giphy API error: ${response.status}`);
    }

    const data: GiphyResponse = await response.json();
    // Use fixed_width for consistent sizing in chat bubbles
    return data.data.images.fixed_width.url;
  } catch (error) {
    console.error("[Giphy] Failed to fetch random GIF:", error);
    return null;
  }
}

/**
 * Placeholder GIF URL for when API is unavailable
 * Uses a simple placeholder service
 */
export const PLACEHOLDER_GIF_URL =
  "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif";
