// src/features/learning/learningPaths.ts
import haikuLesson from '../../data/lessons/haikuLesson';

export const learningPaths = {
  beginner: [
    {
      title: 'Form Fundamentals',
      description: 'Master basic poetic structures',
      lessons: [haikuLesson],
      icon: '📝',
    },
    {
      title: 'Technique Toolkit',
      description: 'Essential poetic devices',
      lessons: [haikuLesson],
      icon: '🛠️',
    },
  ],
  intermediate: [],
};

export const getRecommendedPath = (userProgress: { completedLessons?: string[] }) => {
  if (!userProgress.completedLessons?.length) {
    return learningPaths.beginner[0];
  }
  return learningPaths.beginner[0];
};
