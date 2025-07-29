// src/screens/CommunityScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { supabase } from '../lib/supabase';
import CommunityPost from '../components/CommunityPost';
import { useAuth } from '../context/AuthContext';

const CommunityScreen = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    fetchPosts();
    
    const subscription = supabase
      .channel('community_posts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'community_posts'
      }, payload => {
        setPosts(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('community_posts')
      .select(`
        id,
        content,
        created_at,
        user:users(username, avatar_url),
        poem:poems(*, author:users(*))
      `)
      .order('created_at', { ascending: false });
    
    setPosts(data || []);
  };

  const createPost = async () => {
    if (!newPostContent.trim()) return;
    
    await supabase
      .from('community_posts')
      .insert([{
        user_id: user?.id,
        content: newPostContent
      }]);
    
    setNewPostContent('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.postInputContainer}>
        <TextInput
          style={styles.postInput}
          placeholder="Share your thoughts..."
          multiline
          value={newPostContent}
          onChangeText={setNewPostContent}
        />
        <TouchableOpacity 
          style={styles.postButton}
          onPress={createPost}
          disabled={!newPostContent.trim()}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <CommunityPost post={item} currentUserId={user?.id} />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  postInputContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  postInput: {
    minHeight: 50,
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  postButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default CommunityScreen;