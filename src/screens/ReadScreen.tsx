import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PoemCard from '../components/PoemCard';
import PoemFilter from '../components/PoemFilter';
import ScreenContainer from '../components/layout/ScreenContainer';
import EmptyState from '../components/ui/EmptyState';
import SkeletonPoemCard from '../components/loaders/SkeletonPoemCard';
import { Poem, PoemFilters, PoemSort, ShuffleCursor } from '../types/poem';
import { fetchPoems, incrementPoemLikes } from '../services/poemService';
import { openAuthorProfile, openPoemDetail } from '../navigation/navigationHelpers';
import { getFollowingIds } from '../services/followService';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { hapticLight } from '../utils/haptics';

const PAGE_SIZE = 20;

type ReadScreenProps = { feedMode?: 'all' | 'following' };

const ReadScreen = ({ feedMode = 'all' }: ReadScreenProps) => {
  const { user } = useUser();
  const { theme } = useTheme();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<PoemFilters>({
    era: null,
    theme: null,
    form: null,
    language: null,
    authorId: null,
  });
  const [sort, setSort] = useState<PoemSort>('random');
  const feedSeed = useRef(String(Math.random()));
  const pageRef = useRef(0);
  const cursorRef = useRef<ShuffleCursor | null>(null);
  const navigation = useNavigation<any>();

  const loadPage = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const followingIds = feedMode === 'following' && user?.id
          ? await getFollowingIds(user.id)
          : undefined;

        const pageToLoad = reset ? 0 : pageRef.current + 1;
        const result = await fetchPoems({
          limit: PAGE_SIZE,
          page: pageToLoad,
          filters: {
            ...filters,
            followingOnly: feedMode === 'following',
            followingIds,
          },
          sort,
          shuffleSeed: feedSeed.current,
          shuffleCursor: sort === 'random'
            ? (reset
              ? { start: Number(feedSeed.current), after: null, wrapped: false }
              : cursorRef.current)
            : null,
        });

        setPoems((prev) => (reset ? result.poems : [...prev, ...result.poems]));
        setHasMore(result.hasMore);
        pageRef.current = pageToLoad;
        cursorRef.current = result.shuffleCursor ?? null;
      } catch (error) {
        console.error('Error fetching poems:', error);
      } finally {
        setLoading(false);
        if (refreshing) setRefreshing(false);
      }
    },
    [filters, sort, refreshing, feedMode, user?.id],
  );

  useEffect(() => {
    loadPage(true);
  }, [filters, sort, feedMode]);

  const handleRefresh = () => {
    feedSeed.current = String(Math.random());
    cursorRef.current = null;
    setRefreshing(true);
    setHasMore(true);
    hapticLight();
    loadPage(true);
  };

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    loadPage(false);
  };

  const handleViewPoem = (poem: Poem) => {
    openPoemDetail(navigation, poem);
  };

  const handleViewAuthor = (author: { id: string; name?: string }) => {
    openAuthorProfile(navigation, { id: author.id, name: author.name || 'Unknown' });
  };

  const handleLike = async (poemId: string) => {
    setPoems((prev) =>
      prev.map((poem) =>
        poem.id === poemId
          ? { ...poem, like_count: (poem.like_count || 0) + 1 }
          : poem,
      ),
    );
    try {
      await incrementPoemLikes(poemId);
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: Poem }) => (
      <PoemCard
        poem={item}
        onPress={() => handleViewPoem(item)}
        onAuthorPress={() => handleViewAuthor(item.author as { id: string; name?: string })}
        onLike={() => handleLike(item.id)}
        onRemove={(poemId) => setPoems((prev) => prev.filter((poem) => poem.id !== poemId))}
      />
    ),
    [navigation],
  );

  const emptyMessage = feedMode === 'following'
    ? 'Follow poets to see their verses here.'
    : 'No poems yet. Check back soon.';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bgCanvas }]}>
      <PoemFilter
        currentFilters={filters}
        currentSort={sort}
        onFilterChange={setFilters}
        onSortChange={setSort}
      />

      <ScreenContainer edges={[]} contentStyle={styles.feedContent}>
        <FlatList
          data={poems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews={Platform.OS === 'android'}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !loading ? (
              <EmptyState
                icon="book-outline"
                title="No poems yet"
                description={emptyMessage}
              />
            ) : null
          }
          ListFooterComponent={
            loading && !refreshing ? (
              <View>
                <SkeletonPoemCard />
                <SkeletonPoemCard />
              </View>
            ) : null
          }
        />
      </ScreenContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  feedContent: { flex: 1 },
  list: { paddingTop: 4, paddingBottom: 28 },
});

export default ReadScreen;
