import { getStreakMilestoneBonus, streakLabel, updateStreak } from '../../src/utils/streakCalculator';

describe('streakCalculator', () => {
  it('starts streak on first activity', () => {
    const result = updateStreak(0, null, '2026-09-17');
    expect(result.streak).toBe(1);
    expect(result.isNewDay).toBe(true);
  });

  it('does not increment on same day', () => {
    const result = updateStreak(5, '2026-09-17', '2026-09-17');
    expect(result.streak).toBe(5);
    expect(result.isNewDay).toBe(false);
  });

  it('increments on consecutive days', () => {
    const result = updateStreak(3, '2026-09-16', '2026-09-17');
    expect(result.streak).toBe(4);
  });

  it('resets after gap', () => {
    const result = updateStreak(10, '2026-09-10', '2026-09-17');
    expect(result.streak).toBe(1);
    expect(result.streakBroken).toBe(true);
  });

  it('awards milestone bonus once', () => {
    const bonus = getStreakMilestoneBonus(7, []);
    expect(bonus).toEqual({ milestone: 7, bonusXp: 50 });
    expect(getStreakMilestoneBonus(7, [7])).toBeNull();
  });

  it('labels streak tiers', () => {
    expect(streakLabel(1)).toBe('Start today');
    expect(streakLabel(7)).toBe('Consistent');
    expect(streakLabel(100)).toBe('Legendary');
  });
});
