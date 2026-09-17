import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import {
  fetchUserActivity,
  fetchFriendsActivity,
  fetchAllActivity,
  activityLabel,
  ActivityEvent,
} from '../services/activityService';
import { openAuthorProfile, openPoemDetail } from '../navigation/navigationHelpers';

type FeedFilter = 'own' | 'friends' | 'all';

const ActivityFeedScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<FeedFilter>('friends');
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      let data: ActivityEvent[] = [];
      if (filter === 'own') data = await fetchUserActivity(user.id);
      else if (filter === 'friends') data = await fetchFriendsActivity(user.id);
      else data = await fetchAllActivity();
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handlePress = (event: ActivityEvent) => {
    if (event.event_type === 'followed' && event.target_id) {
      openAuthorProfile(navigation, event.target_id);
    }
    if (event.event_type === 'published' && event.target_id) {
      openPoemDetail(navigation, event.target_id);
    }
    if (event.event_type === 'liked' && event.target_id) {
      openPoemDetail(navigation, event.target_id);
    }
    if (event.event_type === 'shared_playlist' && event.target_id) {
      navigation.navigate('PublicPlaylist', { slug: (event.metadata as any)?.share_slug });
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        {(['own', 'friends', 'all'] as FeedFilter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'own' ? 'My Activity' : f === 'friends' ? 'Friends' : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No activity yet</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => handlePress(item)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.user as any)?.name?.[0] || 'P'}</Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.text}>
                <Text style={styles.name}>{(item.user as any)?.name || 'Poet'}</Text>
                {' '}{activityLabel(item)}
              </Text>
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
  filters: { flexDirection: 'row', padding: 12, gap: 8 },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: 20, backgroundColor: 'white', alignItems: 'center' },
  filterActive: { backgroundColor: '#3498db' },
  filterText: { color: '#636e72', fontWeight: '600', fontSize: 13 },
  filterTextActive: { color: 'white' },
  row: { flexDirection: 'row', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#3498db', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: 'white', fontWeight: '700' },
  content: { flex: 1 },
  text: { color: '#2c3e50', lineHeight: 20 },
  name: { fontWeight: '700' },
  time: { color: '#bdc3c7', fontSize: 11, marginTop: 4 },
  empty: { textAlign: 'center', color: '#95a5a6', marginTop: 40 },
});

export default ActivityFeedScreen;
