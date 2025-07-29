// src/features/playlists/playlistService.ts
import { supabase } from '../../lib/supabase';

export const createPlaylist = async (userId: string, title: string, description?: string) => {
  return supabase
    .from('playlists')
    .insert([{ user_id: userId, title, description }])
    .select()
    .single();
};

export const addToPlaylist = async (playlistId: string, poemId: string) => {
  // Get current max order_index
  const { data: currentMax } = await supabase
    .from('playlist_poems')
    .select('order_index')
    .eq('playlist_id', playlistId)
    .order('order_index', { ascending: false })
    .limit(1)
    .single();

  const newOrder = currentMax?.order_index ? currentMax.order_index + 1 : 0;

  return supabase
    .from('playlist_poems')
    .insert([{ playlist_id: playlistId, poem_id: poemId, order_index: newOrder }]);
};

export const getUserPlaylists = async (userId: string) => {
  return supabase
    .from('playlists')
    .select('*, playlist_poems(poem:poems(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
};

export const reorderPlaylist = async (playlistId: string, poemIds: string[]) => {
  const updates = poemIds.map((poemId, index) => ({
    playlist_id: playlistId,
    poem_id: poemId,
    order_index: index
  }));

  return supabase
    .from('playlist_poems')
    .upsert(updates);
};