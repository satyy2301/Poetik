import {
  XP_PER_LEVEL,
  levelFromXp,
  xpInCurrentLevel,
  levelProgress,
  quizXpReward,
  challengeXpReward,
  lessonXpReward,
} from '../../src/utils/xpCalculator';

describe('xpCalculator', () => {
  it('computes level from XP', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(250)).toBe(3);
  });

  it('computes XP within current level', () => {
    expect(xpInCurrentLevel(0)).toBe(0);
    expect(xpInCurrentLevel(150)).toBe(50);
    expect(XP_PER_LEVEL).toBe(100);
  });

  it('computes level progress ratio', () => {
    expect(levelProgress(50)).toBe(0.5);
    expect(levelProgress(0)).toBe(0);
  });

  it('awards quiz XP proportional to score', () => {
    expect(quizXpReward(0, 10)).toBe(5);
    expect(quizXpReward(5, 10)).toBe(15);
    expect(quizXpReward(10, 10)).toBe(30);
    expect(quizXpReward(1, 0)).toBe(0);
  });

  it('returns base rewards for challenges and lessons', () => {
    expect(challengeXpReward()).toBe(50);
    expect(lessonXpReward()).toBe(25);
  });
});
