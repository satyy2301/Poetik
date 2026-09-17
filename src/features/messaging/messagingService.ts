import { supabase } from '../../lib/supabase';

export type MessageType = 'text' | 'image' | 'poem';

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: MessageType;
  image_url?: string;
  poem_id?: string;
  reactions?: Record<string, string[]>;
  read: boolean;
  archived?: boolean;
  edited_at?: string;
  created_at: string;
  sender?: { id: string; name?: string };
  poem?: { id: string; title: string; content: string };
};

export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  options?: { messageType?: MessageType; imageUrl?: string; poemId?: string },
) => {
  return supabase.from('messages').insert([
    {
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      message_type: options?.messageType || 'text',
      image_url: options?.imageUrl,
      poem_id: options?.poemId,
    },
  ]);
};

export const sendPoemShare = async (
  senderId: string,
  receiverId: string,
  poemId: string,
  poemTitle: string,
) => {
  return sendMessage(senderId, receiverId, `Shared poem: ${poemTitle}`, {
    messageType: 'poem',
    poemId,
  });
};

export const getConversations = async (userId: string, limit = 20, offset = 0) => {
  return supabase
    .from('messages')
    .select('id, content, created_at, read, message_type, poem_id, sender_id, receiver_id')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq('archived', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
};

export const getMessages = async (userId: string, otherUserId: string, limit = 50, offset = 0) => {
  return supabase
    .from('messages')
    .select(`
      id, content, created_at, read, message_type, image_url, poem_id, reactions, edited_at,
      sender_id, receiver_id,
      poem:poems(id, title, content)
    `)
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .eq('archived', false)
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);
};

export const searchMessages = async (userId: string, query: string) => {
  return supabase
    .from('messages')
    .select('id, content, created_at, sender_id, receiver_id')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .ilike('content', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(30);
};

export const markAsRead = async (messageIds: string[]) => {
  if (!messageIds.length) return { data: null, error: null };
  return supabase.from('messages').update({ read: true }).in('id', messageIds);
};

export const editMessage = async (messageId: string, content: string) => {
  return supabase
    .from('messages')
    .update({ content, edited_at: new Date().toISOString() })
    .eq('id', messageId);
};

export const deleteMessage = async (messageId: string) => {
  return supabase.from('messages').delete().eq('id', messageId);
};

export const archiveConversation = async (userId: string, otherUserId: string) => {
  return supabase
    .from('messages')
    .update({ archived: true })
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`);
};

export const toggleReaction = async (
  messageId: string,
  emoji: string,
  userId: string,
  currentReactions: Record<string, string[]> = {},
) => {
  const reactions = { ...currentReactions };
  const users = reactions[emoji] || [];
  if (users.includes(userId)) {
    reactions[emoji] = users.filter((id) => id !== userId);
    if (reactions[emoji].length === 0) delete reactions[emoji];
  } else {
    reactions[emoji] = [...users, userId];
  }
  return supabase.from('messages').update({ reactions }).eq('id', messageId);
};

export const subscribeToMessages = (callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('public:messages')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, callback)
    .subscribe();
  return () => subscription.unsubscribe();
};

export const setTypingStatus = async (userId: string, otherUserId: string, isTyping: boolean) => {
  return supabase
    .from('typing_status')
    .upsert(
      [{ user_id: userId, other_user_id: otherUserId, is_typing: isTyping, updated_at: new Date().toISOString() }],
      { onConflict: 'user_id,other_user_id' },
    );
};

export const subscribeToTyping = (callback: (payload: any) => void) => {
  const subscription = supabase
    .channel('public:typing_status')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'typing_status' }, callback)
    .subscribe();
  return () => subscription.unsubscribe();
};

export default {
  sendMessage,
  sendPoemShare,
  getConversations,
  getMessages,
  searchMessages,
  markAsRead,
  editMessage,
  deleteMessage,
  archiveConversation,
  toggleReaction,
  subscribeToMessages,
  setTypingStatus,
  subscribeToTyping,
};
