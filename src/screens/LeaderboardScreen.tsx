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
import { openUserProfile } from '../navigation/navigationHelpers';
import { palette } from '../theme/tokens/colors';

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
        <ActivityIndicator size="large" color={palette.emerald} />
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
        <Ionicons name="people" size={16} color={friendsOnly ? 'white' : palette.emerald} />
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
              onPress={() => openUserProfile(navigation, item.user_id, user?.id)}
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
  container: { flex: 1, backgroundColor: palette.canvas },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  myRank: {
    backgroundColor: palette.emerald,
    padding: 20,
    alignItems: 'center',
  },
  myRankLabel: { color: palette.ink, fontSize: 13 },
  myRankValue: { color: palette.ink, fontSize: 36, fontWeight: '800' },
  myRankXp: { color: palette.ink, fontSize: 14, marginTop: 4 },
  filters: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: palette.spruce,
    alignItems: 'center',
  },
  filterActive: { backgroundColor: palette.emerald },
  filterText: { color: palette.ghost, fontWeight: '600' },
  filterTextActive: { color: palette.ink },
  friendsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.emerald,
    marginBottom: 8,
  },
  friendsActive: { backgroundColor: palette.emerald },
  friendsText: { color: palette.emerald, fontWeight: '600' },
  friendsTextActive: { color: palette.ink },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.spruce,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 14,
    borderRadius: 12,
    elevation: 1,
  },
  rowMe: { borderWidth: 2, borderColor: palette.emerald },
  rank: { width: 40, fontWeight: '800', fontSize: 16, color: palette.parchment },
  info: { flex: 1 },
  name: { fontWeight: '700', color: palette.parchment },
  streak: { fontSize: 12, color: palette.ghost, marginTop: 2 },
  xp: { fontWeight: '700', color: palette.emerald },
  empty: { textAlign: 'center', color: palette.ghost, marginTop: 40 },
});

export default LeaderboardScreen;
