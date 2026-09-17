import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import MessageReactions from '../components/MessageReactions';
import {
  getMessages,
  sendMessage,
  markAsRead,
  subscribeToMessages,
  setTypingStatus,
  subscribeToTyping,
  toggleReaction,
  Message,
} from '../features/messaging/messagingService';

const ChatScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;

  const recipientUserId: string = route.params?.userId;
  const recipientName: string = route.params?.name || 'Poet';

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadMessages = useCallback(async () => {
    if (!user || !recipientUserId) return;
    setLoading(true);
    try {
      const { data, error } = await getMessages(user.id, recipientUserId, 200, 0);
      if (error) throw error;
      setMessages((data || []) as Message[]);
      const unreadIds = (data || [])
        .filter((m: Message) => !m.read && m.sender_id === recipientUserId)
        .map((m: Message) => m.id);
      if (unreadIds.length) await markAsRead(unreadIds);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  }, [user, recipientUserId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!user) return;
    const unsubMessages = subscribeToMessages((payload: any) => {
      const record = payload?.new || payload?.payload?.new;
      if (!record) return;
      const involves =
        (record.sender_id === user.id && record.receiver_id === recipientUserId) ||
        (record.sender_id === recipientUserId && record.receiver_id === user.id);
      if (!involves) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === record.id)) return prev;
        return [...prev, record as Message];
      });
      if (record.receiver_id === user.id) markAsRead([record.id]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    });
    const unsubTyping = subscribeToTyping((payload: any) => {
      const record = payload?.new || payload?.payload?.new;
      if (record?.user_id === recipientUserId && record?.other_user_id === user.id) {
        setIsOtherTyping(!!record.is_typing);
      }
    });
    return () => {
      unsubMessages();
      unsubTyping();
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [user, recipientUserId]);

  const handleSend = async () => {
    if (!text.trim() || !user || !recipientUserId) return;
    const content = text.trim();
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      content,
      created_at: new Date().toISOString(),
      read: false,
      sender_id: user.id,
      receiver_id: recipientUserId,
      message_type: 'text',
    };
    setMessages((prev) => [...prev, tempMsg]);
    setText('');
    setSending(true);
    try {
      await setTypingStatus(user.id, recipientUserId, false);
      const { data: inserted, error } = await sendMessage(user.id, recipientUserId, content);
      if (error) throw error;
      if (inserted) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? inserted as Message : m)));
      }
    } catch (err) {
      console.error('Send failed', err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleTyping = async (value: string) => {
    setText(value);
    if (!user || !recipientUserId) return;
    try {
      await setTypingStatus(user.id, recipientUserId, true);
    } catch {
      // typing status is optional
    }
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(async () => {
      try {
        await setTypingStatus(user.id, recipientUserId, false);
      } catch {
        // ignore
      }
    }, 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{recipientName}</Text>
          {isOtherTyping && (
            <Text style={[styles.typing, { color: colors.textSecondary }]}>typing...</Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((m) => {
            const isMine = m.sender_id === user?.id;
            return (
              <View
                key={m.id}
                style={[
                  styles.bubble,
                  isMine
                    ? [styles.outgoing, { backgroundColor: colors.primary }]
                    : [styles.incoming, { backgroundColor: colors.surface }],
                ]}
              >
                {m.message_type === 'poem' && m.poem ? (
                  <Text style={[styles.bubbleText, { color: isMine ? '#fff' : colors.text }]}>
                    {m.poem.title}
                  </Text>
                ) : (
                  <Text style={[styles.bubbleText, { color: isMine ? '#fff' : colors.text }]}>
                    {m.content}
                  </Text>
                )}
                {m.edited_at && (
                  <Text style={[styles.edited, { color: isMine ? '#dfe6e9' : colors.textSecondary }]}>
                    edited
                  </Text>
                )}
                <MessageReactions
                  reactions={m.reactions || {}}
                  currentUserId={user?.id || ''}
                  onReact={async (emoji) => {
                    await toggleReaction(m.id, emoji, user!.id, m.reactions || {});
                    loadMessages();
                  }}
                />
                <Text style={[styles.time, { color: isMine ? '#dfe6e9' : colors.textSecondary }]}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={80}>
        <View style={[styles.composer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            value={text}
            onChangeText={handleTyping}
            placeholder="Write a message..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.primary }]}
            onPress={handleSend}
            disabled={sending || !text.trim()}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  typing: { fontSize: 12, marginTop: 2 },
  messagesScroll: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 8 },
  bubble: { marginVertical: 4, padding: 12, borderRadius: 16, maxWidth: '80%' },
  incoming: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  outgoing: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  edited: { fontSize: 10, fontStyle: 'italic', marginTop: 4 },
  time: { fontSize: 10, marginTop: 6, alignSelf: 'flex-end' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;
