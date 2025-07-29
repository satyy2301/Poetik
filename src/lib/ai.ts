// src/lib/ai.ts
import { supabase } from './supabase';

export const getCachedFeedback = async (poemId: string) => {
  const { data } = await supabase
    .from('poem_feedback')
    .select('feedback')
    .eq('poem_id', poemId)
    .single();
  
  return data?.feedback;
};

export const cacheFeedback = async (poemId: string, feedback: string) => {
  await supabase
    .from('poem_feedback')
    .upsert({ poem_id: poemId, feedback });
};