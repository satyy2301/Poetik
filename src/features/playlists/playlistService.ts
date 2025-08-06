import { supabase } from '../../lib/supabase';

export const getUserPlaylists = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('playlists')
      .select(`
        id,
        title,
        description,
        created_at,
        playlist_poems!inner(
          poem:poems(
            id,
            title,
            content,
            themes,
            form,
            like_count,
            author:authors(id, name)
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return { data: [], error };
  }
};

export const createPlaylist = async (userId: string, title: string, description?: string) => {
  try {
    const { data, error } = await supabase
      .from('playlists')
      .insert([{
        user_id: userId,
        title: title.trim(),
        description: description?.trim() || '',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error creating playlist:', error);
    return { data: null, error };
  }
};

export const addPoemToPlaylist = async (playlistId: string, poemId: string) => {
  try {
    // Check if poem is already in playlist
    const { data: existing } = await supabase
      .from('playlist_poems')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('poem_id', poemId)
      .single();

    if (existing) {
      return { data: null, error: new Error('Poem already in playlist') };
    }

    const { data, error } = await supabase
      .from('playlist_poems')
      .insert([{
        playlist_id: playlistId,
        poem_id: poemId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error adding poem to playlist:', error);
    return { data: null, error };
  }
};

export const removePoemFromPlaylist = async (playlistId: string, poemId: string) => {
  try {
    const { error } = await supabase
      .from('playlist_poems')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('poem_id', poemId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Error removing poem from playlist:', error);
    return { error };
  }
};

export const deletePlaylist = async (playlistId: string) => {
  try {
    // First delete all poems in the playlist
    await supabase
      .from('playlist_poems')
      .delete()
      .eq('playlist_id', playlistId);

    // Then delete the playlist itself
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return { error };
  }
};

export const updatePlaylist = async (playlistId: string, updates: { title?: string; description?: string }) => {
  try {
    const { data, error } = await supabase
      .from('playlists')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', playlistId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error updating playlist:', error);
    return { data: null, error };
  }
};