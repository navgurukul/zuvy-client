export type SupportedCompetitivePlatform = 'LeetCode' | 'CodeChef' | 'Codeforces';

export interface CompetitiveProfileStats {
  rank?: string | number;
  rating?: number;
  problemsSolved?: number;
}

// Client helper: call our own API route to avoid browser CORS issues.
const API_BASE = '/api/competitive-profile';

const PLATFORM_ENDPOINTS: Record<SupportedCompetitivePlatform, string> = {
  LeetCode: 'leetcode',
  CodeChef: 'codechef',
  Codeforces: 'codeforces',
};

export const isSupportedCompetitivePlatform = (
  platform: string
): platform is SupportedCompetitivePlatform => Object.prototype.hasOwnProperty.call(PLATFORM_ENDPOINTS, platform);

const normalizeRank = (value: unknown): string | number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) return value.trim();
  return undefined;
};

const normalizeNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').trim();
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

export const fetchCompetitiveProfileStats = async (
  platform: SupportedCompetitivePlatform,
  username: string
): Promise<CompetitiveProfileStats> => {
  const trimmedUsername = username.trim();
  if (!trimmedUsername) {
    return {};
  }

  const endpoint = PLATFORM_ENDPOINTS[platform];
  const response = await fetch(`${API_BASE}/${endpoint}/${encodeURIComponent(trimmedUsername)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${platform} profile`);
  }

  const data = await response.json();

  if (platform === 'LeetCode') {
    return {
      rank: normalizeRank(data.rank),
      problemsSolved: normalizeNumber(data.problemsSolved),
      rating: normalizeNumber(data.rating),
    };
  }

  if (platform === 'CodeChef') {
    return {
      rank: normalizeRank(data.globalRank),
      rating: normalizeNumber(data.rating),
      problemsSolved: normalizeNumber(data.problemsSolved),
    };
  }

  return {
    rank: normalizeRank(data.rank),
    rating: normalizeNumber(data.rating),
  };
};
