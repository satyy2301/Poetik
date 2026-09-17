import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PoemCard from '../components/PoemCard';
import { searchPoems, incrementPoemLikes } from '../services/poemService';
import { searchAuthors } from '../services/authorService';
import { Poem } from '../types/poem';
import { Author } from '../types/author';
import { openAuthorProfile, openPoemDetail, openUserProfile } from '../navigation/navigationHelpers';
import { useAuth } from '../context/AuthContext';

type SearchResult =
  | { id: string; type: 'poem'; data: Poem }
  | { id: string; type: 'author'; data: Author & { poems?: { count: number }[] } }
  | { id: string; type: 'user'; data: Author & { poems?: { count: number }[] } };

const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'poems' | 'authors' | 'users'>('all');
  const [poemFormFilter, setPoemFormFilter] = useState<string | null>(null);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, activeFilter, poemFormFilter]);

  const performSearch = async () => {
    setIsLoading(true);

    try {
      const results: SearchResult[] = [];
      const query = searchQuery.trim();

      if (activeFilter === 'all' || activeFilter === 'poems') {
        const poems = await searchPoems({
          query,
          form: poemFormFilter,
          limit: 15,
        });

        results.push(
          ...poems.map((poem) => ({
            id: `poem-${poem.id}`,
            type: 'poem' as const,
            data: poem,
          })),
        );
      }

      if (activeFilter === 'all' || activeFilter === 'authors') {
        const authors = await searchAuthors(query, 10);
        results.push(
          ...authors.map((author) => ({
            id: `author-${author.id}`,
            type: 'author' as const,
            data: author as Author & { poems?: { count: number }[] },
          })),
        );
      }

      if (activeFilter === 'all' || activeFilter === 'users') {
        const users = await searchAuthors(query, 10);
        results.push(
          ...users.map((user) => ({
            id: `user-${user.id}`,
            type: 'user' as const,
            data: user as Author & { poems?: { count: number }[] },
          })),
        );
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePoemPress = (poem: Poem) => {
    openPoemDetail(navigation, poem);
  };

  const handleAuthorPress = (author: Author) => {
    openAuthorProfile(navigation, author);
  };

  const handleUserPress = (author: Author) => {
    openUserProfile(navigation, author.id, user?.id);
  };

  const handlePoemLike = async (poemId: string) => {
    try {
      await incrementPoemLikes(poemId);
      setSearchResults((prev) =>
        prev.map((result) => {
          if (result.type === 'poem' && result.data.id === poemId) {
            return {
              ...result,
              data: {
                ...result.data,
                like_count: (result.data.like_count || 0) + 1,
              },
            };
          }
          return result;
        }),
      );
    } catch (error) {
      console.error('Error liking poem:', error);
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    if (item.type === 'poem') {
      return (
        <PoemCard
          poem={item.data}
          onPress={() => handlePoemPress(item.data)}
          onAuthorPress={() => handleAuthorPress(item.data.author as Author)}
          onLike={() => handlePoemLike(item.data.id)}
        />
      );
    }

    return (
      <TouchableOpacity
        style={[styles.authorResult, { backgroundColor: colors.surface }]}
        onPress={() =>
          item.type === 'author'
            ? handleAuthorPress(item.data)
            : handleUserPress(item.data)
        }
      >
        <View style={styles.authorInfo}>
          <Text style={[styles.authorName, { color: colors.text }]}>{item.data.name}</Text>
          <Text style={[styles.authorMeta, { color: colors.textSecondary }]}>
            {(item.data as any).poems?.[0]?.count || 0} poems
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View
          style={[
            styles.searchInputContainer,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search poems, authors, or users..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View
        style={[
          styles.filterContainer,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        {(['all', 'poems', 'authors', 'users'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && {
                backgroundColor: colors.primary + '15',
                borderBottomColor: colors.primary,
              },
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: activeFilter === filter ? colors.primary : colors.textSecondary },
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {(activeFilter === 'all' || activeFilter === 'poems') && (
        <View style={styles.poemFiltersRow}>
          {['Sonnet', 'Haiku', 'Free Verse', null].map((form) => (
            <TouchableOpacity
              key={form || 'all'}
              style={[
                styles.formChip,
                poemFormFilter === form && styles.formChipActive,
              ]}
              onPress={() => setPoemFormFilter(form)}
            >
              <Text
                style={[
                  styles.formChipText,
                  poemFormFilter === form && styles.formChipTextActive,
                ]}
              >
                {form || 'All forms'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderSearchResult}
          contentContainerStyle={styles.resultsContainer}
          ListEmptyComponent={
            searchQuery.trim() ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No results found
                </Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  Search for poems, authors, or users
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: 15, borderBottomWidth: 1 },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, fontFamily: 'Inter-Regular' },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabText: { fontSize: 14, fontFamily: 'Inter-Bold' },
  poemFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  formChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ecf0f1',
  },
  formChipActive: { backgroundColor: '#3498db' },
  formChipText: { fontSize: 12, color: '#636e72' },
  formChipTextActive: { color: 'white', fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, fontFamily: 'Inter-Regular' },
  resultsContainer: { paddingTop: 10 },
  authorResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 3,
  },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 16, fontFamily: 'Inter-Bold' },
  authorMeta: { fontSize: 14, fontFamily: 'Inter-Regular', marginTop: 4 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: { fontSize: 18, fontFamily: 'Inter-Bold', marginTop: 15 },
});

export default SearchScreen;
