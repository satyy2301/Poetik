import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Switch,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import StackHeader from '../components/ui/StackHeader';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import {
  fetchNotifications,
  markAsRead,
  Notification,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../services/notificationService';
import { openAuthorProfile, openChat } from '../navigation/navigationHelpers';

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  follow: 'person-add',
  message: 'chatbubble',
  like: 'heart',
  comment: 'chatbox',
  playlist: 'musical-notes',
  system: 'notifications',
};

type Segment = 'all' | 'mentions' | 'milestones';

const NotificationsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;
  const { refreshUnread, clearUnread } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [segment, setSegment] = useState<Segment>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState({ push_enabled: true, follow_enabled: true, message_enabled: true, like_enabled: true });

  const load = useCallback(async () => {
    if (!user) return;
    const [notifs, preferences] = await Promise.all([
      fetchNotifications(user.id),
      getNotificationPreferences(user.id),
    ]);
    setNotifications(notifs);
    setPrefs(preferences as any);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    await refreshUnread();
    setRefreshing(false);
  };

  const filtered = notifications.filter((n) => {
    if (segment === 'mentions') return n.type === 'comment' || n.type === 'message';
    if (segment === 'milestones') return n.type === 'follow' || n.type === 'like' || n.type === 'playlist';
    return true;
  });

  const handlePress = async (notif: Notification) => {
    if (!notif.read) {
      await markAsRead([notif.id]);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
      await refreshUnread();
    }
    if (notif.type === 'message') {
      const senderId = (notif.data as any)?.sender_id;
      if (senderId) openChat(navigation, senderId);
      else navigation.navigate('App', { screen: 'MainTabs', params: { screen: 'Messages' } });
    }
    if (notif.type === 'follow') {
      const followerId = (notif.data as any)?.follower_id;
      if (followerId) openAuthorProfile(navigation, followerId);
    }
  };

  const togglePref = async (key: string, value: boolean) => {
    if (!user) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    await updateNotificationPreferences(user.id, updated);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bgCanvas }]}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCanvas }]}>
      <StackHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        rightActions={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowSettings(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={clearUnread} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="checkmark-done-outline" size={22} color={colors.brandPrimary} />
            </TouchableOpacity>
          </View>
        }
      />

      <View style={[styles.segmentRow, { borderBottomColor: colors.borderMuted }]}>
        {(['all', 'mentions', 'milestones'] as Segment[]).map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.segment, segment === s && { borderBottomColor: colors.brandPrimary }]}
            onPress={() => setSegment(s)}
          >
            <Text style={[theme.typography.labelBold, { color: segment === s ? colors.brandPrimary : colors.textSecondary, fontSize: 13 }]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brandPrimary} />}
        ListEmptyComponent={
          <EmptyState
            icon="create-outline"
            title="Quiet for now"
            description="When poets interact with your verses, you'll see it here."
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.row,
              {
                backgroundColor: item.read ? colors.bgSurface : colors.cardHeaderTint,
                borderBottomColor: colors.borderMuted,
              },
            ]}
            onPress={() => handlePress(item)}
          >
            <Ionicons name={iconMap[item.type] || 'notifications'} size={22} color={colors.brandPrimary} />
            <View style={styles.content}>
              <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>{item.title}</Text>
              {item.body && (
                <Text style={[theme.typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={2}>
                  {item.body}
                </Text>
              )}
              <Text style={[theme.typography.bodySm, { color: colors.textSecondary, marginTop: 4, fontSize: 11 }]}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <Modal visible={showSettings} animationType="slide" transparent onRequestClose={() => setShowSettings(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgSurface }]}>
            <Text style={[theme.typography.displaySm, { color: colors.textPrimary, marginBottom: 16 }]}>
              Notification Settings
            </Text>
            {[
              { key: 'follow_enabled', label: 'New followers' },
              { key: 'message_enabled', label: 'Messages' },
              { key: 'like_enabled', label: 'Likes' },
            ].map(({ key, label }) => (
              <View key={key} style={styles.prefRow}>
                <Text style={[theme.typography.bodyMd, { color: colors.textPrimary }]}>{label}</Text>
                <Switch
                  value={(prefs as any)[key]}
                  onValueChange={(v) => togglePref(key, v)}
                  trackColor={{ false: colors.borderMuted, true: colors.brandPrimary }}
                />
              </View>
            ))}
            <Button title="Done" onPress={() => setShowSettings(false)} variant="primary" style={{ marginTop: 16 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerActions: { flexDirection: 'row', gap: 12 },
  segmentRow: { flexDirection: 'row', borderBottomWidth: 1 },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  row: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, gap: 12 },
  content: { flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { borderRadius: 16, padding: 24, width: '90%', maxWidth: 400 },
  prefRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
});

export default NotificationsScreen;
