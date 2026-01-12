// src/screens/MessagesScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useUser } from '../context/UserContext';
import messagingService, { getConversations, getMessages, sendMessage, markAsRead, subscribeToMessages, setTypingStatus, subscribeToTyping } from '../features/messaging/messagingService';

const MessagesScreen = ({ navigation }: any) => {
  const { user } = useUser();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchConversations();
    const unsubMessages = subscribeToMessages(handleRealtimeMessage);
    const unsubTyping = subscribeToTyping(handleTypingPayload);
    return () => {
      try { unsubMessages(); } catch (e) {}
      try { unsubTyping(); } catch (e) {}
    };
  }, [user]);

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  const fetchConversations = async () => {
    setLoadingConvos(true);
    try {
      const res: any = await getConversations(user.id, 50, 0);
      const { data } = res;
      // Build simple conversation list keyed by other user
      const map = new Map();
      (data || []).forEach((msg: any) => {
        const other = msg.sender?.id === user.id ? msg.receiver : msg.sender;
        if (!other) return;
        const key = other.id;
        if (!map.has(key)) map.set(key, { other, lastMessage: msg, unread: !msg.read && msg.receiver?.id === user.id });
      });
      const list = Array.from(map.values()).sort((a: any, b: any) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());
      setConversations(list);
    } catch (err) {
      console.error('Failed to fetch convos', err);
    } finally {
      setLoadingConvos(false);
    }
  };

  const openConversation = async (otherUser: any) => {
    setSelectedUser(otherUser);
    setLoadingMessages(true);
    try {
      const res: any = await getMessages(user.id, otherUser.id, 200, 0);
      const { data } = res;
      setMessages(data || []);
      // Mark unread messages as read
      const unreadIds = (data || []).filter((m: any) => !m.read && m.sender?.id === otherUser.id).map((m: any) => m.id);
      if (unreadIds.length) {
        await markAsRead(unreadIds);
        // refresh conversations
        fetchConversations();
      }
      // scroll to bottom after a tick
      setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true } as any), 200);
      // notify that user has opened conversation -> clear typing indicator for other
      try { await setTypingStatus(user.id, otherUser.id, false); } catch (e) { }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedUser) return;
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      content: text.trim(),
      created_at: new Date().toISOString(),
      read: false,
      sender: { id: user.id },
    };
    setMessages(prev => [...prev, tempMsg]);
    setText('');
    // indicate stopped typing
    try { await setTypingStatus(user.id, selectedUser.id, false); } catch (e) { }
    setSending(true);
    try {
      const res: any = await sendMessage(user.id, selectedUser.id, tempMsg.content);
      const inserted = res.data?.[0];
      if (inserted) {
        // replace temp message id with real one
        setMessages(prev => prev.map(m => m.id === tempId ? inserted : m));
      } else {
        // fallback: refresh messages
        openConversation(selectedUser);
      }
      // refresh conversations list
      fetchConversations();
    } catch (err) {
      console.error('Send failed', err);
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true } as any), 200);
    }
  };

  // When user types, send typing status with debounce
  const handleTyping = async (value: string) => {
    setText(value);
    if (!selectedUser) return;
    try {
      await setTypingStatus(user.id, selectedUser.id, true);
    } catch (e) {
      // ignore
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(async () => {
      try { await setTypingStatus(user.id, selectedUser.id, false); } catch (e) { }
    }, 2000);
  };

  const handleRealtimeMessage = (payload: any) => {
    try {
      const event = payload?.event;
      const record = payload?.payload?.new || payload?.payload?.record || payload?.record;
      if (!record) return;
      // if conversation visible, append
      const otherId = record.sender_id === user.id ? record.receiver_id : record.sender_id;
      if (selectedUser && (record.sender_id === selectedUser.id || record.receiver_id === selectedUser.id)) {
        // fetch sender relation data (payload may include joins — but if not, just append)
        setMessages(prev => [...prev, { ...record, sender: { id: record.sender_id } }]);
        // mark as read if it's for me
        if (record.receiver_id === user.id) markAsRead([record.id]);
      }
      // update conversation list
      fetchConversations();
    } catch (e) {
      console.warn('Realtime handling error', e);
    }
  };

  const handleTypingPayload = (payload: any) => {
    try {
      const record = payload?.payload?.new || payload?.payload?.record || payload?.record;
      if (!record || !selectedUser) return;
      // if other user is typing to me
      if (record.user_id === selectedUser.id && record.other_user_id === user.id) {
        setIsOtherTyping(!!record.is_typing);
      }
    } catch (e) {
      console.warn('Typing payload error', e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.listPane}>
        <Text style={styles.heading}>Messages</Text>
        {loadingConvos ? <ActivityIndicator /> : (
          <FlatList
            data={conversations}
            keyExtractor={(item: any) => item.other.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.convoItem} onPress={() => openConversation(item.other)}>
                <Text style={styles.convoTitle}>{item.other.username || item.other.id}</Text>
                <Text numberOfLines={1} style={styles.convoPreview}>{item.lastMessage?.content}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <View style={styles.chatPane}>
        {selectedUser ? (
          <>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>{selectedUser.username || selectedUser.id}</Text>
              {isOtherTyping && <Text style={{ color: '#636e72', marginTop: 4, fontSize: 12 }}>typing...</Text>}
            </View>
            {loadingMessages ? <ActivityIndicator /> : (
              <ScrollView ref={scrollRef} style={styles.messagesScroll}>
                {messages.map((m: any) => (
                  <View key={m.id} style={[styles.messageBubble, m.sender?.id === user.id ? styles.outgoing : styles.incoming]}>
                    <Text style={styles.messageText}>{m.content}</Text>
                    <Text style={styles.messageTime}>{new Date(m.created_at).toLocaleTimeString()}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
              <View style={styles.composer}>
                <TextInput style={styles.input} value={text} onChangeText={handleTyping} placeholder="Write a message..." />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending}>
                  <Text style={styles.sendText}>{sending ? '...' : 'Send'}</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </>
        ) : (
          <View style={styles.emptyPane}>
            <Text style={styles.emptyText}>Select a conversation to start chatting.</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  listPane: { width: 320, borderRightWidth: 1, borderRightColor: '#ecf0f1', padding: 10 },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  convoItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
  convoTitle: { fontWeight: '600' },
  convoPreview: { color: '#7f8c8d' },
  chatPane: { flex: 1, padding: 10 },
  chatHeader: { borderBottomWidth: 1, borderBottomColor: '#ecf0f1', paddingBottom: 10, marginBottom: 10 },
  chatTitle: { fontSize: 16, fontWeight: 'bold' },
  messagesScroll: { flex: 1, marginBottom: 10 },
  messageBubble: { marginVertical: 6, padding: 10, borderRadius: 8, maxWidth: '80%' },
  incoming: { backgroundColor: '#f1f2f6', alignSelf: 'flex-start' },
  outgoing: { backgroundColor: '#74b9ff', alignSelf: 'flex-end' },
  messageText: { color: '#2d3436' },
  messageTime: { fontSize: 10, color: '#636e72', marginTop: 6 },
  composer: { flexDirection: 'row', alignItems: 'center', paddingTop: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ecf0f1', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  sendButton: { backgroundColor: '#0984e3', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
  sendText: { color: 'white', fontWeight: '600' },
  emptyPane: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#95a5a6' },
});

export default MessagesScreen;
