import { supabase } from '../lib/supabase';

export type FriendProgress = {
  userId: string;
  displayName: string;
  lessonsCompleted: number;
  xp: number;
  streak: number;
  activeToday: boolean;
};

export type LessonSocialStats = {
  lessonId: string;
  friendsCompleted: number;
  totalCompleted: number;
};

export const fetchFriendsProgress = async (userId: string): Promise<FriendProgress[]> => {
  const { data: following } = await supabase
    .from('followers')
    .select('followee_id')
    .eq('follower_id', userId);

  const friendIds = (following || []).map((f) => f.followee_id);
  if (friendIds.length === 0) return [];

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: progressRows }, { data: authors }, { data: lessonCounts }] = await Promise.all([
    supabase.from('user_progress').select('user_id, xp, streak, last_activity_date').in('user_id', friendIds),
    supabase.from('authors').select('id, name').in('id', friendIds),
    supabase
      .from('user_lessons')
      .select('user_id')
      .in('user_id', friendIds)
      .eq('completed', true),
  ]);

  const nameMap = new Map((authors || []).map((a) => [a.id, a.name]));
  const lessonCountMap = new Map<string, number>();

  (lessonCounts || []).forEach((row) => {
    lessonCountMap.set(row.user_id, (lessonCountMap.get(row.user_id) || 0) + 1);
  });

  return (progressRows || []).map((row) => ({
    userId: row.user_id,
    displayName: nameMap.get(row.user_id) || 'Poet',
    lessonsCompleted: lessonCountMap.get(row.user_id) || 0,
    xp: row.xp || 0,
    streak: row.streak || 0,
    activeToday: row.last_activity_date === today,
  }));
};

export const fetchLessonSocialStats = async (
  lessonId: string,
  userId: string,
): Promise<LessonSocialStats> => {
  const { data: following } = await supabase
    .from('followers')
    .select('followee_id')
    .eq('follower_id', userId);

  const friendIds = (following || []).map((f) => f.followee_id);

  const [{ count: totalCompleted }, { count: friendsCompleted }] = await Promise.all([
    supabase
      .from('user_lessons')
      .select('*', { count: 'exact', head: true })
      .eq('lesson_id', lessonId)
      .eq('completed', true),
    friendIds.length > 0
      ? supabase
          .from('user_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('lesson_id', lessonId)
          .eq('completed', true)
          .in('user_id', friendIds)
      : Promise.resolve({ count: 0 }),
  ]);

  return {
    lessonId,
    friendsCompleted: friendsCompleted || 0,
    totalCompleted: totalCompleted || 0,
  };
};

export const fetchLessonComments = async (lessonId: string) => {
  const { data, error } = await supabase
    .from('lesson_comments')
    .select('id, content, created_at, user:authors(name)')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
};

export const postLessonComment = async (lessonId: string, userId: string, content: string) => {
  const { error } = await supabase.from('lesson_comments').insert([
    { lesson_id: lessonId, user_id: userId, content },
  ]);
  if (error) throw error;
};

export const getRecommendedLessons = async (userId: string) => {
  const friends = await fetchFriendsProgress(userId);
  if (friends.length === 0) return [];

  const topFriend = [...friends].sort((a, b) => b.lessonsCompleted - a.lessonsCompleted)[0];
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, description, xp_reward')
    .order('lesson_order')
    .limit(3);

  return (lessons || []).map((lesson) => ({
    ...lesson,
    reason: `${topFriend.displayName} is learning too`,
  }));
};
