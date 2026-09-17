import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import {
  fetchLeaderboard,
  fetchFriendsLeaderboard,
  fetchUserRank,
  LeaderboardEntry,
  LeaderboardPeriod,
} from '../services/leaderboardService';

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'weekly', label: 'Week' },
  { key: 'monthly', label: 'Month' },
  { key: 'all', label: 'All Time' },
];

const LeaderboardScreen = () => {
  const { user } = useUser();
  const navigation = useNavigation<any>();
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const [friendsOnly, setFriendsOnly] = useState(false);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<{ rank: number; xp: number; totalUsers: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [board, rank] = await Promise.all([
        friendsOnly
          ? fetchFriendsLeaderboard(user.id, period)
          : fetchLeaderboard(period),
        fetchUserRank(user.id, period),
      ]);
      setEntries(board);
      setUserRank(rank);
    } catch (err) {
      console.warn('leaderboard load failed', err);
    } finally {
      setLoading(false);
    }
  }, [user, period, friendsOnly]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const rankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userRank && (
        <View style={styles.myRank}>
          <Text style={styles.myRankLabel}>Your Rank</Text>
          <Text style={styles.myRankValue}>#{userRank.rank || '—'}</Text>
          <Text style={styles.myRankXp}>{userRank.xp} XP</Text>
        </View>
      )}

      <View style={styles.filters}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.filterBtn, period === p.key && styles.filterActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.filterText, period === p.key && styles.filterTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.friendsToggle, friendsOnly && styles.friendsActive]}
        onPress={() => setFriendsOnly(!friendsOnly)}
      >
        <Ionicons name="people" size={16} color={friendsOnly ? 'white' : '#3498db'} />
        <Text style={[styles.friendsText, friendsOnly && styles.friendsTextActive]}>
          Friends only
        </Text>
      </TouchableOpacity>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.user_id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {friendsOnly ? 'Follow poets to see friends here.' : 'No rankings yet.'}
          </Text>
        }
        renderItem={({ item }) => {
          const medal = rankIcon(item.rank);
          const isMe = item.user_id === user?.id;

          return (
            <TouchableOpacity
              style={[styles.row, isMe && styles.rowMe]}
              onPress={() =>
                navigation.navigate('Profile', { user: { id: item.user_id, email: item.display_name } })
              }
            >
              <Text style={styles.rank}>
                {medal || `#${item.rank}`}
              </Text>
              <View style={styles.info}>
                <Text style={styles.name}>
                  {item.display_name}{isMe ? ' (You)' : ''}
                </Text>
                <Text style={styles.streak}>{item.streak} day streak</Text>
              </View>
              <Text style={styles.xp}>{item.xp} XP</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  myRank: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
  },
  myRankLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  myRankValue: { color: 'white', fontSize: 36, fontWeight: '800' },
  myRankXp: { color: 'white', fontSize: 14, marginTop: 4 },
  filters: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  filterActive: { backgroundColor: '#0984e3' },
  filterText: { color: '#636e72', fontWeight: '600' },
  filterTextActive: { color: 'white' },
  friendsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3498db',
    marginBottom: 8,
  },
  friendsActive: { backgroundColor: '#3498db' },
  friendsText: { color: '#3498db', fontWeight: '600' },
  friendsTextActive: { color: 'white' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    elevation: 1,
  },
  rowMe: { borderWidth: 2, borderColor: '#3498db' },
  rank: { width: 40, fontWeight: '800', fontSize: 16, color: '#2c3e50' },
  info: { flex: 1 },
  name: { fontWeight: '700', color: '#2c3e50' },
  streak: { fontSize: 12, color: '#95a5a6', marginTop: 2 },
  xp: { fontWeight: '700', color: '#0984e3' },
  empty: { textAlign: 'center', color: '#95a5a6', marginTop: 40 },
});

export default LeaderboardScreen;
