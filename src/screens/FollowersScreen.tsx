import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import FollowUserRow from '../components/FollowUserRow';
import {
  getFollowers,
  toggleFollow,
  isFollowing,
  FollowUser,
} from '../services/followService';
import { openAuthorProfile } from '../navigation/navigationHelpers';

const FollowersScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;
  const userId = route.params?.userId;
  const isOwnList = currentUser?.id === userId;

  const [users, setUsers] = useState<FollowUser[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getFollowers(userId);
      setUsers(data);
      if (currentUser) {
        const map: Record<string, boolean> = {};
        await Promise.all(
          data.map(async (u) => {
            map[u.id] = await isFollowing(currentUser.id, u.id);
          }),
        );
        setFollowingMap(map);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, currentUser]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleFollowBack = async (followerId: string) => {
    if (!currentUser) return;
    setActionId(followerId);
    try {
      const nowFollowing = await toggleFollow(currentUser.id, followerId);
      setFollowingMap((prev) => ({ ...prev, [followerId]: nowFollowing }));
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <Ionicons name="person-outline" size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No followers yet</Text>
      <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
        {isOwnList
          ? 'Share your poems and engage with the community to grow your audience.'
          : 'This poet has no followers yet.'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Followers</Text>
        <Text style={[styles.headerCount, { color: colors.textSecondary }]}>{users.length}</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => {
          const alreadyFollowing = followingMap[item.id];
          const isSelf = item.id === currentUser?.id;
          const showAction = isOwnList && currentUser && !isSelf;

          return (
            <FollowUserRow
              user={item}
              colors={colors}
              actionLabel={
                showAction ? (alreadyFollowing ? 'Following' : 'Follow back') : undefined
              }
              actionVariant={alreadyFollowing ? 'secondary' : 'primary'}
              onPress={() => openAuthorProfile(navigation, item)}
              onAction={showAction ? () => handleFollowBack(item.id) : undefined}
              actionLoading={actionId === item.id}
            />
          );
        }}
      />
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  headerCount: { fontSize: 14, fontWeight: '600' },
  emptyWrap: { alignItems: 'center', padding: 32, marginTop: 24 },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: 16 },
  emptyHint: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: 16 },
});

export default FollowersScreen;
