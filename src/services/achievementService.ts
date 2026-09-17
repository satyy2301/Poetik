import { supabase } from '../lib/supabase';
import { Achievement, UserAchievement, UserStats } from '../types/achievement';
import { levelFromXp } from '../utils/xpCalculator';

const meetsCriteria = (achievement: Achievement, stats: UserStats) => {
  switch (achievement.criteria_type) {
    case 'lessons_completed':
      return stats.lessonsCompleted >= achievement.criteria_value;
    case 'streak':
      return stats.streak >= achievement.criteria_value;
    case 'xp':
      return stats.xp >= achievement.criteria_value;
    case 'level':
      return stats.level >= achievement.criteria_value;
    case 'quizzes_completed':
      return stats.quizzesCompleted >= achievement.criteria_value;
    case 'quiz_perfect':
      return stats.hasPerfectQuiz;
    case 'challenges_completed':
      return stats.challengesCompleted >= achievement.criteria_value;
    case 'all_lessons':
      return stats.totalLessons > 0 && stats.lessonsCompleted >= stats.totalLessons;
    default:
      return false;
  }
};

export const fetchUserStats = async (userId: string): Promise<UserStats> => {
  const [
    { data: progress },
    { count: lessonsCompleted },
    { count: totalLessons },
    { count: quizzesCompleted },
    { count: challengesCompleted },
    { data: quizResults },
  ] = await Promise.all([
    supabase.from('user_progress').select('xp, streak').eq('user_id', userId).maybeSingle(),
    supabase
      .from('user_lessons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true),
    supabase.from('lessons').select('*', { count: 'exact', head: true }),
    supabase
      .from('user_quiz_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('user_challenges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', true),
    supabase
      .from('user_quiz_results')
      .select('score, total_questions')
      .eq('user_id', userId)
      .limit(50),
  ]);

  const hasPerfectQuiz = (quizResults || []).some(
    (r) => r.total_questions > 0 && r.score === r.total_questions,
  );

  const xp = progress?.xp || 0;

  return {
    xp,
    level: levelFromXp(xp),
    streak: progress?.streak || 0,
    lessonsCompleted: lessonsCompleted || 0,
    totalLessons: totalLessons || 0,
    quizzesCompleted: quizzesCompleted || 0,
    challengesCompleted: challengesCompleted || 0,
    hasPerfectQuiz,
  };
};

export const fetchAllAchievements = async (): Promise<Achievement[]> => {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('criteria_value');

  if (error) throw error;
  return (data || []) as Achievement[];
};

export const fetchUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('earned_at, achievement:achievements(*)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    ...row.achievement,
    earned_at: row.earned_at,
  })) as UserAchievement[];
};

export const checkAndAwardAchievements = async (
  userId: string,
): Promise<Achievement[]> => {
  const [allAchievements, earned, stats] = await Promise.all([
    fetchAllAchievements(),
    fetchUserAchievements(userId),
    fetchUserStats(userId),
  ]);

  const earnedIds = new Set(earned.map((a) => a.id));
  const newlyEarned: Achievement[] = [];

  for (const achievement of allAchievements) {
    if (earnedIds.has(achievement.id)) continue;
    if (!meetsCriteria(achievement, stats)) continue;

    const { error } = await supabase.from('user_achievements').insert([
      { user_id: userId, achievement_id: achievement.id },
    ]);

    if (!error) {
      newlyEarned.push(achievement);
      if (achievement.xp_reward > 0) {
        await supabase.rpc('increment_xp', {
          p_user_id: userId,
          xp_amount: achievement.xp_reward,
        });
      }
    }
  }

  return newlyEarned;
};
