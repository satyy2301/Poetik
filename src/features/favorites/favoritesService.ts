// src/features/favorites/favoritesService.ts
import { supabase } from '../../lib/supabase';

export const toggleFavoritePoet = async (userId: string, poetId: string) => {
  const { data: existing } = await supabase
    .from('user_favorite_poets')
    .select()
    .eq('user_id', userId)
    .eq('poet_id', poetId)
    .maybeSingle();

  if (existing) {
    return supabase
      .from('user_favorite_poets')
      .delete()
      .eq('user_id', userId)
      .eq('poet_id', poetId);
  }
  return supabase
    .from('user_favorite_poets')
    .insert([{ user_id: userId, poet_id: poetId }]);
};

export const toggleFavoritePoem = async (userId: string, poemId: string) => {
  const { data: existing } = await supabase
    .from('user_favorite_poems')
    .select()
    .eq('user_id', userId)
    .eq('poem_id', poemId)
    .maybeSingle();

  if (existing) {
    return supabase
      .from('user_favorite_poems')
      .delete()
      .eq('user_id', userId)
      .eq('poem_id', poemId);
  }
  return supabase
    .from('user_favorite_poems')
    .insert([{ user_id: userId, poem_id: poemId }]);
};

export const addFavoritePoem = async (userId: string, poemId: string) => {
  const { error } = await supabase
    .from('user_favorite_poems')
    .upsert([{ user_id: userId, poem_id: poemId }], { onConflict: 'user_id,poem_id' });
  if (error) throw error;
};

export const getUserFavorites = async (userId: string) => {
  const { data: poetRows, error: poetsError } = await supabase
    .from('user_favorite_poets')
    .select('poet_id')
    .eq('user_id', userId);

  const { data: favoritePoems, error: poemsError } = await supabase
    .from('user_favorite_poems')
    .select(`
      poem:poems(
        id, title, content, themes, form, like_count, created_at,
        author:authors(id, name)
      )
    `)
    .eq('user_id', userId);

  if (poetsError) throw poetsError;
  if (poemsError) throw poemsError;

  const poetIds = (poetRows || []).map((r) => r.poet_id).filter(Boolean);
  let poets: any[] = [];
  if (poetIds.length) {
    const { data: authorData } = await supabase
      .from('authors')
      .select('id, name, bio, avatar_url')
      .in('id', poetIds);
    poets = authorData || [];
  }

  return {
    poets,
    poems: favoritePoems?.map((fp: any) => fp.poem).filter(Boolean) || [],
  };
};
