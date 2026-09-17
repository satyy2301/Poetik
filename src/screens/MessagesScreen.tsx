import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getConversations } from '../features/messaging/messagingService';
import { supabase } from '../lib/supabase';

type Conversation = {
  other: { id: string; name: string; avatar_url?: string };
  lastMessage: { content: string; created_at: string; read: boolean; receiver_id: string };
  unread: boolean;
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 604800000) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const MessagesScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await getConversations(user.id, 100, 0);
      if (error) throw error;

      const otherIds = new Set<string>();
      (data || []).forEach((msg: any) => {
        otherIds.add(msg.sender_id === user.id ? msg.receiver_id : msg.sender_id);
      });

      const { data: authors } = await supabase
        .from('authors')
        .select('id, user_id, name, avatar_url')
        .or(`id.in.(${Array.from(otherIds).join(',')}),user_id.in.(${Array.from(otherIds).join(',')})`);

      const nameMap: Record<string, { name: string; avatar_url?: string }> = {};
      (authors || []).forEach((a) => {
        const entry = { name: a.name, avatar_url: a.avatar_url };
        nameMap[a.id] = entry;
        if (a.user_id) nameMap[a.user_id] = entry;
      });

      const map = new Map<string, Conversation>();
      (data || []).forEach((msg: any) => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        if (!map.has(otherId)) {
          map.set(otherId, {
            other: {
              id: otherId,
              name: nameMap[otherId]?.name || 'Poet',
              avatar_url: nameMap[otherId]?.avatar_url,
            },
            lastMessage: msg,
            unread: !msg.read && msg.receiver_id === user.id,
          });
        }
      });

      const list = Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.lastMessage.created_at).getTime() -
          new Date(a.lastMessage.created_at).getTime(),
      );
      setConversations(list);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const openChat = (other: Conversation['other']) => {
    navigation.navigate('Chat', { userId: other.id, name: other.name });
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.heading, { color: colors.text }]}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.other.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchConversations();
            }}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No conversations yet</Text>
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
              Visit a poet's profile and tap Message to start chatting.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
            onPress={() => openChat(item.other)}
            activeOpacity={0.7}
          >
            {item.other.avatar_url ? (
              <Image source={{ uri: item.other.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>{item.other.name[0]?.toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.rowContent}>
              <View style={styles.rowTop}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                  {item.other.name}
                </Text>
                <Text style={[styles.time, { color: colors.textSecondary }]}>
                  {formatTime(item.lastMessage.created_at)}
                </Text>
              </View>
              <View style={styles.rowBottom}>
                <Text
                  style={[styles.preview, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.lastMessage.content}
                </Text>
                {item.unread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  heading: { fontSize: 22, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  rowContent: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontWeight: '700', fontSize: 15, flex: 1, marginRight: 8 },
  time: { fontSize: 12 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  preview: { fontSize: 13, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  empty: { alignItems: 'center', padding: 40, marginTop: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: 16 },
  emptyHint: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});

export default MessagesScreen;
