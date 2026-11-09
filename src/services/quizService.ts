import { supabase } from '../lib/supabase';
import { Quiz, QuizQuestion } from '../types/lesson';
import { quizXpReward } from '../utils/xpCalculator';

const lessonFields = (row: any) => {
  const lesson = Array.isArray(row.lessons) ? row.lessons[0] : row.lessons;
  return {
    title: lesson?.title || 'Poetry Quiz',
    lessonType: lesson?.type as string | undefined,
    lessonOrder: typeof lesson?.lesson_order === 'number' ? lesson.lesson_order : 0,
  };
};

export const fetchQuizzes = async (): Promise<Quiz[]> => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, lesson_id, questions, created_at, lessons(title, type, lesson_order)');

  if (error) throw error;

  return (data || [])
    .map((row: any) => ({
      id: row.id,
      lesson_id: row.lesson_id,
      ...lessonFields(row),
      questions: row.questions as QuizQuestion[],
      created_at: row.created_at,
    }))
    .sort((a, b) => (a.lessonOrder ?? 0) - (b.lessonOrder ?? 0));
};

export const fetchBestQuizScores = async (
  userId: string,
): Promise<Record<string, { score: number; total: number }>> => {
  const { data, error } = await supabase
    .from('user_quiz_results')
    .select('quiz_id, score, total_questions')
    .eq('user_id', userId);

  if (error) throw error;

  const best: Record<string, { score: number; total: number }> = {};
  for (const row of data || []) {
    const current = best[row.quiz_id];
    if (!current || row.score > current.score) {
      best[row.quiz_id] = { score: row.score, total: row.total_questions };
    }
  }
  return best;
};

export const getQuizById = async (quizId: string): Promise<Quiz | null> => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, lesson_id, questions, created_at, lessons(title)')
    .eq('id', quizId)
    .single();

  if (error) return null;

  const row = data as any;
  return {
    id: row.id,
    lesson_id: row.lesson_id,
    ...lessonFields(row),
    questions: row.questions as QuizQuestion[],
    created_at: row.created_at,
  };
};

export const submitQuizResult = async (
  userId: string,
  quizId: string,
  answers: number[],
  questions: QuizQuestion[],
) => {
  let score = 0;
  questions.forEach((q, index) => {
    if (answers[index] === q.answerIndex) score += 1;
  });

  const xpEarned = quizXpReward(score, questions.length);

  const { error } = await supabase.from('user_quiz_results').insert([
    {
      user_id: userId,
      quiz_id: quizId,
      score,
      total_questions: questions.length,
      answers,
      xp_earned: xpEarned,
    },
  ]);

  if (error) throw error;

  return { score, total: questions.length, xpEarned };
};

export const getUserQuizAttempts = async (userId: string, quizId: string) => {
  const { data, error } = await supabase
    .from('user_quiz_results')
    .select('*')
    .eq('user_id', userId)
    .eq('quiz_id', quizId)
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return data || [];
};
