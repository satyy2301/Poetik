import { supabase } from '../lib/supabase';
import { checkRateLimit } from './abuseService';
import { detectSpam } from '../utils/spamDetection';
import {
  FetchPoemsParams,
  FetchPoemsResult,
  Poem,
  SearchPoemsParams,
} from '../types/poem';

const POEM_SELECT = `
  id,
  title,
  content,
  era,
  themes,
  form,
  like_count,
  visibility,
  created_at,
  author_id,
  author:authors(id, name, canonical, birth_year, death_year)
`;

const DEFAULT_LIMIT = 20;

const normalizeAuthor = (poem: any): Poem => ({
  ...poem,
  author: poem.author || { id: poem.author_id, name: 'Unknown Author' },
});

export const getPoemById = async (poemId: string): Promise<Poem | null> => {
  const { data, error } = await supabase
    .from('poems')
    .select(POEM_SELECT)
    .eq('id', poemId)
    .maybeSingle();

  if (error) throw error;
  return data ? normalizeAuthor(data) : null;
};

export const fetchPoems = async ({
  limit = DEFAULT_LIMIT,
  page = 0,
  filters = {},
  sort = 'newest',
}: FetchPoemsParams): Promise<FetchPoemsResult> => {
  const from = page * limit;
  const to = from + limit;

  let query = supabase
    .from('poems')
    .select(POEM_SELECT)
    .eq('visibility', 'public');

  if (filters.followingOnly) {
    if (!filters.followingIds?.length) {
      return { poems: [], hasMore: false };
    }
    query = query.in('author_id', filters.followingIds);
  }
  if (filters.era) query = query.eq('era', filters.era);
  if (filters.theme) query = query.contains('themes', [filters.theme]);
  if (filters.form) query = query.ilike('form', filters.form);
  if (filters.authorId) query = query.eq('author_id', filters.authorId);

  if (sort === 'popular') {
    query = query.order('like_count', { ascending: false }).order('created_at', { ascending: false });
  } else if (sort === 'random') {
    query = query.order('id', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query.range(from, to);
  if (error) throw error;

  let rows = (data || []).map(normalizeAuthor);
  if (sort === 'random' && rows.length > 0) {
    rows = [...rows].sort(() => Math.random() - 0.5);
  }

  return {
    poems: rows.slice(0, limit),
    hasMore: rows.length > limit,
  };
};

export const searchPoems = async ({
  query,
  form = null,
  theme = null,
  authorId = null,
  limit = 20,
}: SearchPoemsParams): Promise<Poem[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { data, error } = await supabase.rpc('search_poems', {
    search_query: trimmed,
    form_filter: form,
    theme_filter: theme,
    author_filter: authorId,
    result_limit: limit,
  });

  if (error) {
    let fallback = supabase
      .from('poems')
      .select(POEM_SELECT)
      .eq('visibility', 'public')
      .or(`title.ilike.%${trimmed}%,content.ilike.%${trimmed}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (form) fallback = fallback.ilike('form', form);
    if (theme) fallback = fallback.contains('themes', [theme]);
    if (authorId) fallback = fallback.eq('author_id', authorId);

    const { data: fallbackData, error: fallbackError } = await fallback;
    if (fallbackError) throw fallbackError;
    return (fallbackData || []).map(normalizeAuthor);
  }

  const poemRows = (data || []) as Poem[];
  if (poemRows.length === 0) return [];

  const ids = poemRows.map((p) => p.id);
  const { data: enriched, error: enrichError } = await supabase
    .from('poems')
    .select(POEM_SELECT)
    .in('id', ids);

  if (enrichError) throw enrichError;
  return (enriched || []).map(normalizeAuthor);
};

export const publishPoem = async (
  poem: Pick<Poem, 'title' | 'content' | 'author_id' | 'themes' | 'form'> & {
    visibility?: Poem['visibility'];
  },
  userId?: string,
) => {
  const spam = detectSpam(poem.content);
  if (spam.isSpam) {
    throw new Error(`Content flagged: ${spam.reasons.join(', ')}`);
  }

  if (userId) {
    const allowed = await checkRateLimit(userId, 'publish_poem', 5, 60);
    if (!allowed) {
      throw new Error('Rate limit exceeded. Try again in an hour.');
    }
  }

  const { data, error } = await supabase
    .from('poems')
    .insert([
      {
        ...poem,
        visibility: poem.visibility || 'pending',
        like_count: 0,
      },
    ])
    .select(POEM_SELECT)
    .single();

  if (error) throw error;
  return normalizeAuthor(data);
};

export const incrementPoemLikes = async (poemId: string) => {
  const { error } = await supabase.rpc('increment_likes', { poem_id: poemId });
  if (error) throw error;
};
