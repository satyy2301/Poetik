export type LessonStepType = 'theory' | 'example' | 'exercise' | 'interactive' | 'quiz';

export type LessonStepData = {
  type: LessonStepType;
  title?: string;
  content?: string;
  examples?: string[];
  instructions?: string;
  requiresResponse?: boolean;
  question?: string;
  options?: string[];
  answerIndex?: number;
};

export type Lesson = {
  id: string;
  title: string;
  description?: string;
  type: string;
  difficulty?: number;
  steps: LessonStepData[];
  xp_reward?: number;
  lesson_order: number;
  prerequisite_lesson_id?: string | null;
  completed?: boolean;
  locked?: boolean;
  progress?: number;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answerIndex: number;
  type?: 'mcq' | 'true_false' | 'fill_in';
  correctAnswer?: string;
};

export type Quiz = {
  id: string;
  lesson_id?: string | null;
  title?: string;
  questions: QuizQuestion[];
  created_at?: string;
};
