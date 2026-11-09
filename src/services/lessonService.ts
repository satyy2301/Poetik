import { supabase } from '../lib/supabase';
import { Lesson } from '../types/lesson';
import { withTrackLocks } from './lessonLocks';

export { withTrackLocks };

export const fetchLessonsWithProgress = async (userId?: string): Promise<Lesson[]> => {
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('*')
    .order('lesson_order');

  if (error) throw error;

  let completedIds: string[] = [];
  if (userId) {
    const { data: userLessons } = await supabase
      .from('user_lessons')
      .select('lesson_id, completed')
      .eq('user_id', userId)
      .eq('completed', true);

    completedIds = (userLessons || []).map((row) => row.lesson_id);
  }

  return withTrackLocks((lessons || []) as Lesson[], completedIds);
};

export const completeLesson = async (
  userId: string,
  lessonId: string,
  xpReward: number,
) => {
  const { error: lessonError } = await supabase.from('user_lessons').upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,lesson_id' },
  );

  if (lessonError) throw lessonError;

  const { data: progress } = await supabase
    .from('user_progress')
    .select('completed_lessons')
    .eq('user_id', userId)
    .maybeSingle();

  const completedLessons = progress?.completed_lessons || [];
  const updatedLessons = completedLessons.includes(lessonId)
    ? completedLessons
    : [...completedLessons, lessonId];

  const { error: progressError } = await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      completed_lessons: updatedLessons,
    },
    { onConflict: 'user_id' },
  );

  if (progressError) throw progressError;

  return { xpEarned: xpReward };
};

export const getLessonById = async (lessonId: string) => {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (error) throw error;
  return data as Lesson;
};
