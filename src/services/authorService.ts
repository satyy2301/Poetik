import { supabase } from '../lib/supabase';
import { Author, AuthorStats } from '../types/author';
import { Poem } from '../types/poem';

const AUTHOR_SELECT = `
  id,
  name,
  bio,
  avatar_url,
  birth_year,
  death_year,
  canonical,
  user_id,
  created_at
`;

const POEM_SELECT = `
  id,
  title,
  content,
  themes,
  form,
  like_count,
  created_at,
  author_id,
  author:authors(id, name)
`;

/** Resolve an authors.id or auth user id to the linked auth.users id for follow/message actions. */
export const resolveAuthorAccountId = async (authorOrUserId: string): Promise<string | null> => {
  let author = await getAuthorById(authorOrUserId);
  if (!author) {
    const { data } = await supabase
      .from('authors')
      .select(AUTHOR_SELECT)
      .eq('user_id', authorOrUserId)
      .maybeSingle();
    author = data as Author | null;
  }
  if (!author) return null;
  if (author.canonical) return null;
  if (author.user_id) return author.user_id;

  // Legacy rows where authors.id equals the auth user id
  const { data: legacyUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', author.id)
    .maybeSingle();
  if (legacyUser) return author.id;

  return null;
};

export const getAuthorById = async (authorId: string): Promise<Author | null> => {
  const { data, error } = await supabase
    .from('authors')
    .select(AUTHOR_SELECT)
    .eq('id', authorId)
    .single();

  if (error) return null;
  return data as Author;
};

export const getAuthorPoems = async (
  authorId: string,
  page = 0,
  pageSize = 20,
): Promise<{ poems: Poem[]; hasMore: boolean }> => {
  const from = page * pageSize;
  const to = from + pageSize;

  const { data, error } = await supabase
    .from('poems')
    .select(POEM_SELECT)
    .eq('author_id', authorId)
    .in('visibility', ['public', 'pending'])
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  const rows = (data || []) as unknown as Poem[];
  return {
    poems: rows.slice(0, pageSize),
    hasMore: rows.length > pageSize,
  };
};

export const getAuthorStats = async (authorId: string): Promise<AuthorStats> => {
  const { data: poems, error } = await supabase
    .from('poems')
    .select('like_count, themes, form')
    .eq('author_id', authorId)
    .eq('visibility', 'public');

  if (error) throw error;

  const rows = poems || [];
  const totalLikes = rows.reduce((sum, poem) => sum + (poem.like_count || 0), 0);

  const themeCount: Record<string, number> = {};
  rows.forEach((poem) => {
    (poem.themes || []).forEach((theme: string) => {
      themeCount[theme] = (themeCount[theme] || 0) + 1;
    });
  });

  const formCount: Record<string, number> = {};
  rows.forEach((poem) => {
    if (poem.form) formCount[poem.form] = (formCount[poem.form] || 0) + 1;
  });

  const topThemes = Object.entries(themeCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([theme]) => theme);

  const mostUsedForm =
    Object.entries(formCount).sort(([, a], [, b]) => b - a)[0]?.[0] || '';

  return {
    totalPoems: rows.length,
    totalLikes,
    themes: topThemes,
    mostUsedForm,
  };
};

export const searchAuthors = async (query: string, limit = 10): Promise<Author[]> => {
  const { data, error } = await supabase
    .from('authors')
    .select(`${AUTHOR_SELECT}, poems(count)`)
    .ilike('name', `%${query}%`)
    .limit(limit);

  if (error) throw error;
  return (data || []) as Author[];
};

export const upsertUserAuthor = async (userId: string, name: string) => {
  const { error } = await supabase.from('authors').upsert(
    [
      {
        id: userId,
        user_id: userId,
        name,
        canonical: false,
      },
    ],
    { onConflict: 'id' },
  );

  if (error) throw error;
};
