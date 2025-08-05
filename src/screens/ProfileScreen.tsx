// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { toggleFollow, getUserFollowers, getUserFollowing } from '../features/follow/followService';
import { getUserFavorites } from '../features/favorites/favoritesService';
import { getUserPlaylists } from '../features/playlists/playlistService';
import PoemCard from '../components/PoemCard';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = ({ route }) => {
  const { user: currentUser } = useAuth();
  const navigation = useNavigation();
  const [user, setUser] = useState(route.params?.user || currentUser);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [favorites, setFavorites] = useState({ poems: [], poets: [] });
  const [playlists, setPlaylists] = useState([]);
  const [userPoems, setUserPoems] = useState([]);
  const [activeTab, setActiveTab] = useState('poems');

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    // Check if current user follows this profile
    if (currentUser?.id && user?.id !== currentUser?.id) {
      const { data } = await supabase
        .from('followers')
        .select()
        .eq('follower_id', currentUser.id)
        .eq('followee_id', user.id)
        .single();
      
      setIsFollowing(!!data);
    }

    // Get follower counts
    const { count: followers } = await supabase
      .from('followers')
      .select('*', { count: 'exact' })
      .eq('followee_id', user.id);
    
    const { count: following } = await supabase
      .from('followers')
      .select('*', { count: 'exact' })
      .eq('follower_id', user.id);
    
    setFollowersCount(followers || 0);
    setFollowingCount(following || 0);

    // Get user's published poems
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
        author:author_id(id, name)
      `)
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (!poemsError && poems) {
      // The poems already have the author data from the join
      setUserPoems(poems);
    } else if (poemsError) {
      console.error('Error fetching poems:', poemsError);
    }

    // Get favorites and playlists
    try {
      const favs = await getUserFavorites(user.id);
      const plists = await getUserPlaylists(user.id);
      
      setFavorites(favs);
      setPlaylists(plists.data || []);
    } catch (error) {
      console.error('Error loading favorites/playlists:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) return;
    
    await toggleFollow(currentUser.id, user.id);
    setIsFollowing(!isFollowing);
    setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
  };

  const handleViewPoem = (poem: any) => {
    navigation.navigate('PoemDetail', { poem });
  };

  const handleLike = async (poemId: string) => {
    const poemIndex = userPoems.findIndex(p => p.id === poemId);
    if (poemIndex === -1) return;

    const updatedPoems = [...userPoems];
    updatedPoems[poemIndex] = {
      ...updatedPoems[poemIndex],
      like_count: (updatedPoems[poemIndex].like_count || 0) + 1
    };
    setUserPoems(updatedPoems);

    await supabase.rpc('increment_likes', { poem_id: poemId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>@{user?.email?.split('@')[0] || 'user'}</Text>
        
        {user?.id !== currentUser?.id && (
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={handleFollowToggle}
          >
            <Text style={styles.followButtonText}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{followersCount}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{followingCount}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{userPoems.length}</Text>
          <Text style={styles.statLabel}>Poems</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>{favorites.poems.length}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'poems' && styles.activeTab]}
          onPress={() => setActiveTab('poems')}
        >
          <Text style={styles.tabText}>Poems</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'playlists' && styles.activeTab]}
          onPress={() => setActiveTab('playlists')}
        >
          <Text style={styles.tabText}>Playlists</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={styles.tabText}>Favorites</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'poems' && (
        <FlatList
          data={userPoems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PoemCard 
              poem={item} 
              onPress={() => handleViewPoem(item)}
              onAuthorPress={() => {}} // No action needed since we're on profile
              onLike={() => handleLike(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {user?.id === currentUser?.id 
                  ? "You haven't published any poems yet" 
                  : "This user hasn't published any poems yet"
                }
              </Text>
            </View>
          }
        />
      )}
      
      {activeTab === 'playlists' && (
        <FlatList
          data={playlists}
          renderItem={({ item }) => (
            <View style={styles.playlistItem}>
              <Text style={styles.playlistTitle}>{item.title}</Text>
              <Text style={styles.playlistCount}>
                {item.playlist_poems?.length || 0} poems
              </Text>
            </View>
          )}
        />
      )}
      
      {activeTab === 'favorites' && (
        <FlatList
          data={favorites.poems}
          renderItem={({ item }) => (
            <View style={styles.poemItem}>
              <Text style={styles.poemTitle}>{item.title}</Text>
              <Text style={styles.poemAuthor}>by @{item.author?.username}</Text>
            </View>
          )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  followButton: {
    backgroundColor: '#3498db',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  followingButton: {
    backgroundColor: '#bdc3c7',
  },
  followButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  tabText: {
    fontWeight: '600',
  },
  playlistItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    backgroundColor: 'white',
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  playlistCount: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  poemItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    backgroundColor: 'white',
  },
  poemTitle: {
    fontSize: 16,
  },
  poemAuthor: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default ProfileScreen;