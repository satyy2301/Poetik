import { supabase } from '../lib/supabase';
import { resolveAuthorAccountId } from './authorService';

export type FollowUser = {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
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

export const isFollowingAuthor = async (followerId: string, authorId: string) => {
  const accountId = await resolveAuthorAccountId(authorId);
  if (!accountId) return false;
  return isFollowing(followerId, accountId);
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

export const toggleFollowAuthor = async (followerId: string, authorId: string) => {
  const accountId = await resolveAuthorAccountId(authorId);
  if (!accountId) throw new Error('Cannot follow this author');
  return toggleFollow(followerId, accountId);
};

export const getFollowCounts = async (userId: string) => {
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from('followers').select('*', { count: 'exact', head: true }).eq('followee_id', userId),
    supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);
  return { followers: followers || 0, following: following || 0 };
};

const resolveAuthors = async (accountIds: string[]): Promise<FollowUser[]> => {
  if (!accountIds.length) return [];
  const { data } = await supabase
    .from('authors')
    .select('id, user_id, name, bio, avatar_url')
    .or(`id.in.(${accountIds.join(',')}),user_id.in.(${accountIds.join(',')})`);

  const map = new Map<string, { name: string; bio?: string; avatar_url?: string }>();
  (data || []).forEach((a) => {
    const entry = { name: a.name, bio: a.bio, avatar_url: a.avatar_url };
    map.set(a.id, entry);
    if (a.user_id) map.set(a.user_id, entry);
  });

  return accountIds.map((id) => ({
    id,
    name: map.get(id)?.name || 'Poet',
    bio: map.get(id)?.bio,
    avatar_url: map.get(id)?.avatar_url,
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

  let authorQuery = supabase
    .from('authors')
    .select('id, user_id, name, bio, avatar_url')
    .not('canonical', 'eq', true)
    .limit(limit);
  if (exclude.length) {
    authorQuery = authorQuery.not('user_id', 'in', `(${exclude.join(',')})`);
  }
  const { data: authors } = await authorQuery;

  if (authors?.length) {
    return authors.map((a) => ({
      id: a.user_id || a.id,
      name: a.name,
      bio: a.bio,
      avatar_url: a.avatar_url,
    }));
  }

  const { data: popular } = await supabase
    .from('poems')
    .select('author:authors(id, user_id, name, bio, avatar_url)')
    .eq('visibility', 'public')
    .order('like_count', { ascending: false })
    .limit(20);

  const seen = new Set<string>(exclude);
  const suggestions: FollowUser[] = [];
  (popular || []).forEach((row: any) => {
    const author = row.author;
    const accountId = author?.user_id || author?.id;
    if (accountId && !seen.has(accountId)) {
      seen.add(accountId);
      suggestions.push({
        id: accountId,
        name: author.name,
        bio: author.bio,
        avatar_url: author.avatar_url,
      });
    }
  });
  return suggestions.slice(0, limit);
};
