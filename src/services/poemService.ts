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
  ShuffleCursor,
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
const SHUFFLE_SELECT = `
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
  shuffle_key,
  author:authors(id, name, canonical, birth_year, death_year)
`;

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

const missingShuffleKey = (error: { message?: string; code?: string } | null) => {
  const message = `${error?.message || ''} ${error?.code || ''}`;
  return message.includes('shuffle_key') || error?.code === '42703' || error?.code === 'PGRST204';
};

const shuffleStart = (seed?: string) => {
  const value = Number(seed);
  if (Number.isFinite(value) && value >= 0 && value < 1) return value;
  return Math.random();
};

async function queryShufflePage(
  filters: FetchPoemsParams['filters'],
  limit: number,
  bounds: { gte?: number; gt?: number; lt?: number },
) {
  let query = applyPoemFilters(
    supabase.from('poems').select(SHUFFLE_SELECT).eq('visibility', 'public'),
    filters,
  ).order('shuffle_key', { ascending: true });
  if (bounds.gte != null) query = query.gte('shuffle_key', bounds.gte);
  if (bounds.gt != null) query = query.gt('shuffle_key', bounds.gt);
  if (bounds.lt != null) query = query.lt('shuffle_key', bounds.lt);
  return query.limit(limit);
}

async function fetchShuffledPoems({
  limit,
  filters,
  shuffleSeed,
  cursor,
}: {
  limit: number;
  filters: FetchPoemsParams['filters'];
  shuffleSeed?: string;
  cursor?: ShuffleCursor | null;
}): Promise<FetchPoemsResult> {
  const start = cursor?.start ?? shuffleStart(shuffleSeed);
  const wrapped = cursor?.wrapped ?? false;
  const after = cursor?.after ?? null;

  const take = async (bounds: { gte?: number; gt?: number; lt?: number }, size: number) => {
    const { data, error } = await queryShufflePage(filters, size, bounds);
    if (error) throw error;
    return data || [];
  };

  let rows: any[] = [];
  let nowWrapped = wrapped;

  if (!wrapped) {
    const high = await take(after == null ? { gte: start } : { gt: after }, limit);
    rows = high;
    if (high.length < limit) {
      const low = await take({ lt: start }, limit - high.length);
      rows = high.concat(low);
      nowWrapped = true;
    }
  } else {
    const lowBounds = after == null ? { lt: start } : { gt: after, lt: start };
    rows = await take(lowBounds, limit);
    nowWrapped = true;
  }

  const lastKey = rows.length ? Number(rows[rows.length - 1].shuffle_key) : after;
  return {
    poems: rows.map(normalizeAuthor),
    hasMore: rows.length === limit,
    shuffleCursor: {
      start,
      after: Number.isFinite(lastKey) ? lastKey : null,
      wrapped: nowWrapped,
    },
  };
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
  shuffleCursor,
}: FetchPoemsParams): Promise<FetchPoemsResult> => {
  if (filters.followingOnly && !filters.followingIds?.length) {
    return { poems: [], hasMore: false };
  }

  if (sort === 'random') {
    try {
      return await fetchShuffledPoems({ limit, filters, shuffleSeed, cursor: shuffleCursor });
    } catch (error) {
      if (!missingShuffleKey(error as { message?: string; code?: string })) throw error;
    }
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

  let indexed = supabase
    .from('poems')
    .select(POEM_SELECT)
    .eq('visibility', 'public')
    .textSearch('search_vector', trimmed, { type: 'websearch', config: 'english' })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (form) indexed = indexed.ilike('form', form);
  if (theme) indexed = indexed.contains('themes', [theme]);
  if (authorId) indexed = indexed.eq('author_id', authorId);

  const { data, error } = await indexed;
  if (!error) return (data || []).map(normalizeAuthor);

  let fallback = supabase
    .from('poems')
    .select(POEM_SELECT)
    .eq('visibility', 'public')
    .ilike('title', `%${trimmed}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (form) fallback = fallback.ilike('form', form);
  if (theme) fallback = fallback.contains('themes', [theme]);
  if (authorId) fallback = fallback.eq('author_id', authorId);

  const { data: fallbackData, error: fallbackError } = await fallback;
  if (fallbackError) throw fallbackError;
  return (fallbackData || []).map(normalizeAuthor);
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
