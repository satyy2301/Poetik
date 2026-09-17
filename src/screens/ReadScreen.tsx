import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PoemCard from '../components/PoemCard';
import PoemFilter from '../components/PoemFilter';
import { Poem, PoemFilters, PoemSort } from '../types/poem';
import { fetchPoems, incrementPoemLikes } from '../services/poemService';
import { getFollowingIds } from '../services/followService';
import { useUser } from '../context/UserContext';

const PAGE_SIZE = 20;

type ReadScreenProps = { feedMode?: 'all' | 'following' };

const ReadScreen = ({ feedMode = 'all' }: ReadScreenProps) => {
  const { user } = useUser();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<PoemFilters>({
    era: null,
    theme: null,
    form: null,
    authorId: null,
  });
  const [sort, setSort] = useState<PoemSort>('newest');
  const navigation = useNavigation<any>();

  const loadPage = useCallback(
    async (pageToLoad: number, reset = false) => {
      setLoading(true);
      try {
        const followingIds = feedMode === 'following' && user?.id
          ? await getFollowingIds(user.id)
          : undefined;

        const result = await fetchPoems({
          limit: PAGE_SIZE,
          page: pageToLoad,
          filters: {
            ...filters,
            followingOnly: feedMode === 'following',
            followingIds,
          },
          sort,
        });

        setPoems((prev) => (reset ? result.poems : [...prev, ...result.poems]));
        setHasMore(result.hasMore);
        setPage(pageToLoad);
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
    loadPage(0, true);
  }, [filters, sort, feedMode]);

  const handleRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    loadPage(0, true);
  };

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    loadPage(page + 1, false);
  };

  const handleViewPoem = (poem: Poem) => {
    navigation.navigate('PoemDetail', { poem });
  };

  const handleViewAuthor = (author: { id: string; name?: string }) => {
    navigation.navigate('AuthorProfile', {
      author: { id: author.id, name: author.name || 'Unknown' },
    });
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
      />
    ),
    [navigation],
  );

  return (
    <View style={styles.container}>
      <PoemFilter
        currentFilters={filters}
        currentSort={sort}
        onFilterChange={setFilters}
        onSortChange={setSort}
      />

      <FlatList
        data={poems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No poems yet. Check back soon.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator style={styles.loading} size="large" />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loading: { marginVertical: 20 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#7f8c8d', fontSize: 16 },
});

export default ReadScreen;
