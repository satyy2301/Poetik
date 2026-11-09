import { supabase } from '../lib/supabase';
import { checkRateLimit, isUserBlocked } from './abuseService';
import { detectSpam } from '../utils/spamDetection';
import { trackEvent } from '../utils/analytics';
import { captureException } from '../utils/errorTracking';
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
const ID_PAGE = 1000;

let shuffleDeck: { key: string; ids: string[] } | null = null;

const shuffleIds = (ids: string[]) => {
  const copy = [...ids];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
};

const applyPoemFilters = (query: any, filters: FetchPoemsParams['filters'] = {}) => {
  let next = query;
  if (filters.followingOnly) next = next.in('author_id', filters.followingIds || []);
  if (filters.era) next = next.ilike('era', filters.era);
  if (filters.theme) next = next.or(themeContainsFilter(filters.theme));
  if (filters.form) next = next.ilike('form', filters.form);
  if (filters.language) next = next.eq('language', filters.language);
  if (filters.authorId) next = next.eq('author_id', filters.authorId);
  return next;
};

async function loadShuffleDeck(key: string, filters: FetchPoemsParams['filters'] = {}) {
  if (shuffleDeck?.key === key) return shuffleDeck.ids;

  const ids: string[] = [];
  for (let from = 0; ; from += ID_PAGE) {
    const { data, error } = await applyPoemFilters(
      supabase.from('poems').select('id').eq('visibility', 'public'),
      filters,
    )
      .order('id', { ascending: true })
      .range(from, from + ID_PAGE - 1);
    if (error) throw error;
    for (const row of data || []) ids.push(row.id);
    if (!data || data.length < ID_PAGE) break;
  }

  shuffleDeck = { key, ids: shuffleIds(ids) };
  return shuffleDeck.ids;
}

async function fetchShuffledPoems({
  limit,
  page,
  filters,
  shuffleSeed,
}: {
  limit: number;
  page: number;
  filters: FetchPoemsParams['filters'];
  shuffleSeed?: string;
}): Promise<FetchPoemsResult> {
  const key = [
    shuffleSeed || 'feed',
    filters?.era || '',
    filters?.theme || '',
    filters?.form || '',
    filters?.language || '',
    filters?.authorId || '',
    filters?.followingOnly ? (filters.followingIds || []).join(',') : '',
  ].join('|');
  const ids = await loadShuffleDeck(key, filters);
  const slice = ids.slice(page * limit, page * limit + limit);
  if (slice.length === 0) return { poems: [], hasMore: false };

  const { data, error } = await supabase.from('poems').select(POEM_SELECT).in('id', slice);
  if (error) throw error;
  const byId = new Map((data || []).map((row) => [row.id, normalizeAuthor(row)]));
  const poems = slice.map((id) => byId.get(id)).filter((poem): poem is Poem => Boolean(poem));
  return { poems, hasMore: (page + 1) * limit < ids.length };
}

const themeContainsFilter = (theme: string) => {
  const variants = Array.from(new Set([theme, theme.toLowerCase(), theme.toUpperCase()]));
  return variants
    .map((value) => `themes.cs.{${/\s/.test(value) ? `"${value}"` : value}}`)
    .join(',');
};

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
  shuffleSeed,
}: FetchPoemsParams): Promise<FetchPoemsResult> => {
  if (filters.followingOnly && !filters.followingIds?.length) {
    return { poems: [], hasMore: false };
  }

  if (sort === 'random') {
    return fetchShuffledPoems({ limit, page, filters, shuffleSeed });
  }

  const from = page * limit;
  const to = from + limit;

  let query = applyPoemFilters(
    supabase.from('poems').select(POEM_SELECT).eq('visibility', 'public'),
    filters,
  );

  if (sort === 'popular') {
    query = query.order('like_count', { ascending: false }).order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query.range(from, to);
  if (error) throw error;

  const rows = (data || []).map(normalizeAuthor);
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
    const blocked = await isUserBlocked(userId);
    if (blocked) {
      throw new Error('Your account is restricted from publishing. Contact support.');
    }

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
        visibility: poem.visibility || 'public',
        like_count: 0,
      },
    ])
    .select(POEM_SELECT)
    .single();

  if (error) {
    captureException(error, { action: 'publish_poem' });
    throw error;
  }

  trackEvent('publish_poem', {
    poem_id: data.id,
    visibility: data.visibility || 'pending',
  });

  return normalizeAuthor(data);
};

export const updatePoem = async (
  poemId: string,
  userId: string,
  patch: Pick<Poem, 'title' | 'content' | 'themes' | 'form'>,
) => {
  const spam = detectSpam(patch.content);
  if (spam.isSpam) {
    throw new Error(`Content flagged: ${spam.reasons.join(', ')}`);
  }

  const { data, error } = await supabase
    .from('poems')
    .update({
      title: patch.title,
      content: patch.content,
      themes: patch.themes,
      form: patch.form,
    })
    .eq('id', poemId)
    .eq('author_id', userId)
    .select(POEM_SELECT)
    .single();

  if (error) {
    captureException(error, { action: 'update_poem' });
    throw error;
  }

  return normalizeAuthor(data);
};

export const deletePoem = async (poemId: string, userId: string) => {
  const rpc = await supabase.rpc('delete_own_poem', { target_id: poemId });
  const missingFn = rpc.error?.code === 'PGRST202' || /delete_own_poem/.test(rpc.error?.message || '');
  if (!rpc.error) return;
  if (!missingFn) {
    captureException(rpc.error, { action: 'delete_poem' });
    throw rpc.error;
  }

  const { data, error } = await supabase
    .from('poems')
    .delete()
    .eq('id', poemId)
    .eq('author_id', userId)
    .select('id');

  if (error) {
    captureException(error, { action: 'delete_poem' });
    throw error;
  }

  if (!data?.length) {
    const blocked = new Error('The poem was not removed. The database refused the delete.');
    captureException(blocked, { action: 'delete_poem', poemId });
    throw blocked;
  }
};

export const incrementPoemLikes = async (poemId: string) => {
  const { error } = await supabase.rpc('increment_likes', { poem_id: poemId });
  if (error) throw error;
};
