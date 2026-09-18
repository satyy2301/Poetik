import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PoemCard from '../components/PoemCard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Author, AuthorStats } from '../types/author';
import { Poem } from '../types/poem';
import {
  getAuthorById,
  getAuthorPoems,
  getAuthorStats,
  resolveAuthorAccountId,
} from '../services/authorService';
import { incrementPoemLikes } from '../services/poemService';
import { openPoemDetail, openChat } from '../navigation/navigationHelpers';
import {
  isFollowing,
  toggleFollow,
  getFollowCounts,
} from '../services/followService';
import ReportModal from '../components/ReportModal';

const PAGE_SIZE = 20;

const AuthorProfileScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;

  const initialAuthor: Author | undefined = route.params?.author;
  const authorId: string = route.params?.authorId || initialAuthor?.id;

  const [author, setAuthor] = useState<Author | null>(initialAuthor || null);
  const [accountUserId, setAccountUserId] = useState<string | null>(null);
  const [authorPoems, setAuthorPoems] = useState<Poem[]>([]);
  const [authorStats, setAuthorStats] = useState<AuthorStats>({
    totalPoems: 0,
    totalLikes: 0,
    themes: [],
    mostUsedForm: '',
  });
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });
  const [followLoading, setFollowLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const isOwnProfile = currentUser?.id === accountUserId;
  const canInteract = !!accountUserId && !isOwnProfile;

  const loadAuthor = useCallback(async () => {
    if (!authorId) {
      setError('Author not found');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const authorData = initialAuthor || (await getAuthorById(authorId));
      if (!authorData) {
        setError('Author not found');
        return;
      }

      setAuthor(authorData);
      const resolvedAccountId = await resolveAuthorAccountId(authorId);
      setAccountUserId(resolvedAccountId);

      const countUserId = resolvedAccountId || authorId;
      const [poemsResult, stats, counts] = await Promise.all([
        getAuthorPoems(authorId, 0, PAGE_SIZE),
        getAuthorStats(authorId),
        getFollowCounts(countUserId),
      ]);

      setAuthorPoems(poemsResult.poems);
      setHasMore(poemsResult.hasMore);
      setAuthorStats(stats);
      setFollowCounts(counts);
      setPage(0);

      if (currentUser && resolvedAccountId && currentUser.id !== resolvedAccountId) {
        setFollowing(await isFollowing(currentUser.id, resolvedAccountId));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load author');
    } finally {
      setIsLoading(false);
    }
  }, [authorId, initialAuthor, currentUser]);

  useEffect(() => {
    loadAuthor();
  }, [loadAuthor]);

  const loadMorePoems = async () => {
    if (!hasMore || isLoadingMore || !authorId) return;

    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await getAuthorPoems(authorId, nextPage, PAGE_SIZE);
      setAuthorPoems((prev) => [...prev, ...result.poems]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch (err: any) {
      console.error('Load more poems failed:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handlePoemPress = (poem: Poem) => {
    openPoemDetail(navigation, poem);
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !accountUserId) return;
    setFollowLoading(true);
    try {
      const nowFollowing = await toggleFollow(currentUser.id, accountUserId);
      setFollowing(nowFollowing);
      setFollowCounts((prev) => ({
        ...prev,
        followers: nowFollowing ? prev.followers + 1 : prev.followers - 1,
      }));
    } catch {
      Alert.alert('Error', 'Could not update follow status. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    if (!accountUserId || !author) return;
    openChat(navigation, accountUserId, author.name);
  };

  const handlePoemLike = async (poemId: string) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to like poems');
      return;
    }

    try {
      await incrementPoemLikes(poemId);
      setAuthorPoems((prev) =>
        prev.map((poem) =>
          poem.id === poemId
            ? { ...poem, like_count: (poem.like_count || 0) + 1 }
            : poem,
        ),
      );
      setAuthorStats((prev) => ({ ...prev, totalLikes: prev.totalLikes + 1 }));
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const formatYears = () => {
    if (!author?.birth_year && !author?.death_year) return null;
    if (author.birth_year && author.death_year) {
      return `${author.birth_year} – ${author.death_year}`;
    }
    return String(author.birth_year || author.death_year);
  };

  const countUserId = accountUserId || authorId;

  const renderHeader = () => (
    <>
      <View style={[styles.statsSection, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => navigation.navigate('Followers', { userId: countUserId })}
        >
          <Text style={[styles.statNumber, { color: colors.text }]}>{followCounts.followers}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => navigation.navigate('Following', { userId: countUserId })}
        >
          <Text style={[styles.statNumber, { color: colors.text }]}>{followCounts.following}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
        </TouchableOpacity>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>{authorStats.totalPoems}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Poems</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>{authorStats.totalLikes}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Likes</Text>
        </View>
      </View>

      {author?.bio ? (
        <View style={[styles.bioSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.bioText, { color: colors.text }]}>{author.bio}</Text>
        </View>
      ) : null}

      {authorStats.themes.length > 0 ? (
        <View style={[styles.themesSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Themes</Text>
          <View style={styles.themesContainer}>
            {authorStats.themes.map((t) => (
              <View key={t} style={[styles.themePill, { backgroundColor: colors.background }]}>
                <Text style={[styles.themeText, { color: colors.primary }]}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <Text style={[styles.sectionTitle, styles.poemsHeading, { color: colors.text }]}>
        Poems by {author?.name}
      </Text>
    </>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading author profile...</Text>
      </View>
    );
  }

  if (error || !author) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>{error || 'Author not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const years = formatYears();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.authorInfo}>
          <Text style={[styles.authorName, { color: colors.text }]}>{author.name}</Text>
          <Text style={[styles.authorSubtitle, { color: colors.textSecondary }]}>
            {author.canonical ? 'Canonical Poet' : 'Poet & Author'}
            {years ? ` · ${years}` : ''}
          </Text>
        </View>
        {canInteract && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[
                styles.followButton,
                following
                  ? { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }
                  : { backgroundColor: colors.primary },
              ]}
              onPress={handleFollowToggle}
              disabled={followLoading}
            >
              <Text
                style={[
                  styles.followButtonText,
                  { color: following ? colors.textSecondary : '#fff' },
                ]}
              >
                {following ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.messageButton, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
              <Text style={[styles.messageButtonText, { color: colors.primary }]}>Message</Text>
            </TouchableOpacity>
            {accountUserId && (
              <TouchableOpacity
                style={[styles.messageButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => setShowReportModal(true)}
              >
                <Ionicons name="flag-outline" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}
        {!canInteract && author.canonical && (
          <View style={[styles.readOnlyBadge, { backgroundColor: colors.background }]}>
            <Text style={[styles.readOnlyText, { color: colors.textSecondary }]}>Historical</Text>
          </View>
        )}
      </View>

      <FlatList
        data={authorPoems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PoemCard
            poem={item}
            onPress={() => handlePoemPress(item)}
            onAuthorPress={() => {}}
            onLike={() => handlePoemLike(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.poemsList}
        onEndReached={loadMorePoems}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isLoadingMore ? <ActivityIndicator style={styles.footerLoader} color={colors.primary} /> : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="library-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No poems found</Text>
          </View>
        }
      />

      {currentUser && accountUserId && (
        <ReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          reporterId={currentUser.id}
          targetType="user"
          targetId={accountUserId}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 15, fontSize: 16 },
  errorText: { fontSize: 16, color: '#e74c3c', marginBottom: 12 },
  backLink: { fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8, marginRight: 8 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 20, fontWeight: 'bold' },
  authorSubtitle: { fontSize: 13, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 8 },
  followButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: { fontWeight: '700', fontSize: 13 },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  messageButtonText: { fontWeight: '600', fontSize: 13 },
  readOnlyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  readOnlyText: { fontSize: 12, fontWeight: '600' },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginBottom: 8,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 13, marginTop: 4 },
  bioSection: { padding: 20, marginBottom: 8 },
  bioText: { fontSize: 15, lineHeight: 22 },
  themesSection: { padding: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 12 },
  poemsHeading: { paddingHorizontal: 15, paddingTop: 8 },
  themesContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  themePill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  themeText: { fontSize: 14, fontWeight: '500' },
  poemsList: { paddingBottom: 24 },
  emptyContainer: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 16, marginTop: 12 },
  footerLoader: { marginVertical: 16 },
});

export default AuthorProfileScreen;
