import { supabase } from '../lib/supabase';

export type ActivityEvent = {
  id: string;
  user_id: string;
  event_type: string;
  target_type?: string;
  target_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  user?: { id: string; name: string };
};

export const logActivity = async (
  userId: string,
  eventType: ActivityEvent['event_type'],
  targetType?: string,
  targetId?: string,
  metadata?: Record<string, unknown>,
) => {
  await supabase.from('activity_events').insert([
    {
      user_id: userId,
      event_type: eventType,
      target_type: targetType,
      target_id: targetId,
      metadata: metadata || {},
    },
  ]);
};

export const fetchUserActivity = async (userId: string, limit = 30): Promise<ActivityEvent[]> => {
  const { data, error } = await supabase
    .from('activity_events')
    .select('*, user:authors(id, name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as ActivityEvent[];
};

export const fetchFriendsActivity = async (userId: string, limit = 30): Promise<ActivityEvent[]> => {
  const { data: following } = await supabase
    .from('followers')
    .select('followee_id')
    .eq('follower_id', userId);

  const friendIds = (following || []).map((f) => f.followee_id);
  if (friendIds.length === 0) return [];

  const { data, error } = await supabase
    .from('activity_events')
    .select('*, user:authors(id, name)')
    .in('user_id', friendIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as ActivityEvent[];
};

export const fetchAllActivity = async (limit = 40): Promise<ActivityEvent[]> => {
  const { data, error } = await supabase
    .from('activity_events')
    .select('*, user:authors(id, name)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as ActivityEvent[];
};

export const activityLabel = (event: ActivityEvent) => {
  switch (event.event_type) {
    case 'published': return 'published a poem';
    case 'liked': return 'liked a poem';
    case 'followed': return 'followed a poet';
    case 'completed_lesson': return 'completed a lesson';
    case 'shared_playlist': return 'shared a playlist';
    default: return 'did something';
  }
};
