import { supabase } from '../lib/supabase';

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all';

export type LeaderboardEntry = {
  user_id: string;
  display_name: string;
  xp: number;
  streak: number;
  rank: number;
};

type CacheEntry = { data: LeaderboardEntry[]; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000;

const cacheKey = (period: LeaderboardPeriod, friendsOnly: boolean, userId?: string) =>
  `${period}:${friendsOnly ? userId : 'global'}`;

export const fetchLeaderboard = async (
  period: LeaderboardPeriod = 'all',
  limit = 100,
): Promise<LeaderboardEntry[]> => {
  const key = cacheKey(period, false);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const { data, error } = await supabase.rpc('get_leaderboard', {
    p_period: period,
    p_limit: limit,
  });

  if (error) throw error;

  const entries = (data || []).map((row: any) => ({
    user_id: row.user_id,
    display_name: row.display_name,
    xp: row.xp,
    streak: row.streak,
    rank: Number(row.rank),
  }));

  cache.set(key, { data: entries, expiresAt: Date.now() + CACHE_TTL_MS });
  return entries;
};

export const fetchFriendsLeaderboard = async (
  userId: string,
  period: LeaderboardPeriod = 'all',
): Promise<LeaderboardEntry[]> => {
  const key = cacheKey(period, true, userId);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const { data: following } = await supabase
    .from('followers')
    .select('followee_id')
    .eq('follower_id', userId);

  const friendIds = new Set([userId, ...(following || []).map((f) => f.followee_id)]);
  const global = await fetchLeaderboard(period, 500);
  const friends = global
    .filter((entry) => friendIds.has(entry.user_id))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  cache.set(key, { data: friends, expiresAt: Date.now() + CACHE_TTL_MS });
  return friends;
};

export const fetchUserRank = async (
  userId: string,
  period: LeaderboardPeriod = 'all',
): Promise<{ rank: number; xp: number; totalUsers: number } | null> => {
  const { data, error } = await supabase.rpc('get_user_rank', {
    p_user_id: userId,
    p_period: period,
  });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const row = data[0];
  return {
    rank: Number(row.rank),
    xp: row.xp,
    totalUsers: Number(row.total_users),
  };
};
