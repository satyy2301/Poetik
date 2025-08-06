// src/screens/AuthorProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import PoemCard from '../components/PoemCard';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const AuthorProfileScreen = ({ route }) => {
  const { author } = route.params;
  const { user: currentUser } = useAuth();
  const navigation = useNavigation();
  const [authorPoems, setAuthorPoems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authorStats, setAuthorStats] = useState({
    totalPoems: 0,
    totalLikes: 0,
    themes: [],
    mostUsedForm: ''
  });

  useEffect(() => {
    loadAuthorData();
  }, [author]);

  const loadAuthorData = async () => {
    setIsLoading(true);
    try {
      // Fetch author's poems
      const { data: poems, error: poemsError } = await supabase
        .from('poems')
        .select(`
          id,
          title,
          content,
          themes,
          form,
          like_count,
          created_at,
          author:authors!poems_author_id_fkey(id, name)
        `)
        .eq('author_id', author.id)
        .order('created_at', { ascending: false });

      if (poemsError) {
        console.error('Error fetching author poems:', poemsError);
      } else {
        setAuthorPoems(poems || []);
        
        // Calculate stats
        if (poems && poems.length > 0) {
          const totalLikes = poems.reduce((sum, poem) => sum + (poem.like_count || 0), 0);
          
          // Get all themes
          const allThemes = poems.flatMap(poem => poem.themes || []);
          const themeCount = {};
          allThemes.forEach(theme => {
            themeCount[theme] = (themeCount[theme] || 0) + 1;
          });
          const topThemes = Object.entries(themeCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([theme]) => theme);

          // Get most used form
          const formCount = {};
          poems.forEach(poem => {
            if (poem.form) {
              formCount[poem.form] = (formCount[poem.form] || 0) + 1;
            }
          });
          const mostUsedForm = Object.entries(formCount)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

          setAuthorStats({
            totalPoems: poems.length,
            totalLikes,
            themes: topThemes,
            mostUsedForm
          });
        }
      }
    } catch (error) {
      console.error('Error loading author data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePoemPress = (poem: any) => {
    navigation.navigate('PoemDetail', { poem });
  };

  const handlePoemLike = async (poemId: string) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to like poems');
      return;
    }

    try {
      // Add to favorites when liked
      await supabase
        .from('favorites')
        .upsert([{
          user_id: currentUser.id,
          poem_id: poemId,
          created_at: new Date().toISOString()
        }], {
          onConflict: 'user_id,poem_id'
        });

      // Increment like count
      await supabase.rpc('increment_likes', { poem_id: poemId });
      
      // Update local state
      setAuthorPoems(prev => 
        prev.map(poem => 
          poem.id === poemId 
            ? { ...poem, like_count: (poem.like_count || 0) + 1 }
            : poem
        )
      );

      // Update stats
      setAuthorStats(prev => ({
        ...prev,
        totalLikes: prev.totalLikes + 1
      }));

    } catch (error) {
      console.error('Error liking poem:', error);
    }
  };

  const renderPoem = ({ item: poem }) => (
    <PoemCard
      poem={poem}
      onPress={() => handlePoemPress(poem)}
      onAuthorPress={() => {}} // No action needed since we're on author profile
      onLike={() => handlePoemLike(poem.id)}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading author profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Author Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{author.name}</Text>
          <Text style={styles.authorSubtitle}>Poet & Author</Text>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{authorStats.totalPoems}</Text>
          <Text style={styles.statLabel}>Poems</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{authorStats.totalLikes}</Text>
          <Text style={styles.statLabel}>Total Likes</Text>
        </View>
        
        {authorStats.mostUsedForm && (
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{authorStats.mostUsedForm}</Text>
            <Text style={styles.statLabel}>Favorite Form</Text>
          </View>
        )}
      </View>

      {/* Popular Themes */}
      {authorStats.themes.length > 0 && (
        <View style={styles.themesSection}>
          <Text style={styles.sectionTitle}>Popular Themes</Text>
          <View style={styles.themesContainer}>
            {authorStats.themes.map((theme, index) => (
              <View key={index} style={styles.themePill}>
                <Text style={styles.themeText}>{theme}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Poems List */}
      <View style={styles.poemsSection}>
        <Text style={styles.sectionTitle}>Poems by {author.name}</Text>
        <FlatList
          data={authorPoems}
          keyExtractor={(item) => item.id}
          renderItem={renderPoem}
          contentContainerStyle={styles.poemsList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="library-outline" size={64} color="#bdc3c7" />
              <Text style={styles.emptyText}>No poems found</Text>
              <Text style={styles.emptySubtext}>This author hasn't published any poems yet</Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  authorSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  themesSection: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  themePill: {
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  themeText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  poemsSection: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 20,
  },
  poemsList: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default AuthorProfileScreen;
