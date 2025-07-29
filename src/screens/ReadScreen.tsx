// src/screens/ReadScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import { supabase } from '../lib/supabase';
import Swiper from 'react-native-swiper';
import flatList from 'react-native-flatlist';
import activityIndicator from 'react-native-activity-indicator';
import PoemCard from '../components/PoemCard';

const PAGE_SIZE = 10;

const ReadScreen = () => {
  const [poems, setPoems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);


  const fetchPoems = useCallback(async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('poems')
      .select(`
        id,
        title,
        content,
        created_at,
        like_count,
        author:users(id, username, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error('Error fetching poems:', error);
    } else {
      setPoems(prev => [...prev, ...(data || [])]);
      setHasMore(data?.length === PAGE_SIZE);
      setPage(prev => prev + 1);
    }
    setLoading(false);
  }, [page, hasMore, loading]);

  useEffect(() => {
    fetchPoems();
  }, []);

  const handleViewPoem = (poem: any) => {
    navigation.navigate('PoemDetail', { poem });
  };

  const handleViewAuthor = (author: any) => {
    navigation.navigate('AuthorProfile', { authorId: author.id });
  };

  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator style={styles.loading} />;
  };

  const handleLike = async (poemId: string) => {
    const { error } = await supabase
      .from('poems')
      .update({ like_count: poems[currentIndex].like_count + 1 })
      .eq('id', poemId);
    
    if (!error) fetchPoems();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={poems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PoemCard 
            poem={item} 
            onPress={() => handleViewPoem(item)}
            onAuthorPress={() => handleViewAuthor(item.author)}
          />
        )}
        onEndReached={fetchPoems}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
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
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  poemContent: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
});

export default ReadScreen;