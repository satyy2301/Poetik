// src/features/messaging/messagingService.ts
import { supabase } from '../../lib/supabase';

export const sendMessage = async (senderId: string, receiverId: string, content: string) => {
  return supabase
    .from('messages')
    .insert([{ sender_id: senderId, receiver_id: receiverId, content }]);
};

export const getConversations = async (userId: string) => {
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
    .order('created_at', { ascending: false });
};

export const getMessages = async (userId: string, otherUserId: string) => {
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
    .order('created_at', { ascending: true });
};

export const markAsRead = async (messageIds: string[]) => {
  return supabase
    .from('messages')
    .update({ read: true })
    .in('id', messageIds);
};