// src/features/messaging/messagingService.ts
import { supabase } from '../../lib/supabase';

export const sendMessage = async (senderId: string, receiverId: string, content: string) => {
  // Optimistic insert: client could add a temporary local message ID and show it immediately
  return supabase
    .from('messages')
    .insert([{ sender_id: senderId, receiver_id: receiverId, content }]);
};

export const getConversations = async (userId: string, limit = 20, offset = 0) => {
  return supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      read,
      sender:users(id, username, avatar_url),
      receiver:users(id, username, avatar_url)
    `)
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
};

export const getMessages = async (userId: string, otherUserId: string, limit = 50, offset = 0) => {
  return supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      read,
      sender:users(id, username, avatar_url)
    `)
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);
};

export const markAsRead = async (messageIds: string[]) => {
  return supabase
    .from('messages')
    .update({ read: true })
    .in('id', messageIds);
};

export const subscribeToMessages = (callback: (payload: any) => void) => {
  // Use Supabase realtime subscription for messages table
  const subscription = supabase.channel('public:messages').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, payload => {
    callback(payload);
  }).subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export const setTypingStatus = async (userId: string, otherUserId: string, isTyping: boolean) => {
  return supabase
    .from('typing_status')
    .upsert([{ user_id: userId, other_user_id: otherUserId, is_typing: isTyping, updated_at: new Date().toISOString() }], { onConflict: 'user_id,other_user_id' });
};

export const subscribeToTyping = (callback: (payload: any) => void) => {
  const subscription = supabase.channel('public:typing_status').on('postgres_changes', { event: '*', schema: 'public', table: 'typing_status' }, payload => {
    callback(payload);
  }).subscribe();

  return () => {
    subscription.unsubscribe();
  };
};

export default {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  subscribeToMessages,
  setTypingStatus,
  subscribeToTyping
};