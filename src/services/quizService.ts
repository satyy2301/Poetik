import { supabase } from '../lib/supabase';
import { Quiz, QuizQuestion } from '../types/lesson';
import { quizXpReward } from '../utils/xpCalculator';

export const fetchQuizzes = async (): Promise<Quiz[]> => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, lesson_id, questions, created_at, lessons(title)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    lesson_id: row.lesson_id,
    title: row.lessons?.title || 'Poetry Quiz',
    questions: row.questions as QuizQuestion[],
    created_at: row.created_at,
  }));
};

export const getQuizById = async (quizId: string): Promise<Quiz | null> => {
  const { data, error } = await supabase
    .from('quizzes')
    .select('id, lesson_id, questions, created_at, lessons(title)')
    .eq('id', quizId)
    .single();

  if (error) return null;

  return {
    id: data.id,
    lesson_id: data.lesson_id,
    title: data.lessons?.title || 'Poetry Quiz',
    questions: data.questions as QuizQuestion[],
    created_at: data.created_at,
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
