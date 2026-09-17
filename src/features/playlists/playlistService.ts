import { supabase } from '../../lib/supabase';

const generateSlug = (title: string) =>
  `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}-${Date.now().toString(36)}`;

const PLAYLIST_SELECT = `
  id,
  title,
  description,
  created_at,
  is_public,
  share_slug,
  follower_count,
  play_count,
  playlist_poems(
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
`;

export const getPlaylistById = async (playlistId: string) => {
  const { data, error } = await supabase
    .from('playlists')
    .select(PLAYLIST_SELECT)
    .eq('id', playlistId)
    .single();

  if (error) throw error;
  return data;
};

export const getUserPlaylists = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('playlists')
      .select(PLAYLIST_SELECT)
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
      .maybeSingle();

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

export const setPlaylistPublic = async (playlistId: string, isPublic: boolean, title?: string) => {
  const updates: Record<string, unknown> = { is_public: isPublic, updated_at: new Date().toISOString() };
  if (isPublic) {
    const { data } = await supabase.from('playlists').select('share_slug, title').eq('id', playlistId).single();
    if (!data?.share_slug) {
      updates.share_slug = generateSlug(title || data?.title || 'playlist');
    }
  }
  const { data, error } = await supabase
    .from('playlists')
    .update(updates)
    .eq('id', playlistId)
    .select()
    .single();
  if (error) throw error;
  return { data, error: null };
};

export const getPublicPlaylist = async (slug: string) => {
  const { data, error } = await supabase
    .from('playlists')
    .select(`
      id, title, description, is_public, share_slug, follower_count, play_count,
      playlist_poems(poem:poems(id, title, content, themes, form, like_count, author:authors(id, name)))
    `)
    .eq('share_slug', slug)
    .eq('is_public', true)
    .single();
  if (error) throw error;
  return data;
};

export const followPlaylist = async (userId: string, playlistId: string) => {
  const { error } = await supabase.from('playlist_followers').insert([{ user_id: userId, playlist_id: playlistId }]);
  if (error) throw error;
  const { data } = await supabase.from('playlists').select('follower_count').eq('id', playlistId).single();
  await supabase.from('playlists').update({ follower_count: (data?.follower_count || 0) + 1 }).eq('id', playlistId);
};

export const unfollowPlaylist = async (userId: string, playlistId: string) => {
  await supabase.from('playlist_followers').delete().eq('user_id', userId).eq('playlist_id', playlistId);
  const { data } = await supabase.from('playlists').select('follower_count').eq('id', playlistId).single();
  await supabase.from('playlists').update({ follower_count: Math.max(0, (data?.follower_count || 1) - 1) }).eq('id', playlistId);
};

export const isFollowingPlaylist = async (userId: string, playlistId: string) => {
  const { data } = await supabase
    .from('playlist_followers')
    .select('user_id')
    .eq('user_id', userId)
    .eq('playlist_id', playlistId)
    .maybeSingle();
  return !!data;
};

export const incrementPlayCount = async (playlistId: string) => {
  const { data } = await supabase.from('playlists').select('play_count').eq('id', playlistId).single();
  await supabase.from('playlists').update({ play_count: (data?.play_count || 0) + 1 }).eq('id', playlistId);
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