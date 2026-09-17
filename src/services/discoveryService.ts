import { supabase } from '../lib/supabase';
import { Poem } from '../types/poem';

const POEM_SELECT = `
  id, title, content, era, themes, form, like_count, visibility, created_at, author_id,
  author:authors(id, name)
`;

const normalize = (poem: any): Poem => ({
  ...poem,
  author: poem.author || { id: poem.author_id, name: 'Unknown' },
});

export const fetchTrendingPoems = async (limit = 10): Promise<Poem[]> => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('poems')
    .select(POEM_SELECT)
    .eq('visibility', 'public')
    .gte('created_at', weekAgo.toISOString())
    .order('like_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(normalize);
};

export const fetchEditorsPicks = async (limit = 10): Promise<Poem[]> => {
  const { data, error } = await supabase
    .from('poems')
    .select(POEM_SELECT)
    .eq('visibility', 'public')
    .order('like_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(normalize);
};

export const fetchRandomPoem = async (): Promise<Poem | null> => {
  const { data, error } = await supabase
    .from('poems')
    .select(POEM_SELECT)
    .eq('visibility', 'public')
    .limit(50);

  if (error || !data?.length) return null;
  const random = data[Math.floor(Math.random() * data.length)];
  return normalize(random);
};

export const fetchSimilarPoems = async (poem: Poem, limit = 5): Promise<Poem[]> => {
  let query = supabase
    .from('poems')
    .select(POEM_SELECT)
    .eq('visibility', 'public')
    .neq('id', poem.id)
    .limit(limit);

  if (poem.form) query = query.eq('form', poem.form);
  else if (poem.themes?.length) query = query.contains('themes', [poem.themes[0]]);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalize);
};

export const fetchNewAuthors = async (limit = 8) => {
  const { data, error } = await supabase
    .from('authors')
    .select('id, name, bio, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

export const fetchWeeklyDigest = async (limit = 5): Promise<Poem[]> => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data, error } = await supabase
    .from('poems')
    .select(POEM_SELECT)
    .eq('visibility', 'public')
    .gte('created_at', weekAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []).map(normalize);
};
