// src/screens/CommunityScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, TextInput, Text, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import CommunityPost from '../components/CommunityPost';
import PoemCard from '../components/PoemCard';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const CommunityScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [posts, setPosts] = useState<any[]>([]);
  const [userPoems, setUserPoems] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'poems'>('posts');

  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time updates
    const postsSubscription = supabase
      .channel('community_posts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'community_posts'
      }, payload => {
        setPosts(prev => [payload.new, ...prev]);
      })
      .subscribe();

    const poemsSubscription = supabase
      .channel('poems')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'poems'
      }, (payload) => {
        fetchUserPoems(); // Refresh poems when new one is added
      })
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(poemsSubscription);
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchPosts(), fetchUserPoems()]);
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data } = await supabase
        .from('community_posts')
        .select(`
          id,
          content,
          created_at,
          user_id,
          user:authors!community_posts_user_id_fkey(id, name),
          poem:poems(
            id,
            title,
            content,
            themes,
            form,
            like_count,
            author:authors(id, name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);
      
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchUserPoems = async () => {
    try {
      const { data } = await supabase
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
        .order('created_at', { ascending: false })
        .limit(20);
      
      setUserPoems(data || []);
    } catch (error) {
      console.error('Error fetching user poems:', error);
    }
  };

  const createPost = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to create posts');
      return;
    }

    if (!newPostContent.trim()) {
      Alert.alert('Empty Post', 'Please write something before posting');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('community_posts')
        .insert([{
          user_id: user.id,
          content: newPostContent.trim()
        }]);

      if (error) throw error;
      
      setNewPostContent('');
      Alert.alert('Success', 'Your post has been shared!');
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    }
  };

  const handlePoemPress = (poem: any) => {
    navigation.navigate('PoemDetail', { poem });
  };

  const handleAuthorPress = (author: any) => {
    navigation.navigate('Profile', { user: author });
  };

  const handlePoemLike = async (poemId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to like poems');
      return;
    }

    try {
      // Add to favorites when liked
      await supabase
        .from('favorites')
        .upsert([{
          user_id: user.id,
          poem_id: poemId,
          created_at: new Date().toISOString()
        }], {
          onConflict: 'user_id,poem_id'
        });

      // Increment like count
      await supabase.rpc('increment_likes', { poem_id: poemId });
      
      // Update local state
      setUserPoems(prev => 
        prev.map(poem => 
          poem.id === poemId 
            ? { ...poem, like_count: (poem.like_count || 0) + 1 }
            : poem
        )
      );

    } catch (error) {
      console.error('Error liking poem:', error);
    }
  };

  const renderPost = ({ item: post }) => {
    if (post.poem) {
      // Post contains a shared poem
      return (
        <View style={styles.sharedPoemContainer}>
          <View style={styles.postHeader}>
            <TouchableOpacity onPress={() => handleAuthorPress(post.user)}>
              <Text style={styles.posterName}>{post.user?.name || 'Unknown User'} shared:</Text>
            </TouchableOpacity>
          </View>
          <PoemCard
            poem={post.poem}
            onPress={() => handlePoemPress(post.poem)}
            onAuthorPress={() => handleAuthorPress(post.poem.author)}
            onLike={() => handlePoemLike(post.poem.id)}
          />
        </View>
      );
    }

    // Regular text post
    return (
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <TouchableOpacity onPress={() => handleAuthorPress(post.user)}>
            <Text style={styles.posterName}>{post.user?.name || 'Unknown User'}</Text>
          </TouchableOpacity>
          <Text style={styles.postDate}>
            {new Date(post.created_at).toLocaleDateString()}
          </Text>
        </View>
        <Text style={styles.postContent}>{post.content}</Text>
      </View>
    );
  };

  const renderPoem = ({ item: poem }) => (
    <PoemCard
      poem={poem}
      onPress={() => handlePoemPress(poem)}
      onAuthorPress={() => handleAuthorPress(poem.author)}
      onLike={() => handlePoemLike(poem.id)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header with tabs */}
      <View style={styles.header}>
        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Community Posts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'poems' && styles.activeTab]}
            onPress={() => setActiveTab('poems')}
          >
            <Text style={[styles.tabText, activeTab === 'poems' && styles.activeTabText]}>
              All Poems
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'posts' && (
        <>
          {/* Create Post Section */}
          <View style={styles.postInputContainer}>
            <TextInput
              style={styles.postInput}
              placeholder="Share your thoughts about poetry..."
              multiline
              value={newPostContent}
              onChangeText={setNewPostContent}
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.postButton, !newPostContent.trim() && styles.postButtonDisabled]}
              onPress={createPost}
              disabled={!newPostContent.trim()}
            >
              <Ionicons name="send" size={18} color="white" />
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>

          {/* Posts List */}
          <FlatList
            data={posts}
            keyExtractor={item => `post-${item.id}`}
            renderItem={renderPost}
            contentContainerStyle={styles.listContent}
            refreshing={isLoading}
            onRefresh={fetchData}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={48} color="#bdc3c7" />
                <Text style={styles.emptyText}>No posts yet</Text>
                <Text style={styles.emptySubtext}>Be the first to share something!</Text>
              </View>
            }
          />
        </>
      )}

      {activeTab === 'poems' && (
        <FlatList
          data={userPoems}
          keyExtractor={item => `poem-${item.id}`}
          renderItem={renderPoem}
          contentContainerStyle={styles.listContent}
          refreshing={isLoading}
          onRefresh={fetchData}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="library-outline" size={48} color="#bdc3c7" />
              <Text style={styles.emptyText}>No poems yet</Text>
              <Text style={styles.emptySubtext}>Start writing and sharing your poetry!</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  activeTabText: {
    color: '#3498db',
    fontWeight: '600',
  },
  postInputContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  postInput: {
    minHeight: 60,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  postButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  listContent: {
    paddingBottom: 20,
  },
  postContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sharedPoemContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  posterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
  },
  postDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 22,
    color: '#2c3e50',
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

export default CommunityScreen;