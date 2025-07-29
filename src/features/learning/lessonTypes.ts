// src/features/learning/lessonTypes.ts
export type LessonStep = {
  id: string;
  type: 'theory' | 'example' | 'interactive' | 'quiz';
  content: string;
  metadata?: {
    examples?: string[];
    correctAnswers?: string[];
    hints?: string[];
  };
};

export type Lesson = {
  id: string;
  title: string;
  description: string;
  category: 'form' | 'technique' | 'style';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  steps: LessonStep[];
  xpReward: number;
  prerequisites: string[]; // IDs of required lessons
  unlocked?: boolean;
  completed?: boolean;
};