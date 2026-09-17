import { supabase } from '../lib/supabase';

export type Notification = {
  id: string;
  user_id: string;
  type: 'follow' | 'message' | 'like' | 'comment' | 'playlist' | 'system';
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
};

export const fetchNotifications = async (userId: string, limit = 50): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as Notification[];
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) return 0;
  return count || 0;
};

export const markAsRead = async (notificationIds: string[]) => {
  if (!notificationIds.length) return;
  await supabase.from('notifications').update({ read: true }).in('id', notificationIds);
};

export const markAllAsRead = async (userId: string) => {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
};

export const createNotification = async (
  userId: string,
  type: Notification['type'],
  title: string,
  body?: string,
  data?: Record<string, unknown>,
) => {
  await supabase.from('notifications').insert([
    { user_id: userId, type, title, body, data: data || {} },
  ]);
};

export const subscribeToNotifications = (
  userId: string,
  callback: (notification: Notification) => void,
) => {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => callback(payload.new as Notification),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const getNotificationPreferences = async (userId: string) => {
  const { data } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return data || {
    push_enabled: true,
    follow_enabled: true,
    message_enabled: true,
    like_enabled: true,
  };
};

export const updateNotificationPreferences = async (
  userId: string,
  prefs: Partial<{ push_enabled: boolean; follow_enabled: boolean; message_enabled: boolean; like_enabled: boolean }>,
) => {
  await supabase.from('notification_preferences').upsert(
    { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' },
  );
};
