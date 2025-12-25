export interface VideoDetails {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle?: string;
  views?: string;
}

export async function getVideoDetails(videoId: string): Promise<VideoDetails> {
  try {
    // For now, return mock data. To use real YouTube API:
    // 1. Get API key from https://console.cloud.google.com/
    // 2. Enable YouTube Data API v3
    // 3. Add NEXT_PUBLIC_YOUTUBE_API_KEY to .env.local
    
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    
    if (apiKey) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items[0]) {
          const video = data.items[0].snippet;
          return {
            id: videoId,
            title: video.title,
            thumbnail: video.thumbnails.maxres?.url || video.thumbnails.high.url,
            channelTitle: video.channelTitle,
          };
        }
      }
    }
    
    // Fallback to placeholder
    return {
      id: videoId,
      title: "Video Title - Add YOUTUBE_API_KEY to .env.local",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch (error) {
    console.error("Error fetching video details:", error);
    return {
      id: videoId,
      title: "Video Title",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  }
}
