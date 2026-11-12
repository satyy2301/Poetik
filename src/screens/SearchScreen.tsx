import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
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
const TRENDING_TAGS = ['Love', 'Nature', 'Gothic', 'Night', 'Rain', 'Home'];
const FORM_FILTERS = ['Sonnet', 'Haiku', 'Free Verse'] as const;

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
  const requestId = useRef(0);
  const recentRef = useRef<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((raw) => {
      if (!raw) return;
      const saved = JSON.parse(raw);
      recentRef.current = saved;
      setRecentSearches(saved);
    });
  }, []);

  const saveRecent = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentRef.current.filter((term) => term !== trimmed)].slice(0, 8);
    recentRef.current = updated;
    setRecentSearches(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  }, []);

  const performSearch = useCallback(async (query: string) => {
    const id = requestId.current + 1;
    requestId.current = id;
    setIsLoading(true);
    try {
      const wantPoems = activeFilter === 'all' || activeFilter === 'poems';
      const wantPeople = activeFilter === 'all' || activeFilter === 'authors' || activeFilter === 'users';
      const [poems, authors] = await Promise.all([
        wantPoems ? searchPoems({ query, form: poemFormFilter, limit: 15 }) : Promise.resolve([]),
        wantPeople ? searchAuthors(query, 10) : Promise.resolve([]),
      ]);
      if (id !== requestId.current) return;

      const results: SearchResult[] = [];
      results.push(...poems.map((poem) => ({ id: `poem-${poem.id}`, type: 'poem' as const, data: poem })));
      if (wantPeople) {
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
      await saveRecent(query);
    } catch (error) {
      if (id !== requestId.current) return;
      console.error('Search error:', error);
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [activeFilter, poemFormFilter, saveRecent]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      requestId.current += 1;
      setSearchResults([]);
      setIsLoading(false);
      return;
    }
    const delayedSearch = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(delayedSearch);
  }, [searchQuery, performSearch]);

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
      <Text style={[theme.typography.bodySm, { color: selected ? colors.onBrand : colors.textPrimary, fontWeight: selected ? '600' : '400' }]}>
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
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                Recent
              </Text>
              <View style={styles.chipRow}>
                {recentSearches.map((term) =>
                  renderChip(term, false, () => setSearchQuery(term)),
                )}
              </View>
            </View>
          )}
          <View style={styles.discoveryBlock}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              Trending
            </Text>
            <View style={styles.chipRow}>
              {TRENDING_TAGS.map((tag) =>
                renderChip(tag, false, () => setSearchQuery(tag)),
              )}
            </View>
          </View>
        </View>
      )}
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCanvas }]}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.bgElevated, borderColor: colors.borderSubtle }]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
            placeholder="Poems, poets, people"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {(['all', 'poems', 'authors', 'users'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              {
                backgroundColor: activeFilter === filter ? colors.brandPrimary : 'transparent',
                borderColor: activeFilter === filter ? colors.brandPrimary : colors.borderSubtle,
              },
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterLabel, { color: activeFilter === filter ? colors.onBrand : colors.textPrimary }]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {(activeFilter === 'all' || activeFilter === 'poems') && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.poemFiltersRow}
        >
          {renderChip('All forms', poemFormFilter == null, () => setPoemFormFilter(null))}
          {FORM_FILTERS.map((form) =>
            renderChip(form, poemFormFilter === form, () => setPoemFormFilter(form)),
          )}
        </ScrollView>
      )}

      <ScreenContainer edges={[]} contentStyle={styles.resultsWrapper}>
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderSearchResult}
          ListHeaderComponent={
            <View>
              {isLoading ? (
                <ActivityIndicator color={colors.brandPrimary} style={styles.loading} />
              ) : null}
              <ListHeader />
            </View>
          }
          initialNumToRender={6}
          windowSize={7}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            isLoading ? (
              <View>
                <SkeletonPoemCard />
              </View>
            ) : searchQuery.trim() ? (
              <EmptyState icon="search-outline" title="No results" description="Try a different word or form." />
            ) : (
              <EmptyState icon="search-outline" title="Search for poems" description="Find verses, authors, and fellow poets." />
            )
          }
        />
      </ScreenContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
    borderWidth: 1,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, fontFamily: 'Inter-Regular' },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterLabel: { fontSize: 13, fontFamily: 'Inter-Bold' },
  poemFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  formChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  discoverySection: { paddingTop: 4, paddingBottom: 8 },
  discoveryBlock: { marginBottom: 14 },
  sectionLabel: { fontSize: 12, fontFamily: 'Inter-Bold', letterSpacing: 0.4, marginBottom: 8 },
  loading: { marginVertical: 8 },
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
