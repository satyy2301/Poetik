import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';
import { levelFromXp, levelProgress } from '../utils/xpCalculator';
import { updateStreak, getStreakMilestoneBonus } from '../utils/streakCalculator';
import { checkAndAwardAchievements } from '../services/achievementService';
import { Achievement } from '../types/achievement';

type ProgressContextType = {
  xp: number;
  progress: number;
  level: number;
  streak: number;
  completedLessons: string[];
  lastXpGain: number | null;
  newAchievement: Achievement | null;
  addXp: (amount: number) => Promise<void>;
  clearXpToast: () => void;
  clearAchievementToast: () => void;
  refresh: () => Promise<void>;
  recordActivity: () => Promise<void>;
  checkAchievements: () => Promise<void>;
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [xp, setXp] = useState(0);
  const [progress, setProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastActivityDate, setLastActivityDate] = useState<string | null>(null);
  const [streakMilestonesAwarded, setStreakMilestonesAwarded] = useState<number[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [lastXpGain, setLastXpGain] = useState<number | null>(null);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setXp(data.xp || 0);
        setProgress(levelProgress(data.xp || 0));
        setStreak(data.streak || 0);
        setLastActivityDate(data.last_activity_date || null);
        setStreakMilestonesAwarded(data.streak_milestones_awarded || []);
        setCompletedLessons(data.completed_lessons || []);
      } else {
        await supabase.from('user_progress').insert([
          {
            user_id: user.id,
            xp: 0,
            progress: 0,
            streak: 0,
            completed_lessons: [],
            streak_milestones_awarded: [],
          },
        ]);
        setXp(0);
        setProgress(0);
        setStreak(0);
        setLastActivityDate(null);
        setStreakMilestonesAwarded([]);
        setCompletedLessons([]);
      }
    } catch (e) {
      console.warn('refresh progress failed', e);
    }
  }, [user]);

  const awardAchievementQueue = useCallback(async (userId: string) => {
    try {
      const earned = await checkAndAwardAchievements(userId);
      if (earned.length > 0) {
        setNewAchievement(earned[0]);
        const { data } = await supabase
          .from('user_progress')
          .select('xp')
          .eq('user_id', userId)
          .maybeSingle();
        if (data) {
          setXp(data.xp || 0);
          setProgress(levelProgress(data.xp || 0));
        }
      }
    } catch (e) {
      console.warn('achievement check failed', e);
    }
  }, []);

  const recordActivity = useCallback(async () => {
    if (!user) return;

    const { data: current } = await supabase
      .from('user_progress')
      .select('streak, last_activity_date, streak_milestones_awarded')
      .eq('user_id', user.id)
      .maybeSingle();

    const streakUpdate = updateStreak(
      current?.streak || 0,
      current?.last_activity_date || null,
    );

    if (!streakUpdate.isNewDay) return;

    setStreak(streakUpdate.streak);
    setLastActivityDate(streakUpdate.lastActivityDate);

    const milestones = current?.streak_milestones_awarded || [];
    const bonus = getStreakMilestoneBonus(streakUpdate.streak, milestones);
    let updatedMilestones = milestones;

    await supabase.from('user_progress').upsert(
      {
        user_id: user.id,
        streak: streakUpdate.streak,
        last_activity_date: streakUpdate.lastActivityDate,
        streak_milestones_awarded: bonus
          ? [...milestones, bonus.milestone]
          : milestones,
      },
      { onConflict: 'user_id' },
    );

    if (bonus) {
      updatedMilestones = [...milestones, bonus.milestone];
      setStreakMilestonesAwarded(updatedMilestones);
      setLastXpGain(bonus.bonusXp);
      await supabase.rpc('increment_xp', { p_user_id: user.id, xp_amount: bonus.bonusXp });
      const { data } = await supabase
        .from('user_progress')
        .select('xp')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setXp(data.xp || 0);
        setProgress(levelProgress(data.xp || 0));
      }
    }

    await awardAchievementQueue(user.id);
  }, [user, awardAchievementQueue]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (user?.id) recordActivity();
  }, [user?.id, recordActivity]);

  const addXp = async (amount: number) => {
    if (!user || amount <= 0) return;
    const newXp = xp + amount;
    setXp(newXp);
    setProgress(levelProgress(newXp));
    setLastXpGain(amount);

    try {
      const { data: current } = await supabase
        .from('user_progress')
        .select('completed_lessons, streak, last_activity_date, weekly_activity, streak_milestones_awarded')
        .eq('user_id', user.id)
        .maybeSingle();

      await supabase.from('user_progress').upsert(
        {
          user_id: user.id,
          xp: newXp,
          progress: levelProgress(newXp),
          completed_lessons: current?.completed_lessons || completedLessons,
          streak: current?.streak ?? streak,
          last_activity_date: current?.last_activity_date ?? lastActivityDate,
          weekly_activity: current?.weekly_activity,
          streak_milestones_awarded: current?.streak_milestones_awarded || streakMilestonesAwarded,
        },
        { onConflict: 'user_id' },
      );

      await awardAchievementQueue(user.id);
    } catch (e) {
      console.warn('failed to persist xp', e);
    }
  };

  const checkAchievements = async () => {
    if (!user) return;
    await awardAchievementQueue(user.id);
  };

  const clearXpToast = () => setLastXpGain(null);
  const clearAchievementToast = () => setNewAchievement(null);
  const level = levelFromXp(xp);

  return (
    <ProgressContext.Provider
      value={{
        xp,
        progress,
        level,
        streak,
        completedLessons,
        lastXpGain,
        newAchievement,
        addXp,
        clearXpToast,
        clearAchievementToast,
        refresh,
        recordActivity,
        checkAchievements,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
};
