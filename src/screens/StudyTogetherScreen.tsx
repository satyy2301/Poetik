import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import {
  fetchFriendsProgress,
  getRecommendedLessons,
  FriendProgress,
} from '../services/socialLearningService';
import StreakCounter from '../components/StreakCounter';

const StudyTogetherScreen = () => {
  const { user } = useUser();
  const [friends, setFriends] = useState<FriendProgress[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [friendData, recs] = await Promise.all([
        fetchFriendsProgress(user.id),
        getRecommendedLessons(user.id),
      ]);
      setFriends(friendData);
      setRecommendations(recs);
    } catch (err) {
      console.warn('study together load failed', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onlineCount = friends.filter((f) => f.activeToday).length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={friends}
      keyExtractor={(item) => item.userId}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View>
          <View style={styles.hero}>
            <Ionicons name="people" size={32} color="#3498db" />
            <Text style={styles.heroTitle}>Study Together</Text>
            <Text style={styles.heroSub}>
              {onlineCount} friend{onlineCount !== 1 ? 's' : ''} active today
            </Text>
          </View>

          {recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended for you</Text>
              {recommendations.map((lesson) => (
                <View key={lesson.id} style={styles.recCard}>
                  <Text style={styles.recTitle}>{lesson.title}</Text>
                  <Text style={styles.recReason}>{lesson.reason}</Text>
                  <Text style={styles.recXp}>+{lesson.xp_reward} XP</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.sectionTitle}>Friends Progress</Text>
          {friends.length === 0 && (
            <Text style={styles.empty}>
              Follow other poets to study together and see their progress.
            </Text>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.friendCard}>
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>{item.displayName}</Text>
            <Text style={styles.friendMeta}>
              {item.lessonsCompleted} lessons · {item.xp} XP
            </Text>
            {item.activeToday && (
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Active today</Text>
              </View>
            )}
          </View>
          <StreakCounter streak={item.streak} size="sm" />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  heroTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 8, color: '#2c3e50' },
  heroSub: { color: '#7f8c8d', marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  recCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
  },
  recTitle: { fontWeight: '700', color: '#2c3e50' },
  recReason: { color: '#7f8c8d', fontSize: 13, marginTop: 4 },
  recXp: { color: '#2ecc71', fontWeight: '600', marginTop: 6 },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    elevation: 1,
  },
  friendInfo: { flex: 1 },
  friendName: { fontWeight: '700', color: '#2c3e50', fontSize: 16 },
  friendMeta: { color: '#7f8c8d', fontSize: 13, marginTop: 2 },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ecc71',
    marginRight: 6,
  },
  onlineText: { fontSize: 12, color: '#2ecc71', fontWeight: '600' },
  empty: {
    textAlign: 'center',
    color: '#95a5a6',
    padding: 24,
  },
});

export default StudyTogetherScreen;
