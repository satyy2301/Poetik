export const XP_PER_LEVEL = 100;

export const levelFromXp = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;

export const xpInCurrentLevel = (xp: number) => xp % XP_PER_LEVEL;

export const levelProgress = (xp: number) => xpInCurrentLevel(xp) / XP_PER_LEVEL;

export const quizXpReward = (score: number, total: number, baseXp = 30) => {
  if (total <= 0) return 0;
  return Math.max(5, Math.round(baseXp * (score / total)));
};

export const challengeXpReward = (baseReward = 50) => baseReward;

export const lessonXpReward = (baseReward = 25) => baseReward;

export { updateStreak } from './streakCalculator';
