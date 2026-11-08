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
  fetchAllAchievements,
  fetchUserAchievements,
} from '../services/achievementService';
import { Achievement, UserAchievement } from '../types/achievement';
import { palette } from '../theme/tokens/colors';

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  book: 'book',
  flame: 'flame',
  star: 'star',
  ribbon: 'ribbon',
  'help-circle': 'help-circle',
  'checkmark-circle': 'checkmark-circle',
  create: 'create',
  medal: 'medal',
  trophy: 'trophy',
  school: 'school',
};

const AchievementsScreen = () => {
  const { user } = useUser();
  const [all, setAll] = useState<Achievement[]>([]);
  const [earned, setEarned] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [achievements, userAchievements] = await Promise.all([
        fetchAllAchievements(),
        fetchUserAchievements(user.id),
      ]);
      setAll(achievements);
      setEarned(userAchievements);
    } catch (err) {
      console.warn('load achievements failed', err);
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

  const earnedIds = new Set(earned.map((a) => a.id));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.emerald} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Your Badges</Text>
        <Text style={styles.summaryCount}>
          {earned.length} / {all.length} unlocked
        </Text>
      </View>

      <FlatList
        data={all}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const unlocked = earnedIds.has(item.id);
          const iconName = iconMap[item.icon] || 'trophy';

          return (
            <View style={[styles.card, !unlocked && styles.cardLocked]}>
              <View style={[styles.iconCircle, !unlocked && styles.iconLocked]}>
                <Ionicons
                  name={iconName}
                  size={28}
                  color={unlocked ? palette.mint : palette.ghost}
                />
              </View>
              <Text style={[styles.name, !unlocked && styles.textLocked]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
              {unlocked && <Text style={styles.xp}>+{item.xp_reward} XP</Text>}
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.canvas },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summary: {
    padding: 20,
    backgroundColor: palette.spruce,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  summaryTitle: { fontSize: 22, fontWeight: 'bold', color: palette.parchment },
  summaryCount: { color: palette.glacial, marginTop: 4 },
  list: { padding: 12 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: {
    width: '48%',
    backgroundColor: palette.spruce,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
  },
  cardLocked: { opacity: 0.65 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.malachite,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconLocked: { backgroundColor: palette.border },
  name: { fontWeight: '700', color: palette.parchment, textAlign: 'center' },
  textLocked: { color: palette.ghost },
  desc: {
    fontSize: 12,
    color: palette.glacial,
    textAlign: 'center',
    marginTop: 4,
    minHeight: 32,
  },
  xp: { color: palette.emerald, fontSize: 12, fontWeight: '700', marginTop: 6 },
});

export default AchievementsScreen;
