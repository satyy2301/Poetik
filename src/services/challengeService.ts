import { supabase } from '../lib/supabase';
import { updateStreak } from '../utils/xpCalculator';

export type DailyChallenge = {
  id: string;
  date: string;
  task: string;
  xp_reward: number;
  lesson_id?: string | null;
};

export const getTodaysChallenge = async (): Promise<DailyChallenge | null> => {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('daily_challenges')
    .select('*')
    .eq('date', today)
    .maybeSingle();

  if (error) throw error;
  if (data) return data as DailyChallenge;

  const { data: latest } = await supabase
    .from('daily_challenges')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (latest as DailyChallenge) || null;
};

export const hasCompletedChallenge = async (userId: string, challengeId: string) => {
  const { data } = await supabase
    .from('user_challenges')
    .select('user_id')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .maybeSingle();

  return !!data;
};

export const submitChallenge = async (
  userId: string,
  challenge: DailyChallenge,
  submission: string,
) => {
  const alreadyDone = await hasCompletedChallenge(userId, challenge.id);
  if (alreadyDone) {
    throw new Error('Challenge already completed today');
  }

  const xpEarned = challenge.xp_reward || 50;

  const { error } = await supabase.from('user_challenges').insert([
    {
      user_id: userId,
      challenge_id: challenge.id,
      submission,
      completed: true,
      xp_earned: xpEarned,
    },
  ]);

  if (error) throw error;

  const { data: progress } = await supabase
    .from('user_progress')
    .select('streak, last_activity_date')
    .eq('user_id', userId)
    .maybeSingle();

  const streakUpdate = updateStreak(
    progress?.streak || 0,
    progress?.last_activity_date || null,
  );

  await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      streak: streakUpdate.streak,
      last_activity_date: streakUpdate.lastActivityDate,
    },
    { onConflict: 'user_id' },
  );

  return { xpEarned, streak: streakUpdate.streak };
};
