export const STREAK_MILESTONES = [7, 30, 100] as const;

export const MILESTONE_BONUS_XP: Record<number, number> = {
  7: 50,
  30: 150,
  100: 500,
};

export const updateStreak = (
  currentStreak: number,
  lastActivityDate: string | null,
  today = new Date().toISOString().slice(0, 10),
) => {
  if (!lastActivityDate) {
    return { streak: 1, lastActivityDate: today, isNewDay: true };
  }

  if (lastActivityDate === today) {
    return { streak: currentStreak || 1, lastActivityDate: today, isNewDay: false };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (lastActivityDate === yesterdayStr) {
    return {
      streak: (currentStreak || 0) + 1,
      lastActivityDate: today,
      isNewDay: true,
    };
  }

  return { streak: 1, lastActivityDate: today, isNewDay: true, streakBroken: true };
};

export const getStreakMilestoneBonus = (
  streak: number,
  alreadyAwarded: number[] = [],
): { milestone: number; bonusXp: number } | null => {
  for (const milestone of STREAK_MILESTONES) {
    if (streak >= milestone && !alreadyAwarded.includes(milestone)) {
      return { milestone, bonusXp: MILESTONE_BONUS_XP[milestone] };
    }
  }
  return null;
};

export const streakLabel = (streak: number) => {
  if (streak >= 100) return 'Legendary';
  if (streak >= 30) return 'On fire';
  if (streak >= 7) return 'Consistent';
  if (streak >= 3) return 'Building';
  return 'Start today';
};
