// src/data/lessons/haikuLesson.ts
import { Lesson } from '../features/learning/lessonTypes';

const haikuLesson: Lesson = {
  id: 'haiku-basics',
  title: 'Haiku Fundamentals',
  description: 'Learn the 5-7-5 structure of traditional Japanese haiku',
  category: 'form',
  difficulty: 'beginner',
  xpReward: 50,
  prerequisites: [],
  steps: [
    {
      id: 'haiku-intro',
      type: 'theory',
      content: 'A haiku is a short form of Japanese poetry consisting of three lines with a 5-7-5 syllable structure. Traditionally, haiku often focus on nature and the changing seasons.'
    },
    {
      id: 'haiku-example',
      type: 'example',
      content: 'Here are some classic examples of haiku:',
      metadata: {
        examples: [
          "An old silent pond...\nA frog jumps into the pond—\nSplash! Silence again.\n- Matsuo Bashō",
          "Lightning flash—\nwhat I thought were faces\nare plumes of pampas grass.\n- Yosa Buson"
        ]
      }
    },
    {
      id: 'haiku-structure',
      type: 'theory',
      content: 'The syllable pattern is crucial:\n\n- First line: 5 syllables\n- Second line: 7 syllables\n- Third line: 5 syllables\n\nCount carefully!'
    },
    {
      id: 'haiku-practice',
      type: 'interactive',
      content: 'Try writing your own haiku about nature. Remember the 5-7-5 structure!',
      metadata: {
        hints: [
          "Focus on a single moment in nature",
          "Use simple, concrete language",
          "Avoid rhymes - traditional haiku don't rhyme"
        ]
      }
    },
    {
      id: 'haiku-quiz',
      type: 'quiz',
      content: 'Which of these follows proper haiku structure?',
      metadata: {
        correctAnswers: [
          "The autumn moonlight\nsilently pierces the clouds\nwith shafts of pale light"
        ]
      }
    }
  ]
};

export default haikuLesson;