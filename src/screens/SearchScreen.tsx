// src/screens/SearchScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet,
  ActivityIndicator 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import PoemCard from '../components/PoemCard';

interface SearchResult {
  id: string;
  type: 'poem' | 'author' | 'user';
  data: any;
}

const SearchScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const colors = theme.colors;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'poems' | 'authors' | 'users'>('all');

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, activeFilter]);

  const performSearch = async () => {
    setIsLoading(true);
    
    try {
      let results: SearchResult[] = [];

      if (activeFilter === 'all' || activeFilter === 'poems') {
        // Search poems by title and content
        const { data: poems } = await supabase
          .from('poems')
          .select(`
            id,
            title,
            content,
            themes,
            form,
            like_count,
            created_at,
            author:authors!inner(id, name)
          `)
          .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,themes.cs.{${searchQuery}}`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (poems) {
          results.push(...poems.map(poem => ({
            id: `poem-${poem.id}`,
            type: 'poem' as const,
            data: poem
          })));
        }
      }

      if (activeFilter === 'all' || activeFilter === 'authors') {
        // Search authors by name
        const { data: authors } = await supabase
          .from('authors')
          .select(`
            id,
            name,
            poems(count)
          `)
          .ilike('name', `%${searchQuery}%`)
          .limit(10);

        if (authors) {
          results.push(...authors.map(author => ({
            id: `author-${author.id}`,
            type: 'author' as const,
            data: author
          })));
        }
      }

      if (activeFilter === 'all' || activeFilter === 'users') {
        // Search users by email/username
        const { data: users } = await supabase
          .from('authors')
          .select(`
            id,
            name,
            poems(count)
          `)
          .ilike('name', `%${searchQuery}%`)
          .limit(10);

        if (users) {
          results.push(...users.map(user => ({
            id: `user-${user.id}`,
            type: 'user' as const,
            data: user
          })));
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePoemPress = (poem: any) => {
    navigation.navigate('PoemDetail', { poem });
  };

  const handleAuthorPress = (author: any) => {
    navigation.navigate('AuthorProfile', { author });
  };

  const handleUserPress = (user: any) => {
    navigation.navigate('Profile', { user });
  };

  const handlePoemLike = async (poemId: string) => {
    try {
      await supabase.rpc('increment_likes', { poem_id: poemId });
      
      // Update local state
      setSearchResults(prev => 
        prev.map(result => {
          if (result.type === 'poem' && result.data.id === poemId) {
            return {
              ...result,
              data: {
                ...result.data,
                like_count: (result.data.like_count || 0) + 1
              }
            };
          }
          return result;
        })
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
          onAuthorPress={() => handleAuthorPress(item.data.author)}
          onLike={() => handlePoemLike(item.data.id)}
        />
      );
    }

    if (item.type === 'author' || item.type === 'user') {
      return (
        <TouchableOpacity
          style={[styles.authorResult, { backgroundColor: colors.surface }]}
          onPress={() => item.type === 'author' ? handleAuthorPress(item.data) : handleUserPress(item.data)}
        >
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: colors.text }]}>{item.data.name}</Text>
            <Text style={[styles.authorMeta, { color: colors.textSecondary }]}>
              {item.data.poems?.[0]?.count || 0} poems
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Input */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
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

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {(['all', 'poems', 'authors', 'users'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && { backgroundColor: colors.primary + '15', borderBottomColor: colors.primary }
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[
              styles.filterTabText,
              { color: activeFilter === filter ? colors.primary : colors.textSecondary }
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Results */}
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
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No results found</Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Try adjusting your search terms</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.text }]}>Search for poems, authors, or users</Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Discover amazing poetry and connect with poets</Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 15,
    borderBottomWidth: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
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
  filterTabText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  resultsContainer: {
    paddingTop: 10,
  },
  authorResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  authorMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default SearchScreen;
