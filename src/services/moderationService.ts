import { supabase } from '../lib/supabase';
import { PoemVersion } from '../types/poem';

export const submitPoemForReview = async (
  poemId: string,
  title: string,
  content: string,
  submittedBy: string,
) => {
  const { data, error } = await supabase
    .from('poem_versions')
    .insert([
      {
        poem_id: poemId,
        title,
        content,
        status: 'pending',
        submitted_by: submittedBy,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  await supabase.from('poems').update({ visibility: 'pending' }).eq('id', poemId);

  return data as PoemVersion;
};

export const getPendingVersions = async (): Promise<PoemVersion[]> => {
  const { data, error } = await supabase
    .from('poem_versions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as PoemVersion[];
};

export const approveVersion = async (versionId: string, poemId: string, reviewerId: string) => {
  const { data: version, error: versionError } = await supabase
    .from('poem_versions')
    .select('*')
    .eq('id', versionId)
    .single();

  if (versionError) throw versionError;

  const { error: poemError } = await supabase
    .from('poems')
    .update({
      title: version.title,
      content: version.content,
      visibility: 'public',
      updated_at: new Date().toISOString(),
    })
    .eq('id', poemId);

  if (poemError) throw poemError;

  const { error: updateError } = await supabase
    .from('poem_versions')
    .update({
      status: 'approved',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', versionId);

  if (updateError) throw updateError;
};

export const rejectVersion = async (
  versionId: string,
  poemId: string,
  reviewerId: string,
  notes?: string,
) => {
  const { error: poemError } = await supabase
    .from('poems')
    .update({ visibility: 'rejected' })
    .eq('id', poemId);

  if (poemError) throw poemError;

  const { error } = await supabase
    .from('poem_versions')
    .update({
      status: 'rejected',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null,
    })
    .eq('id', versionId);

  if (error) throw error;
};
