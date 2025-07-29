// src/features/favorites/favoritesService.ts
import { supabase } from '../../lib/supabase';

export const toggleFavoritePoet = async (userId: string, poetId: string) => {
  const { data: existing } = await supabase
    .from('user_favorite_poets')
    .select()
    .eq('user_id', userId)
    .eq('poet_id', poetId)
    .single();

  if (existing) {
    return supabase
      .from('user_favorite_poets')
      .delete()
      .eq('user_id', userId)
      .eq('poet_id', poetId);
  } else {
    return supabase
      .from('user_favorite_poets')
      .insert([{ user_id: userId, poet_id: poetId }]);
  }
};

export const toggleFavoritePoem = async (userId: string, poemId: string) => {
  const { data: existing } = await supabase
    .from('user_favorite_poems')
    .select()
    .eq('user_id', userId)
    .eq('poem_id', poemId)
    .single();

  if (existing) {
    return supabase
      .from('user_favorite_poems')
      .delete()
      .eq('user_id', userId)
      .eq('poem_id', poemId);
  } else {
    return supabase
      .from('user_favorite_poems')
      .insert([{ user_id: userId, poem_id: poemId }]);
  }
};

export const getUserFavorites = async (userId: string) => {
  const { data: favoritePoets } = await supabase
    .from('user_favorite_poets')
    .select('poet:users(*)')
    .eq('user_id', userId);

  const { data: favoritePoems } = await supabase
    .from('user_favorite_poems')
    .select('poem:poems(*, author:users(*))')
    .eq('user_id', userId);

  return {
    poets: favoritePoets?.map(fp => fp.poet) || [],
    poems: favoritePoems?.map(fp => fp.poem) || []
  };
};