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
import { useResponsive } from '../hooks/useResponsive';
import EmptyState from '../components/ui/EmptyState';
import ChatScreen from './ChatScreen';
import { getConversations } from '../features/messaging/messagingService';
import { supabase } from '../lib/supabase';
import { hapticLight } from '../utils/haptics';

type Conversation = {
  other: { id: string; name: string; avatar_url?: string };
  lastMessage: { content: string; created_at: string; read: boolean; receiver_id: string };
  unread: boolean;
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const MessagesScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;
  const { isMobile } = useResponsive();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Conversation['other'] | null>(null);

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
        (a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime(),
      );
      setConversations(list);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const openChat = (other: Conversation['other']) => {
    if (isMobile) {
      navigation.navigate('Chat', { userId: other.id, name: other.name });
    } else {
      setSelectedChat(other);
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const isActive = selectedChat?.id === item.other.id;
    return (
      <TouchableOpacity
        style={[
          styles.row,
          {
            backgroundColor: isActive ? colors.cardHeaderTint : colors.bgSurface,
            borderBottomColor: colors.borderMuted,
          },
        ]}
        onPress={() => openChat(item.other)}
        activeOpacity={0.7}
      >
        {item.other.avatar_url ? (
          <Image source={{ uri: item.other.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.brandPrimary }]}>
            <Text style={styles.avatarText}>{item.other.name[0]?.toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.rowContent}>
          <View style={styles.rowTop}>
            <Text style={[theme.typography.labelBold, { color: colors.textPrimary, flex: 1 }]} numberOfLines={1}>
              {item.other.name}
            </Text>
            <Text style={[theme.typography.bodySm, { color: colors.textSecondary }]}>
              {formatTime(item.lastMessage.created_at)}
            </Text>
          </View>
          <View style={styles.rowBottom}>
            <Text style={[theme.typography.bodySm, { color: colors.textSecondary, flex: 1 }]} numberOfLines={1}>
              {item.lastMessage.content}
            </Text>
            {item.unread && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.brandPrimary }]}>
                <Text style={styles.unreadText}>1</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bgCanvas }]}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      </View>
    );
  }

  const inboxList = (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.other.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); hapticLight(); fetchConversations(); }}
          tintColor={colors.brandPrimary}
        />
      }
      ListEmptyComponent={
        <EmptyState
          icon="mail-outline"
          title="No conversations yet"
          description="Visit a poet's profile and tap Message to start chatting."
          actionLabel="Start a new conversation"
          onAction={() => navigation.navigate('Search')}
        />
      }
      renderItem={renderConversation}
    />
  );

  if (!isMobile) {
    return (
      <View style={[styles.splitContainer, { backgroundColor: colors.bgCanvas }]}>
        <View style={[styles.inboxPane, { borderRightColor: colors.borderMuted, backgroundColor: colors.bgSurface }]}>
          {inboxList}
        </View>
        <View style={styles.chatPane}>
          {selectedChat ? (
            <ChatScreen embeddedUserId={selectedChat.id} embeddedName={selectedChat.name} />
          ) : (
            <EmptyState
              icon="chatbubbles-outline"
              title="Select a conversation"
              description="Choose a poet from your inbox to start chatting."
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCanvas }]}>
      {inboxList}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  splitContainer: { flex: 1, flexDirection: 'row' },
  inboxPane: { width: 340, borderRightWidth: 1 },
  chatPane: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  rowBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 4,
  },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

export default MessagesScreen;
