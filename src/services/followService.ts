import { supabase } from '../lib/supabase';

export type FollowUser = {
  id: string;
  name: string;
  bio?: string;
};

export const isFollowing = async (followerId: string, followeeId: string) => {
  const { data } = await supabase
    .from('followers')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId)
    .maybeSingle();
  return !!data;
};

export const followUser = async (followerId: string, followeeId: string) => {
  const { error } = await supabase
    .from('followers')
    .insert([{ follower_id: followerId, followee_id: followeeId }]);
  if (error) throw error;
};

export const unfollowUser = async (followerId: string, followeeId: string) => {
  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', followerId)
    .eq('followee_id', followeeId);
  if (error) throw error;
};

export const toggleFollow = async (followerId: string, followeeId: string) => {
  const following = await isFollowing(followerId, followeeId);
  if (following) {
    await unfollowUser(followerId, followeeId);
    return false;
  }
  await followUser(followerId, followeeId);
  return true;
};

export const getFollowCounts = async (userId: string) => {
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from('followers').select('*', { count: 'exact', head: true }).eq('followee_id', userId),
    supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);
  return { followers: followers || 0, following: following || 0 };
};

const resolveAuthors = async (ids: string[]): Promise<FollowUser[]> => {
  if (!ids.length) return [];
  const { data } = await supabase.from('authors').select('id, name, bio').in('id', ids);
  const map = new Map((data || []).map((a) => [a.id, a]));
  return ids.map((id) => ({
    id,
    name: map.get(id)?.name || 'Poet',
    bio: map.get(id)?.bio,
  }));
};

export const getFollowers = async (userId: string): Promise<FollowUser[]> => {
  const { data } = await supabase.from('followers').select('follower_id').eq('followee_id', userId);
  return resolveAuthors((data || []).map((r) => r.follower_id));
};

export const getFollowing = async (userId: string): Promise<FollowUser[]> => {
  const { data } = await supabase.from('followers').select('followee_id').eq('follower_id', userId);
  return resolveAuthors((data || []).map((r) => r.followee_id));
};

export const getFollowingIds = async (userId: string): Promise<string[]> => {
  const { data } = await supabase
    .from('followers')
    .select('followee_id')
    .eq('follower_id', userId);
  return (data || []).map((r) => r.followee_id);
};

export const getFollowSuggestions = async (userId: string, limit = 10): Promise<FollowUser[]> => {
  const followingIds = await getFollowingIds(userId);
  const exclude = [...followingIds, userId];

  let authorQuery = supabase.from('authors').select('id, name, bio').limit(limit);
  if (exclude.length) authorQuery = authorQuery.not('id', 'in', `(${exclude.join(',')})`);
  const { data: authors } = await authorQuery;

  if (authors?.length) return authors as FollowUser[];

  const { data: popular } = await supabase
    .from('poems')
    .select('author:authors(id, name, bio)')
    .eq('visibility', 'public')
    .order('like_count', { ascending: false })
    .limit(20);

  const seen = new Set<string>(exclude);
  const suggestions: FollowUser[] = [];
  (popular || []).forEach((row: any) => {
    const author = row.author;
    if (author?.id && !seen.has(author.id)) {
      seen.add(author.id);
      suggestions.push({ id: author.id, name: author.name, bio: author.bio });
    }
  });
  return suggestions.slice(0, limit);
};
