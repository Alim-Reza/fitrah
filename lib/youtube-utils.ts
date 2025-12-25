/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    // Remove whitespace
    url = url.trim();

    // Pattern 1: youtu.be/VIDEO_ID
    const youtuBePattern = /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/;
    const youtuBeMatch = url.match(youtuBePattern);
    if (youtuBeMatch) {
      return youtuBeMatch[1];
    }

    // Pattern 2: youtube.com/watch?v=VIDEO_ID
    const watchPattern = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/;
    const watchMatch = url.match(watchPattern);
    if (watchMatch) {
      return watchMatch[1];
    }

    // Pattern 3: youtube.com/shorts/VIDEO_ID
    const shortsPattern = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/;
    const shortsMatch = url.match(shortsPattern);
    if (shortsMatch) {
      return shortsMatch[1];
    }

    // Pattern 4: youtube.com/embed/VIDEO_ID
    const embedPattern = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/;
    const embedMatch = url.match(embedPattern);
    if (embedMatch) {
      return embedMatch[1];
    }

    // If just the ID is provided (11 characters)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    return null;
  } catch (error) {
    console.error('Error extracting YouTube video ID:', error);
    return null;
  }
}

/**
 * Validate if string is a valid YouTube video ID
 */
export function isValidYouTubeId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}
