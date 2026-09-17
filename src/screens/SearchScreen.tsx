import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PoemCard from '../components/PoemCard';
import ScreenContainer from '../components/layout/ScreenContainer';
import EmptyState from '../components/ui/EmptyState';
import SkeletonPoemCard from '../components/loaders/SkeletonPoemCard';
import { searchPoems, incrementPoemLikes } from '../services/poemService';
import { searchAuthors } from '../services/authorService';
import { Poem } from '../types/poem';
import { Author } from '../types/author';
import { openAuthorProfile, openPoemDetail, openUserProfile } from '../navigation/navigationHelpers';
import { useAuth } from '../context/AuthContext';

const RECENT_KEY = 'poetik_recent_searches';
const TRENDING_TAGS = ['Sonnet', 'Haiku', 'Free Verse', 'Love', 'Nature', 'Gothic'];

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
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((raw) => {
      if (raw) setRecentSearches(JSON.parse(raw));
    });
  }, []);

  const saveRecent = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, 8);
    setRecentSearches(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  }, [recentSearches]);

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
      await saveRecent(query);

      if (activeFilter === 'all' || activeFilter === 'poems') {
        const poems = await searchPoems({ query, form: poemFormFilter, limit: 15 });
        results.push(...poems.map((poem) => ({ id: `poem-${poem.id}`, type: 'poem' as const, data: poem })));
      }

      if (activeFilter === 'all' || activeFilter === 'authors' || activeFilter === 'users') {
        const authors = await searchAuthors(query, 10);
        const type = activeFilter === 'users' ? 'user' : 'author';
        results.push(
          ...authors.map((author) => ({
            id: `${type}-${author.id}`,
            type: type as 'author' | 'user',
            data: author as Author & { poems?: { count: number }[] },
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

  const handlePoemPress = (poem: Poem) => openPoemDetail(navigation, poem);
  const handleAuthorPress = (author: Author) => openAuthorProfile(navigation, author);
  const handleUserPress = (author: Author) => openUserProfile(navigation, author.id, user?.id);

  const handlePoemLike = async (poemId: string) => {
    try {
      await incrementPoemLikes(poemId);
      setSearchResults((prev) =>
        prev.map((result) =>
          result.type === 'poem' && result.data.id === poemId
            ? { ...result, data: { ...result.data, like_count: (result.data.like_count || 0) + 1 } }
            : result,
        ),
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
        style={[styles.authorResult, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}
        onPress={() => (item.type === 'author' ? handleAuthorPress(item.data) : handleUserPress(item.data))}
      >
        <View style={styles.authorInfo}>
          <Text style={[theme.typography.bodyMd, { color: colors.textPrimary, fontFamily: 'Inter-Bold' }]}>
            {item.data.name}
          </Text>
          <Text style={[theme.typography.bodySm, { color: colors.textSecondary, marginTop: 4 }]}>
            {(item.data as any).poems?.[0]?.count || 0} poems
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderChip = (label: string, selected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={label}
      style={[
        styles.formChip,
        {
          backgroundColor: selected ? colors.brandPrimary : 'transparent',
          borderColor: selected ? colors.brandPrimary : colors.borderSubtle,
        },
      ]}
      onPress={onPress}
    >
      <Text style={[theme.typography.bodySm, { color: selected ? '#FFFFFF' : colors.textSecondary, fontWeight: selected ? '600' : '400' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <>
      {!searchQuery.trim() && (
        <View style={styles.discoverySection}>
          {recentSearches.length > 0 && (
            <View style={styles.discoveryBlock}>
              <Text style={[theme.typography.labelBold, { color: colors.textPrimary, marginBottom: 8 }]}>
                Recent Searches
              </Text>
              <View style={styles.chipRow}>
                {recentSearches.map((term) =>
                  renderChip(term, false, () => setSearchQuery(term)),
                )}
              </View>
            </View>
          )}
          <View style={styles.discoveryBlock}>
            <Text style={[theme.typography.labelBold, { color: colors.textPrimary, marginBottom: 8 }]}>
              Trending Tags
            </Text>
            <View style={styles.chipRow}>
              {TRENDING_TAGS.map((tag) =>
                renderChip(tag, poemFormFilter === tag, () => {
                  setPoemFormFilter(tag);
                  setSearchQuery(tag);
                }),
              )}
            </View>
          </View>
        </View>
      )}
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCanvas }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderMuted }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.bgElevated, borderColor: colors.borderSubtle }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
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

      <View style={[styles.filterContainer, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderMuted }]}>
        {(['all', 'poems', 'authors', 'users'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && { borderBottomColor: colors.brandPrimary },
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[theme.typography.labelBold, { color: activeFilter === filter ? colors.brandPrimary : colors.textSecondary, fontSize: 14 }]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {(activeFilter === 'all' || activeFilter === 'poems') && (
        <View style={styles.poemFiltersRow}>
          {['Sonnet', 'Haiku', 'Free Verse', null].map((form) =>
            renderChip(form || 'All forms', poemFormFilter === form, () => setPoemFormFilter(form)),
          )}
        </View>
      )}

      <ScreenContainer edges={[]} contentStyle={styles.resultsWrapper}>
        {isLoading ? (
          <View>
            <SkeletonPoemCard />
            <SkeletonPoemCard />
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={renderSearchResult}
            ListHeaderComponent={ListHeader}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              searchQuery.trim() ? (
                <EmptyState icon="search-outline" title="No results found" description="Try different keywords or filters." />
              ) : (
                <EmptyState icon="search-outline" title="Search for poems" description="Find verses, authors, and fellow poets." />
              )
            }
          />
        )}
      </ScreenContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: 15, borderBottomWidth: 1 },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, fontFamily: 'Inter-Regular' },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderBottomWidth: 1,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
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
    borderRadius: 6,
    borderWidth: 1,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  discoverySection: { paddingVertical: 8 },
  discoveryBlock: { marginBottom: 16 },
  resultsWrapper: { paddingHorizontal: 0, flex: 1 },
  authorResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  authorInfo: { flex: 1 },
});

export default SearchScreen;
