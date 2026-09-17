import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  fetchNotifications,
  markAsRead,
  Notification,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../services/notificationService';

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  follow: 'person-add',
  message: 'chatbubble',
  like: 'heart',
  comment: 'chatbox',
  playlist: 'musical-notes',
  system: 'notifications',
};

const NotificationsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const { refreshUnread, clearUnread } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const handlePress = async (notif: Notification) => {
    if (!notif.read) {
      await markAsRead([notif.id]);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
      await refreshUnread();
    }
    if (notif.type === 'message') navigation.navigate('MainTabs', { screen: 'Messages' });
    if (notif.type === 'follow') {
      const followerId = (notif.data as any)?.follower_id;
      if (followerId) navigation.navigate('Profile', { user: { id: followerId } });
    }
  };

  const togglePref = async (key: string, value: boolean) => {
    if (!user) return;
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    await updateNotificationPreferences(user.id, updated);
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.prefs}>
        <Text style={styles.prefsTitle}>Preferences</Text>
        {[
          { key: 'follow_enabled', label: 'New followers' },
          { key: 'message_enabled', label: 'Messages' },
          { key: 'like_enabled', label: 'Likes' },
        ].map(({ key, label }) => (
          <View key={key} style={styles.prefRow}>
            <Text style={styles.prefLabel}>{label}</Text>
            <Switch
              value={(prefs as any)[key]}
              onValueChange={(v) => togglePref(key, v)}
            />
          </View>
        ))}
        <TouchableOpacity style={styles.markAll} onPress={clearUnread}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, !item.read && styles.unread]}
            onPress={() => handlePress(item)}
          >
            <Ionicons name={iconMap[item.type] || 'notifications'} size={22} color="#3498db" />
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              {item.body && <Text style={styles.body} numberOfLines={2}>{item.body}</Text>}
              <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  prefs: { backgroundColor: 'white', padding: 16, borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  prefsTitle: { fontWeight: '700', marginBottom: 8, color: '#2c3e50' },
  prefRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  prefLabel: { color: '#636e72' },
  markAll: { marginTop: 8, alignSelf: 'flex-end' },
  markAllText: { color: '#3498db', fontWeight: '600' },
  row: { flexDirection: 'row', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f1f1', gap: 12 },
  unread: { backgroundColor: '#ebf5fb' },
  content: { flex: 1 },
  title: { fontWeight: '700', color: '#2c3e50' },
  body: { color: '#636e72', marginTop: 2, fontSize: 13 },
  time: { color: '#bdc3c7', fontSize: 11, marginTop: 4 },
  empty: { textAlign: 'center', color: '#95a5a6', marginTop: 40 },
});

export default NotificationsScreen;
