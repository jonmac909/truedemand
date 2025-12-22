// @ts-ignore - google-trends-api has no type definitions
import googleTrends from 'google-trends-api';

/**
 * Google Trends signal fetcher
 * Fetches search trend data for 12-month and 5-year periods
 */

interface TrendsDataPoint {
  time: string;
  value: number;
  formattedTime: string;
  formattedValue: string;
}

interface TrendsSignal {
  keyword: string;
  twelveMonth: {
    data: TrendsDataPoint[];
    averageInterest: number;
    peakInterest: number;
    trend: 'rising' | 'declining' | 'stable';
    growthRate: number; // percentage
  };
  fiveYear: {
    data: TrendsDataPoint[];
    averageInterest: number;
    peakInterest: number;
    trend: 'rising' | 'declining' | 'stable';
    longTermGrowth: number; // percentage
  } | null;
  relatedQueries: {
    top: Array<{ query: string; value: number }>;
    rising: Array<{ query: string; value: number }>;
  };
  fetched_at: string;
  query: string;
  platform: 'google_trends';
  reproducible: boolean;
  geo: string;
}

/**
 * Fetch Google Trends signals for a given keyword
 */
export async function fetchTrendsSignals(
  keyword: string,
  options: {
    geo?: string;
  } = {}
): Promise<TrendsSignal> {
  const { geo = 'US' } = options;

  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const fiveYearsAgo = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);

    // Fetch 12-month data
    const twelveMonthResults = await googleTrends.interestOverTime({
      keyword,
      startTime: twelveMonthsAgo,
      endTime: now,
      geo,
    });

    const twelveMonthData = parseInterestOverTime(twelveMonthResults);
    const twelveMonthAnalysis = analyzeTrend(twelveMonthData);

    // Fetch 5-year data (may not be available for all keywords)
    let fiveYearAnalysis: TrendsSignal['fiveYear'] = null;
    try {
      const fiveYearResults = await googleTrends.interestOverTime({
        keyword,
        startTime: fiveYearsAgo,
        endTime: now,
        geo,
      });

      const fiveYearData = parseInterestOverTime(fiveYearResults);
      fiveYearAnalysis = analyzeTrend(fiveYearData);
    } catch (error) {
      console.log('5-year data not available for this keyword');
      // This is acceptable - not all keywords have 5-year data
    }

    // Fetch related queries
    const relatedQueriesResults = await googleTrends.relatedQueries({
      keyword,
      startTime: twelveMonthsAgo,
      endTime: now,
      geo,
    });

    const relatedQueries = parseRelatedQueries(relatedQueriesResults);

    return {
      keyword,
      twelveMonth: twelveMonthAnalysis,
      fiveYear: fiveYearAnalysis,
      relatedQueries,
      fetched_at: new Date().toISOString(),
      query: keyword,
      platform: 'google_trends',
      reproducible: true,
      geo,
    };
  } catch (error: any) {
    console.error('Failed to fetch Google Trends signals:', error);

    // Return "insufficient data" structure instead of throwing
    return {
      keyword,
      twelveMonth: {
        data: [],
        averageInterest: 0,
        peakInterest: 0,
        trend: 'stable',
        growthRate: 0,
      },
      fiveYear: null,
      relatedQueries: {
        top: [],
        rising: [],
      },
      fetched_at: new Date().toISOString(),
      query: keyword,
      platform: 'google_trends',
      reproducible: true,
      geo: options.geo || 'US',
    };
  }
}

/**
 * Parse interest over time data from Google Trends API response
 */
function parseInterestOverTime(jsonString: string): TrendsDataPoint[] {
  try {
    const data = JSON.parse(jsonString);
    const timeline = data.default.timelineData || [];

    return timeline.map((point: any) => ({
      time: point.time,
      value: point.value[0] || 0,
      formattedTime: point.formattedTime,
      formattedValue: point.formattedValue?.[0] || '0',
    }));
  } catch (error) {
    console.error('Failed to parse interest over time data:', error);
    return [];
  }
}

/**
 * Analyze trend direction and growth
 */
function analyzeTrend(data: TrendsDataPoint[]): {
  data: TrendsDataPoint[];
  averageInterest: number;
  peakInterest: number;
  trend: 'rising' | 'declining' | 'stable';
  growthRate: number;
} {
  if (data.length === 0) {
    return {
      data: [],
      averageInterest: 0,
      peakInterest: 0,
      trend: 'stable',
      growthRate: 0,
    };
  }

  const values = data.map((d) => d.value);
  const averageInterest = values.reduce((a, b) => a + b, 0) / values.length;
  const peakInterest = Math.max(...values);

  // Calculate growth rate: compare recent average vs older average
  const midPoint = Math.floor(data.length / 2);
  const recentValues = values.slice(midPoint);
  const olderValues = values.slice(0, midPoint);

  const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
  const olderAvg = olderValues.reduce((a, b) => a + b, 0) / olderValues.length;

  const growthRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

  let trend: 'rising' | 'declining' | 'stable' = 'stable';
  if (growthRate > 10) trend = 'rising';
  else if (growthRate < -10) trend = 'declining';

  return {
    data,
    averageInterest: Math.round(averageInterest),
    peakInterest,
    trend,
    growthRate: Math.round(growthRate * 10) / 10, // Round to 1 decimal
  };
}

/**
 * Parse related queries from Google Trends API response
 */
function parseRelatedQueries(jsonString: string): {
  top: Array<{ query: string; value: number }>;
  rising: Array<{ query: string; value: number }>;
} {
  try {
    const data = JSON.parse(jsonString);
    const defaultData = data.default || {};

    const top = (defaultData.rankedList?.[0]?.rankedKeyword || []).map((item: any) => ({
      query: item.query,
      value: item.value,
    }));

    const rising = (defaultData.rankedList?.[1]?.rankedKeyword || []).map((item: any) => ({
      query: item.query,
      value: item.value === 'Breakout' ? 1000 : parseInt(item.value) || 0,
    }));

    return {
      top: top.slice(0, 10), // Top 10
      rising: rising.slice(0, 10), // Top 10 rising
    };
  } catch (error) {
    console.error('Failed to parse related queries:', error);
    return {
      top: [],
      rising: [],
    };
  }
}
