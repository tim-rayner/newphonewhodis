/**
 * GIPHY Content Filtering
 *
 * Composable filters to ensure GIFs are:
 * - Actually animated (not static quote tiles)
 * - Meme-appropriate (funny, reaction-worthy)
 * - Not from known low-quality sources
 *
 * Design: Each filter is a pure function that can be composed.
 * Hard filters reject outright; soft filters affect scoring.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * GIPHY GIF object from the Search API response
 * Contains metadata we need for filtering decisions
 */
export interface GiphyGifObject {
  id: string;
  title: string;
  /** Original source URL where the GIF was found */
  source: string;
  /** Top-level domain of the source (e.g., "tumblr.com") */
  source_tld: string;
  /** GIPHY username who uploaded */
  username: string;
  /** Content rating: g, pg, pg-13, r */
  rating: string;
  images: {
    original: {
      url: string;
      width: string;
      height: string;
      /** Number of frames - not always present */
      frames?: string;
      /** File size in bytes */
      size?: string;
    };
    fixed_width: {
      url: string;
      width: string;
      height: string;
    };
    fixed_height: {
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
}

/**
 * GIPHY Search API response structure
 */
export interface GiphySearchResponse {
  data: GiphyGifObject[];
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
  meta: {
    status: number;
    msg: string;
  };
}

/**
 * Result of filtering a single GIF
 */
export interface FilterResult {
  passed: boolean;
  reason?: string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Minimum frames for a "real" animated GIF
 * - 1-2 frames = effectively static (loading spinners, minor tweens)
 * - 3+ frames = actual animation worth showing
 */
const MIN_FRAME_COUNT = 3;

/**
 * Maximum aspect ratio (width/height) before we suspect it's a banner/quote tile
 * Quote tiles are often very wide (panoramic) or very tall (portrait quotes)
 * Normal reaction GIFs tend to be closer to square or 16:9
 */
const MAX_ASPECT_RATIO = 3.0;
const MIN_ASPECT_RATIO = 0.33;

/**
 * Domain blacklist - known sources of non-meme content
 * These domains primarily host quote tiles, affirmations, or static content
 */
const BLACKLISTED_DOMAINS: string[] = [
  // Dutch quote tile sites
  "tegelspraken.nl",
  "tegeltjeswijsheid.nl",
  "spreuktegel.nl",
  // Quote/affirmation sites
  "brainyquote.com",
  "quotefancy.com",
  "azquotes.com",
  "goodreads.com",
  "picturequotes.com",
  "quotemaster.org",
  // Stock photo sites (often have static "GIFs")
  "shutterstock.com",
  "gettyimages.com",
  "istockphoto.com",
];

/**
 * Username blacklist - GIPHY accounts known for quote/affirmation content
 */
const BLACKLISTED_USERNAMES: string[] = [
  "quotescover",
  "inspirationalquotes",
  "motivationalquotes",
  "wisdomquotes",
  "dailyaffirmations",
];

/**
 * Title patterns that indicate quote/wisdom content (case-insensitive)
 * If a title matches any of these, it's likely not meme content
 */
const QUOTE_TITLE_PATTERNS: RegExp[] = [
  /\bquote\b/i,
  /\bquotes\b/i,
  /\bwisdom\b/i,
  /\binspiration(al)?\b/i,
  /\bmotivation(al)?\b/i,
  /\baffirmation\b/i,
  /\bspreuk\b/i, // Dutch: "saying"
  /\btegel\b/i, // Dutch: "tile" (as in quote tile)
  /\bwijsheid\b/i, // Dutch: "wisdom"
  /\bproverb\b/i,
  /\bsaying\b/i,
  /\bmantra\b/i,
  /\bblessing\b/i,
  /\bprayer\b/i,
  /\bverse\b/i,
  /\bscripture\b/i,
  /\bbiblical\b/i,
  /\bmeditation\b/i,
  /\bmindfulness\b/i,
  /\bpositive vibes\b/i,
  /\bgood morning\b/i, // Often paired with quote tiles
  /\bgood night\b/i,
];

/**
 * Source URL patterns that indicate quote content
 */
const QUOTE_SOURCE_PATTERNS: RegExp[] = [
  /quote/i,
  /wisdom/i,
  /inspiration/i,
  /motivation/i,
  /affirmation/i,
  /spreuk/i,
  /tegel/i,
];

/**
 * Meme-positive signals in titles - boost score if present
 * These indicate content that's likely funny/reaction-worthy
 */
const MEME_POSITIVE_SIGNALS: string[] = [
  // Reaction words
  "reaction",
  "mood",
  "mfw",
  "mrw",
  "tfw",
  "when you",
  "me when",
  "pov",
  // Internet culture
  "meme",
  "lol",
  "lmao",
  "rofl",
  "wtf",
  "omg",
  "bruh",
  "sus",
  "based",
  "cringe",
  // Gaming
  "gaming",
  "gamer",
  "gg",
  "ez",
  "noob",
  "clutch",
  "rage",
  "rage quit",
  "victory",
  "defeat",
  // Emotions/expressions
  "laugh",
  "crying",
  "scream",
  "shock",
  "surprised",
  "confused",
  "angry",
  "happy",
  "sad",
  "excited",
  "nervous",
  "awkward",
  "cringe",
  // Outcomes
  "fail",
  "win",
  "epic",
  "savage",
  "rekt",
  "owned",
  "destroyed",
  // Actions
  "dance",
  "dancing",
  "celebrate",
  "facepalm",
  "eyeroll",
  "clap",
  "applause",
  "thumbs up",
  "thumbs down",
  "mic drop",
  "deal with it",
  "nope",
  "yes",
  "no",
];

/**
 * Known meme-friendly GIPHY usernames (verified accounts, meme pages)
 * Slight score boost for content from these sources
 */
const TRUSTED_USERNAMES: string[] = [
  "giphy",
  "originals",
  "netflix",
  "hulu",
  "nbc",
  "cbs",
  "abcnetwork",
  "mtv",
  "comedycentral",
  "snl",
  "theoffice",
  "parksandrec",
  "friends",
  "spongebob",
  "nickelodeon",
  "cartoonnetwork",
  "adultswim",
  "reactionseditor",
  "maboroshi",
];

// =============================================================================
// Filter Functions (Hard Filters - reject outright)
// =============================================================================

/**
 * Check if a GIF is effectively static (too few frames)
 *
 * Static GIFs break immersion - they're not really "GIFs" in the
 * cultural sense, just images saved in GIF format.
 *
 * @returns true if the GIF should be REJECTED (is static)
 */
export function isStaticGif(gif: GiphyGifObject): boolean {
  const frames = gif.images.original.frames;

  // If frame count is available, use it
  if (frames !== undefined) {
    const frameCount = parseInt(frames, 10);
    if (!isNaN(frameCount) && frameCount < MIN_FRAME_COUNT) {
      return true;
    }
  }

  // Fallback: Check file size as a proxy for animation
  // Very small files (< 50KB) are often static or near-static
  const size = gif.images.original.size;
  if (size !== undefined) {
    const sizeBytes = parseInt(size, 10);
    // 50KB threshold - most animated GIFs are larger
    if (!isNaN(sizeBytes) && sizeBytes < 50000) {
      return true;
    }
  }

  return false;
}

/**
 * Check if aspect ratio suggests a quote tile or banner
 *
 * Quote tiles often have extreme aspect ratios:
 * - Very wide (panoramic quote banners)
 * - Very tall (portrait-style quote cards)
 *
 * Normal reaction GIFs are typically 1:1 to 16:9
 *
 * @returns true if the GIF should be REJECTED (suspicious aspect ratio)
 */
export function hasSuspiciousAspectRatio(gif: GiphyGifObject): boolean {
  const width = parseInt(gif.images.original.width, 10);
  const height = parseInt(gif.images.original.height, 10);

  if (isNaN(width) || isNaN(height) || height === 0) {
    return false; // Can't determine, let it pass
  }

  const aspectRatio = width / height;
  return aspectRatio > MAX_ASPECT_RATIO || aspectRatio < MIN_ASPECT_RATIO;
}

/**
 * Check if the GIF is from a blacklisted domain
 *
 * These are known sources of quote tiles, affirmations, and other
 * non-meme content that consistently fails our quality bar.
 *
 * @returns true if the GIF should be REJECTED (blacklisted source)
 */
export function hasBlacklistedSource(gif: GiphyGifObject): boolean {
  const sourceTld = gif.source_tld.toLowerCase();
  const source = gif.source.toLowerCase();

  // Check domain blacklist
  if (BLACKLISTED_DOMAINS.some((domain) => sourceTld.includes(domain))) {
    return true;
  }

  // Check full source URL for blacklisted domains
  if (BLACKLISTED_DOMAINS.some((domain) => source.includes(domain))) {
    return true;
  }

  // Check username blacklist
  const username = gif.username.toLowerCase();
  if (BLACKLISTED_USERNAMES.some((u) => username.includes(u))) {
    return true;
  }

  return false;
}

/**
 * Check if the GIF appears to be a quote tile based on title/source
 *
 * Uses pattern matching on title and source URL to detect
 * quote, wisdom, affirmation content.
 *
 * @returns true if the GIF should be REJECTED (quote tile detected)
 */
export function isQuoteTile(gif: GiphyGifObject): boolean {
  const title = gif.title.toLowerCase();
  const source = gif.source.toLowerCase();

  // Check title against quote patterns
  if (QUOTE_TITLE_PATTERNS.some((pattern) => pattern.test(title))) {
    return true;
  }

  // Check source URL against quote patterns
  if (QUOTE_SOURCE_PATTERNS.some((pattern) => pattern.test(source))) {
    return true;
  }

  return false;
}

// =============================================================================
// Scoring Functions (Soft Signals - affect ranking)
// =============================================================================

/**
 * Calculate a "meme score" for a GIF based on positive signals
 *
 * Higher score = more likely to be funny/reaction-worthy
 * Used to rank GIFs that pass all hard filters
 *
 * Score breakdown:
 * - Base score: 0
 * - Each meme signal in title: +10
 * - Trusted username: +15
 * - Has many frames (animated): +5
 * - Large file size (complex animation): +3
 *
 * @returns numeric score (higher = better)
 */
export function getMemeScore(gif: GiphyGifObject): number {
  let score = 0;
  const titleLower = gif.title.toLowerCase();

  // Check for meme-positive signals in title
  for (const signal of MEME_POSITIVE_SIGNALS) {
    if (titleLower.includes(signal.toLowerCase())) {
      score += 10;
    }
  }

  // Bonus for trusted/verified accounts
  const usernameLower = gif.username.toLowerCase();
  if (TRUSTED_USERNAMES.some((u) => usernameLower === u)) {
    score += 15;
  }

  // Bonus for well-animated content (many frames)
  const frames = gif.images.original.frames;
  if (frames !== undefined) {
    const frameCount = parseInt(frames, 10);
    if (!isNaN(frameCount) && frameCount > 20) {
      score += 5;
    }
  }

  // Bonus for larger files (more complex animations tend to be more interesting)
  const size = gif.images.original.size;
  if (size !== undefined) {
    const sizeBytes = parseInt(size, 10);
    if (!isNaN(sizeBytes) && sizeBytes > 500000) {
      // > 500KB
      score += 3;
    }
  }

  return score;
}

// =============================================================================
// Pipeline Functions
// =============================================================================

/**
 * Apply all hard filters to a batch of GIFs
 *
 * Returns only GIFs that pass ALL filters:
 * 1. Not static (has animation)
 * 2. Not from blacklisted source
 * 3. Not a quote tile
 * 4. Has reasonable aspect ratio
 *
 * @returns Array of GIFs that passed all filters
 */
export function filterGifs(gifs: GiphyGifObject[]): GiphyGifObject[] {
  return gifs
    .filter((gif) => !isStaticGif(gif))
    .filter((gif) => !hasBlacklistedSource(gif))
    .filter((gif) => !isQuoteTile(gif))
    .filter((gif) => !hasSuspiciousAspectRatio(gif));
}

/**
 * Select the best GIF from a batch
 *
 * 1. Apply all hard filters
 * 2. Score remaining candidates
 * 3. Return highest-scoring GIF
 *
 * @returns Best GIF or null if none pass filters
 */
export function selectBestGif(gifs: GiphyGifObject[]): GiphyGifObject | null {
  const filtered = filterGifs(gifs);

  if (filtered.length === 0) {
    return null;
  }

  // Sort by meme score descending, return best
  const sorted = filtered.sort((a, b) => getMemeScore(b) - getMemeScore(a));
  return sorted[0];
}

/**
 * Select a random GIF from the top candidates
 *
 * To avoid always returning the same "best" GIF for similar queries,
 * this picks randomly from the top N candidates (by score).
 *
 * @param gifs - Batch of GIFs from GIPHY
 * @param topN - Number of top candidates to choose from (default: 5)
 * @returns Random GIF from top candidates, or null if none pass
 */
export function selectRandomFromTop(
  gifs: GiphyGifObject[],
  topN: number = 5
): GiphyGifObject | null {
  const filtered = filterGifs(gifs);

  if (filtered.length === 0) {
    return null;
  }

  // Sort by meme score descending
  const sorted = filtered.sort((a, b) => getMemeScore(b) - getMemeScore(a));

  // Pick randomly from top N (or all if fewer than N)
  const candidates = sorted.slice(0, Math.min(topN, sorted.length));
  const randomIndex = Math.floor(Math.random() * candidates.length);

  return candidates[randomIndex];
}

