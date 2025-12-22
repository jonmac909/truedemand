import axios from 'axios';

/**
 * Reddit API signal fetcher
 * Fetches discussions, pain points, and community signals for a given niche
 */

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  score: number;
  num_comments: number;
  created_utc: number;
  subreddit: string;
  url: string;
  permalink: string;
}

interface RedditComment {
  id: string;
  body: string;
  author: string;
  score: number;
  created_utc: number;
  permalink: string;
}

interface RedditSignal {
  posts: RedditPost[];
  comments: RedditComment[];
  fetched_at: string;
  query: string;
  total_posts: number;
  total_comments: number;
  subreddits: string[];
  platform: 'reddit';
  reproducible: boolean;
}

/**
 * Fetch Reddit signals for a given niche/keyword
 * Uses Reddit's public JSON API (no OAuth required for read-only)
 */
export async function fetchRedditSignals(
  niche: string,
  options: {
    maxPosts?: number;
    maxCommentsPerPost?: number;
    timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  } = {}
): Promise<RedditSignal> {
  const { maxPosts = 50, maxCommentsPerPost = 10, timeRange = 'month' } = options;

  try {
    // Search Reddit using public JSON API
    const searchUrl = `https://www.reddit.com/search.json`;
    const params = {
      q: niche,
      sort: 'relevance',
      t: timeRange,
      limit: maxPosts,
      raw_json: 1,
    };

    const response = await axios.get(searchUrl, {
      params,
      headers: {
        'User-Agent': 'TrueDemand/1.0 (Market Research Bot)',
      },
    });

    const posts: RedditPost[] = response.data.data.children
      .map((child: any) => ({
        id: child.data.id,
        title: child.data.title,
        selftext: child.data.selftext || '',
        author: child.data.author,
        score: child.data.score,
        num_comments: child.data.num_comments,
        created_utc: child.data.created_utc,
        subreddit: child.data.subreddit,
        url: child.data.url,
        permalink: `https://reddit.com${child.data.permalink}`,
      }))
      .filter((post: RedditPost) => post.selftext || post.num_comments > 0); // Only posts with content

    // Fetch top comments for each post (sample)
    const allComments: RedditComment[] = [];
    const postsToFetchComments = posts.slice(0, Math.min(5, posts.length)); // Only fetch comments for top 5 posts

    for (const post of postsToFetchComments) {
      try {
        const commentsUrl = `https://www.reddit.com${post.permalink.replace('https://reddit.com', '')}.json`;
        const commentsResponse = await axios.get(commentsUrl, {
          params: { limit: maxCommentsPerPost, raw_json: 1 },
          headers: {
            'User-Agent': 'TrueDemand/1.0 (Market Research Bot)',
          },
        });

        // Comments are in the second element of the response array
        if (commentsResponse.data && commentsResponse.data[1]) {
          const comments = commentsResponse.data[1].data.children
            .filter((c: any) => c.kind === 't1') // Only actual comments
            .map((child: any) => ({
              id: child.data.id,
              body: child.data.body || '',
              author: child.data.author,
              score: child.data.score,
              created_utc: child.data.created_utc,
              permalink: `https://reddit.com${child.data.permalink}`,
            }))
            .filter((c: RedditComment) => c.body && c.body.length > 20); // Only substantive comments

          allComments.push(...comments);
        }

        // Rate limiting: wait 1 second between requests
        await sleep(1000);
      } catch (error) {
        console.error(`Failed to fetch comments for post ${post.id}:`, error);
        // Continue with other posts
      }
    }

    // Extract unique subreddits
    const subreddits = Array.from(new Set(posts.map((p) => p.subreddit)));

    return {
      posts,
      comments: allComments,
      fetched_at: new Date().toISOString(),
      query: niche,
      total_posts: posts.length,
      total_comments: allComments.length,
      subreddits,
      platform: 'reddit',
      reproducible: true,
    };
  } catch (error: any) {
    console.error('Failed to fetch Reddit signals:', error);
    throw new Error(`Reddit API error: ${error.message}`);
  }
}

/**
 * Extract pain point indicators from Reddit content
 * Returns posts/comments that contain pain language
 */
export function extractPainIndicators(signal: RedditSignal): {
  painPosts: RedditPost[];
  painComments: RedditComment[];
  painKeywords: string[];
} {
  const painKeywords = [
    'frustrat',
    'annoying',
    'problem',
    'issue',
    'struggle',
    'difficult',
    'pain',
    'hate',
    'terrible',
    'awful',
    'need help',
    'looking for',
    'trying to find',
    'wish there was',
    'better way',
    'alternative',
  ];

  const containsPainLanguage = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return painKeywords.some((keyword) => lowerText.includes(keyword));
  };

  const painPosts = signal.posts.filter(
    (post) => containsPainLanguage(post.title) || containsPainLanguage(post.selftext)
  );

  const painComments = signal.comments.filter((comment) => containsPainLanguage(comment.body));

  return {
    painPosts,
    painComments,
    painKeywords,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
