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
  getFollowing,
  getFollowSuggestions,
  toggleFollow,
  FollowUser,
} from '../services/followService';
import { openAuthorProfile } from '../navigation/navigationHelpers';

const FollowingScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;
  const userId = route.params?.userId;
  const isOwnList = currentUser?.id === userId;

  const [users, setUsers] = useState<FollowUser[]>([]);
  const [suggestions, setSuggestions] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getFollowing(userId);
      setUsers(data);
      if (isOwnList && currentUser) {
        const suggested = await getFollowSuggestions(currentUser.id, 5);
        setSuggestions(suggested);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, isOwnList, currentUser]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleUnfollow = async (followeeId: string) => {
    if (!currentUser || !isOwnList) return;
    setActionId(followeeId);
    try {
      await toggleFollow(currentUser.id, followeeId);
      setUsers((prev) => prev.filter((u) => u.id !== followeeId));
    } finally {
      setActionId(null);
    }
  };

  const handleFollowSuggestion = async (author: FollowUser) => {
    if (!currentUser) return;
    setActionId(author.id);
    try {
      const nowFollowing = await toggleFollow(currentUser.id, author.id);
      if (nowFollowing) {
        setUsers((prev) => [...prev, author]);
        setSuggestions((prev) => prev.filter((s) => s.id !== author.id));
      }
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
      <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {isOwnList ? "You're not following anyone yet" : 'Not following anyone yet'}
      </Text>
      <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
        Discover poets and follow them to see their work in your feed.
      </Text>
      {isOwnList && (
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('App', { screen: 'Read' })}
        >
          <Text style={styles.ctaText}>Explore poems</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSuggestions = () => {
    if (!isOwnList || !suggestions.length) return null;
    return (
      <View style={[styles.suggestions, { borderTopColor: colors.border }]}>
        <Text style={[styles.suggestionsTitle, { color: colors.text }]}>Suggested poets</Text>
        {suggestions.map((author) => (
          <FollowUserRow
            key={author.id}
            user={author}
            colors={colors}
            actionLabel="Follow"
            onPress={() => openAuthorProfile(navigation, author)}
            onAction={() => handleFollowSuggestion(author)}
            actionLoading={actionId === author.id}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Following</Text>
        <Text style={[styles.headerCount, { color: colors.textSecondary }]}>{users.length}</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderSuggestions}
        renderItem={({ item }) => (
          <FollowUserRow
            user={item}
            colors={colors}
            actionLabel={isOwnList ? 'Following' : undefined}
            actionVariant="secondary"
            onPress={() => openAuthorProfile(navigation, item)}
            onAction={isOwnList ? () => handleUnfollow(item.id) : undefined}
            actionLoading={actionId === item.id}
          />
        )}
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
  emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  emptyHint: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  ctaBtn: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  ctaText: { color: '#fff', fontWeight: '700' },
  suggestions: { borderTopWidth: 1, marginTop: 8 },
  suggestionsTitle: { fontSize: 15, fontWeight: '700', padding: 16, paddingBottom: 4 },
});

export default FollowingScreen;
