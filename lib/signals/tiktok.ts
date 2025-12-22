import axios from 'axios';

/**
 * TikTok signal fetcher via Apify
 * Fetches TikTok content signals for trend and audience analysis
 */

interface TikTokVideo {
  id: string;
  text: string; // Caption
  authorMeta: {
    name: string;
    verified: boolean;
    signature: string;
  };
  musicMeta?: {
    musicName: string;
    musicAuthor: string;
  };
  hashtags: string[];
  videoMeta: {
    duration: number;
    coverUrl?: string;
  };
  diggCount: number; // Likes
  shareCount: number;
  playCount: number;
  commentCount: number;
  createTime: number; // Unix timestamp
  webVideoUrl: string;
}

interface TikTokSignal {
  videos: TikTokVideo[];
  fetched_at: string;
  query: string;
  total_videos: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  total_comments: number;
  top_hashtags: Array<{ tag: string; count: number }>;
  platform: 'tiktok';
  reproducible: boolean;
}

/**
 * Fetch TikTok signals using Apify TikTok Scraper actor
 * Apify Actor: https://apify.com/clockworks/tiktok-scraper
 */
export async function fetchTikTokSignals(
  keyword: string,
  options: {
    maxVideos?: number;
  } = {}
): Promise<TikTokSignal> {
  const { maxVideos = 30 } = options;
  const apiKey = process.env.APIFY_API_KEY;

  if (!apiKey) {
    console.warn('APIFY_API_KEY not configured, returning insufficient data for TikTok');
    return {
      videos: [],
      fetched_at: new Date().toISOString(),
      query: keyword,
      total_videos: 0,
      total_views: 0,
      total_likes: 0,
      total_shares: 0,
      total_comments: 0,
      top_hashtags: [],
      platform: 'tiktok',
      reproducible: false, // Cannot reproduce without API key
    };
  }

  try {
    // Start Apify actor run
    const actorId = 'clockworks/tiktok-scraper';
    const runInput = {
      hashtags: [keyword],
      resultsPerPage: maxVideos,
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
      shouldDownloadSubtitles: false,
    };

    // Start the actor
    const runResponse = await axios.post(
      `https://api.apify.com/v2/acts/${actorId}/runs`,
      runInput,
      {
        params: { token: apiKey },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const runId = runResponse.data.data.id;

    // Wait for the run to complete (poll status)
    let runStatus = 'RUNNING';
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max (5 second intervals)

    while (runStatus === 'RUNNING' && attempts < maxAttempts) {
      await sleep(5000); // Wait 5 seconds

      const statusResponse = await axios.get(
        `https://api.apify.com/v2/acts/${actorId}/runs/${runId}`,
        { params: { token: apiKey } }
      );

      runStatus = statusResponse.data.data.status;
      attempts++;
    }

    if (runStatus !== 'SUCCEEDED') {
      throw new Error(`Apify run failed with status: ${runStatus}`);
    }

    // Fetch results
    const resultsResponse = await axios.get(
      `https://api.apify.com/v2/acts/${actorId}/runs/${runId}/dataset/items`,
      {
        params: {
          token: apiKey,
          format: 'json',
        },
      }
    );

    const videos: TikTokVideo[] = resultsResponse.data.map((item: any) => ({
      id: item.id,
      text: item.text || '',
      authorMeta: {
        name: item.authorMeta?.name || 'unknown',
        verified: item.authorMeta?.verified || false,
        signature: item.authorMeta?.signature || '',
      },
      musicMeta: item.musicMeta
        ? {
            musicName: item.musicMeta.musicName || '',
            musicAuthor: item.musicMeta.musicAuthor || '',
          }
        : undefined,
      hashtags: item.hashtags || [],
      videoMeta: {
        duration: item.videoMeta?.duration || 0,
        coverUrl: item.videoMeta?.coverUrl,
      },
      diggCount: item.diggCount || 0,
      shareCount: item.shareCount || 0,
      playCount: item.playCount || 0,
      commentCount: item.commentCount || 0,
      createTime: item.createTime || 0,
      webVideoUrl: item.webVideoUrl || '',
    }));

    // Calculate aggregates
    const totalViews = videos.reduce((sum, v) => sum + v.playCount, 0);
    const totalLikes = videos.reduce((sum, v) => sum + v.diggCount, 0);
    const totalShares = videos.reduce((sum, v) => sum + v.shareCount, 0);
    const totalComments = videos.reduce((sum, v) => sum + v.commentCount, 0);

    // Extract top hashtags
    const hashtagCounts = new Map<string, number>();
    videos.forEach((video) => {
      video.hashtags.forEach((tag) => {
        hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
      });
    });

    const topHashtags = Array.from(hashtagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      videos,
      fetched_at: new Date().toISOString(),
      query: keyword,
      total_videos: videos.length,
      total_views: totalViews,
      total_likes: totalLikes,
      total_shares: totalShares,
      total_comments: totalComments,
      top_hashtags: topHashtags,
      platform: 'tiktok',
      reproducible: true,
    };
  } catch (error: any) {
    console.error('Failed to fetch TikTok signals via Apify:', error);

    // Return "insufficient data" structure instead of throwing
    return {
      videos: [],
      fetched_at: new Date().toISOString(),
      query: keyword,
      total_videos: 0,
      total_views: 0,
      total_likes: 0,
      total_shares: 0,
      total_comments: 0,
      top_hashtags: [],
      platform: 'tiktok',
      reproducible: false,
    };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
