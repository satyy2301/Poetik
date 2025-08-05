// src/screens/ReadScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import PoemCard from '../components/PoemCard';
import PoemFilter from '../components/PoemFilter';

const PAGE_SIZE = 20;

const ReadScreen = () => {
  const [poems, setPoems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    era: null,
    theme: null,
    form: null
  });
  const navigation = useNavigation();

  const fetchPoems = useCallback(async (reset = false) => {
    if ((!reset && !hasMore) || loading) return;
    
    const currentPage = reset ? 0 : page;
    setLoading(true);

    try {
      let query = supabase
        .from('poems')
        .select(`
          id,
          title,
          content,
          era,
          themes,
          form,
          like_count,
          created_at,
          author:author_id(id, name)
        `)
        .order('created_at', { ascending: false })
        .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

      // Apply filters
      if (filters.era) query = query.eq('era', filters.era);
      if (filters.theme) query = query.contains('themes', [filters.theme]);
      if (filters.form) query = query.eq('form', filters.form);

      const { data, error } = await query;

      if (error) throw error;

      // Process the data to handle missing authors
      const processedData = (data || []).map(poem => ({
        ...poem,
        author: poem.author || { 
          id: 'unknown', 
          name: 'Unknown Author'
        }
      }));

      if (reset) {
        setPoems(processedData);
      } else {
        setPoems(prev => [...prev, ...processedData]);
      }

      setHasMore((data?.length || 0) === PAGE_SIZE);
      setPage(reset ? 1 : currentPage + 1);
    } catch (error) {
      console.error('Error fetching poems:', error);
    } finally {
      setLoading(false);
      if (refreshing) setRefreshing(false);
    }
  }, [page, hasMore, loading, filters, refreshing]);

  // Initial load
  useEffect(() => {
    fetchPoems(true);
  }, [filters]);

  // Real-time updates subscription
  useEffect(() => {
    const subscription = supabase
      .channel('poems_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'poems'
      }, payload => {
        setPoems(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPoems(true);
  };

  const handleViewPoem = (poem: any) => {
    navigation.navigate('PoemDetail', { poem });
  };

  const handleViewAuthor = (author: any) => {
    navigation.navigate('AuthorProfile', { authorId: author.id });
  };

  const handleLike = async (poemId: string) => {
    const poemIndex = poems.findIndex(p => p.id === poemId);
    if (poemIndex === -1) return;

    const updatedPoems = [...poems];
    updatedPoems[poemIndex] = {
      ...updatedPoems[poemIndex],
      like_count: (updatedPoems[poemIndex].like_count || 0) + 1
    };
    setPoems(updatedPoems);

    await supabase.rpc('increment_likes', { poem_id: poemId });
  };

  return (
    <View style={styles.container}>
      <PoemFilter 
        currentFilters={filters}
        onFilterChange={setFilters}
      />
      
      <FlatList
        data={poems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PoemCard 
            poem={item} 
            onPress={() => handleViewPoem(item)}
            onAuthorPress={() => handleViewAuthor(item.author)}
            onLike={() => handleLike(item.id)}
          />
        )}
        onEndReached={() => fetchPoems()}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={refreshing}
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
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loading: {
    marginVertical: 20,
  },
});

export default ReadScreen;