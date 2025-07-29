// src/features/learning/learningPaths.ts
import { Lesson } from './lessonTypes';
import haikuLesson from '../../data/lessons/haikuLesson';
import sonnetLesson from '../../data/lessons/sonnetLesson';
import metaphorLesson from '../../data/lessons/metaphorLesson';

export const learningPaths = {
  beginner: [
    {
      title: 'Form Fundamentals',
      description: 'Master basic poetic structures',
      lessons: [haikuLesson, sonnetLesson],
      icon: '📝',
    },
    {
      title: 'Technique Toolkit',
      description: 'Essential poetic devices',
      lessons: [metaphorLesson],
      icon: '🛠️',
    }
  ],
  intermediate: [
    // More advanced paths...
  ]
};

export const getRecommendedPath = (userProgress: any) => {
  // AI-powered recommendation logic
  if (!userProgress.completedLessons?.length) {
    return learningPaths.beginner[0];
  }
  // More sophisticated logic would go here...
};