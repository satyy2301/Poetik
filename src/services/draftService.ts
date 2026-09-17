import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export type DraftData = {
  title: string;
  content: string;
  form?: string;
  themes?: string[];
};

export type DraftVersion = {
  id: string;
  title: string;
  content: string;
  form?: string;
  version_number: number;
  created_at: string;
  poem_id?: string;
};

const localKey = (userId: string) => `poem_draft_${userId}`;

export const saveDraftLocal = async (userId: string, draft: DraftData) => {
  await AsyncStorage.setItem(localKey(userId), JSON.stringify({ ...draft, savedAt: Date.now() }));
};

export const loadDraftLocal = async (userId: string): Promise<DraftData | null> => {
  const raw = await AsyncStorage.getItem(localKey(userId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return { title: parsed.title || '', content: parsed.content || '', form: parsed.form, themes: parsed.themes };
  } catch {
    return null;
  }
};

export const saveDraft = async (userId: string, draft: DraftData) => {
  await saveDraftLocal(userId, draft);

  const { error } = await supabase.from('poem_drafts').upsert(
    {
      user_id: userId,
      title: draft.title,
      content: draft.content,
      form: draft.form || null,
      themes: draft.themes || [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.warn('remote draft save failed, local copy kept', error.message);
  }
};

export const loadDraft = async (userId: string): Promise<DraftData | null> => {
  const { data, error } = await supabase
    .from('poem_drafts')
    .select('title, content, form, themes')
    .eq('user_id', userId)
    .maybeSingle();

  if (!error && data) {
    return {
      title: data.title || '',
      content: data.content || '',
      form: data.form,
      themes: data.themes || [],
    };
  }

  return loadDraftLocal(userId);
};

export const clearDraft = async (userId: string) => {
  await AsyncStorage.removeItem(localKey(userId));
  await supabase.from('poem_drafts').delete().eq('user_id', userId);
};

export const saveVersion = async (
  userId: string,
  draft: DraftData,
  poemId?: string,
): Promise<DraftVersion | null> => {
  const { count } = await supabase
    .from('poem_draft_versions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const versionNumber = (count || 0) + 1;

  const { data, error } = await supabase
    .from('poem_draft_versions')
    .insert([
      {
        user_id: userId,
        poem_id: poemId || null,
        title: draft.title,
        content: draft.content,
        form: draft.form || null,
        version_number: versionNumber,
      },
    ])
    .select('*')
    .single();

  if (error) {
    console.warn('version save failed', error.message);
    return null;
  }

  return data as DraftVersion;
};

export const fetchVersions = async (userId: string, limit = 20): Promise<DraftVersion[]> => {
  const { data, error } = await supabase
    .from('poem_draft_versions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as DraftVersion[];
};
