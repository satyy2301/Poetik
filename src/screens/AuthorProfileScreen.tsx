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
import { Author, AuthorStats } from '../types/author';
import { Poem } from '../types/poem';
import {
  getAuthorById,
  getAuthorPoems,
  getAuthorStats,
} from '../services/authorService';
import { incrementPoemLikes } from '../services/poemService';

const PAGE_SIZE = 20;

const AuthorProfileScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user: currentUser } = useAuth();

  const initialAuthor: Author | undefined = route.params?.author;
  const authorId: string = route.params?.authorId || initialAuthor?.id;

  const [author, setAuthor] = useState<Author | null>(initialAuthor || null);
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

      const [poemsResult, stats] = await Promise.all([
        getAuthorPoems(authorId, 0, PAGE_SIZE),
        getAuthorStats(authorId),
      ]);

      setAuthorPoems(poemsResult.poems);
      setHasMore(poemsResult.hasMore);
      setAuthorStats(stats);
      setPage(0);
    } catch (err: any) {
      setError(err.message || 'Failed to load author');
    } finally {
      setIsLoading(false);
    }
  }, [authorId, initialAuthor]);

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
    navigation.navigate('PoemDetail', { poem });
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

  const renderHeader = () => (
    <>
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{authorStats.totalPoems}</Text>
          <Text style={styles.statLabel}>Poems</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{authorStats.totalLikes}</Text>
          <Text style={styles.statLabel}>Total Likes</Text>
        </View>
        {authorStats.mostUsedForm ? (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{authorStats.mostUsedForm}</Text>
            <Text style={styles.statLabel}>Favorite Form</Text>
          </View>
        ) : null}
      </View>

      {author?.bio ? (
        <View style={styles.bioSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{author.bio}</Text>
        </View>
      ) : null}

      {authorStats.themes.length > 0 ? (
        <View style={styles.themesSection}>
          <Text style={styles.sectionTitle}>Popular Themes</Text>
          <View style={styles.themesContainer}>
            {authorStats.themes.map((theme) => (
              <View key={theme} style={styles.themePill}>
                <Text style={styles.themeText}>{theme}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <Text style={[styles.sectionTitle, styles.poemsHeading]}>
        Poems by {author?.name}
      </Text>
    </>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading author profile...</Text>
      </View>
    );
  }

  if (error || !author) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error || 'Author not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const years = formatYears();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{author.name}</Text>
          <Text style={styles.authorSubtitle}>
            {author.canonical ? 'Canonical Poet' : 'Poet & Author'}
            {years ? ` · ${years}` : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.followButton} disabled>
          <Text style={styles.followButtonText}>Follow</Text>
          <Text style={styles.comingSoonHint}>Coming soon</Text>
        </TouchableOpacity>
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
          isLoadingMore ? <ActivityIndicator style={styles.footerLoader} /> : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="library-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No poems found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: { marginTop: 15, fontSize: 16, color: '#7f8c8d' },
  errorText: { fontSize: 16, color: '#e74c3c', marginBottom: 12 },
  backLink: { color: '#3498db', fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  backButton: { padding: 8, marginRight: 10 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50' },
  authorSubtitle: { fontSize: 14, color: '#7f8c8d', marginTop: 4 },
  followButton: {
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    opacity: 0.7,
  },
  followButtonText: { color: '#636e72', fontWeight: '600', fontSize: 13 },
  comingSoonHint: { color: '#95a5a6', fontSize: 10, marginTop: 2 },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 20,
    marginBottom: 8,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  statValue: { fontSize: 16, fontWeight: '600', color: '#3498db' },
  statLabel: { fontSize: 14, color: '#7f8c8d', marginTop: 4 },
  bioSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 8,
  },
  bioText: { fontSize: 15, lineHeight: 22, color: '#34495e' },
  themesSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  poemsHeading: { paddingHorizontal: 15, paddingTop: 8 },
  themesContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  themePill: {
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  themeText: { fontSize: 14, color: '#1976d2', fontWeight: '500' },
  poemsList: { paddingBottom: 24 },
  emptyContainer: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 16, color: '#7f8c8d', marginTop: 12 },
  footerLoader: { marginVertical: 16 },
});

export default AuthorProfileScreen;
