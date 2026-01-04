// src/context/ProgressContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from './UserContext';

type ProgressContextType = {
  xp: number;
  progress: number; // 0..1
  level: number;
  addXp: (amount: number) => Promise<void>;
  refresh: () => Promise<void>;
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [xp, setXp] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  const refresh = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('user_progress').select('*').eq('user_id', user.id).single();
      if (data) {
        setXp(data.xp || 0);
        setProgress(data.progress || 0);
      } else {
        // create default
        await supabase.from('user_progress').insert([{ user_id: user.id, xp: 0, progress: 0 }]);
        setXp(0);
        setProgress(0);
      }
    } catch (e) {
      console.warn('refresh progress failed', e);
    }
  };

  const addXp = async (amount: number) => {
    if (!user) return;
    const newXp = xp + amount;
    const newProgress = Math.min(1, (newXp % 100) / 100); // progress within level (example)
    setXp(newXp);
    setProgress(newProgress);
    try {
      await supabase.from('user_progress').upsert({ user_id: user.id, xp: newXp, progress: newProgress }, { onConflict: 'user_id' });
    } catch (e) {
      console.warn('failed to persist xp', e);
    }
  };

  const level = Math.floor(xp / 100) + 1;

  return (
    <ProgressContext.Provider value={{ xp, progress, level, addXp, refresh }}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
};
