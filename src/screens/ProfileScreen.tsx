// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Switch } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { toggleFollowAuthor, isFollowingAuthor } from '../features/follow/followService';
import { resolveAuthorAccountId } from '../services/authorService';
import { getUserFavorites, addFavoritePoem } from '../features/favorites/favoritesService';
import { getUserPlaylists } from '../features/playlists/playlistService';
import PoemCard from '../components/PoemCard';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { fetchUserAchievements } from '../services/achievementService';
import { UserAchievement } from '../types/achievement';
import { openAuthorProfile, openPlaylistDetail, openPoemDetail } from '../navigation/navigationHelpers';

const ProfileScreen = ({ route }) => {
  const { user: currentUser, logout } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const colors = theme.colors;
  const navigation = useNavigation();
  const [user, setUser] = useState(route.params?.user || currentUser);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [favorites, setFavorites] = useState({ poems: [], poets: [] });
  const [playlists, setPlaylists] = useState([]);
  const [userPoems, setUserPoems] = useState([]);
  const [activeTab, setActiveTab] = useState('poems');
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (currentUser?.id && user?.id !== currentUser?.id) {
      const accountId = await resolveAuthorAccountId(user.id);
      if (accountId) {
        setIsFollowing(await isFollowingAuthor(currentUser.id, user.id));
      }
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

    // Get favorites, playlists, achievements
    try {
      const favs = await getUserFavorites(user.id);
      const plists = await getUserPlaylists(user.id);
      const badges = await fetchUserAchievements(user.id);

      setFavorites(favs);
      setPlaylists(plists.data || []);
      setAchievements(badges);
    } catch (error) {
      console.error('Error loading favorites/playlists:', error);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) return;
    try {
      const nowFollowing = await toggleFollowAuthor(currentUser.id, user.id);
      setIsFollowing(nowFollowing);
      setFollowersCount((prev) => (nowFollowing ? prev + 1 : prev - 1));
    } catch (error) {
      console.error('Follow toggle failed:', error);
      Alert.alert('Error', 'Could not update follow status. Please try again.');
    }
  };

  const handleViewPoem = (poem: any) => {
    openPoemDetail(navigation, poem);
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

    if (currentUser) {
      try {
        await addFavoritePoem(currentUser.id, poemId);
      } catch (error) {
        console.error('Failed to save favorite:', error);
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          } 
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.username, { color: colors.text }]}>@{user?.email?.split('@')[0] || 'user'}</Text>
        
        <View style={styles.headerActions}>
          {user?.id !== currentUser?.id ? (
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={handleFollowToggle}
            >
              <Text style={styles.followButtonText}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerActions}>
              {/* Theme Toggle */}
              <View style={[styles.themeToggleContainer, { borderColor: colors.border }]}>
                <MaterialIcons 
                  name={isDarkMode ? "light-mode" : "dark-mode"} 
                  size={20} 
                  color={colors.textSecondary} 
                />
                <Switch
                  value={isDarkMode}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={isDarkMode ? colors.surface : colors.background}
                />
              </View>
              
              <TouchableOpacity
                style={[styles.logoutButton, { borderColor: colors.primary }]}
                onPress={() => navigation.navigate('ModerationQueue')}
              >
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                <Text style={[styles.logoutButtonText, { color: colors.primary }]}>Moderation</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.logoutButton, { borderColor: colors.primary }]}
                onPress={() => navigation.navigate('Reports')}
              >
                <Ionicons name="flag-outline" size={20} color={colors.primary} />
                <Text style={[styles.logoutButtonText, { color: colors.primary }]}>Reports</Text>
              </TouchableOpacity>

              {/* Logout Button */}
              <TouchableOpacity
                style={[styles.logoutButton, { borderColor: colors.error }]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
                <Text style={[styles.logoutButtonText, { color: colors.error }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

            <View style={[styles.statsContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => navigation.navigate('Followers', { userId: user?.id })}
        >
          <Text style={[styles.statNumber, { color: colors.text }]}>{followersCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => navigation.navigate('Following', { userId: user?.id })}
        >
          <Text style={[styles.statNumber, { color: colors.text }]}>{followingCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.text }]}>{userPoems.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Poems</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.statItem}
          onPress={() => navigation.navigate('Playlists')}
        >
          <Text style={[styles.statNumber, { color: colors.text }]}>{playlists.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Playlists</Text>
        </TouchableOpacity>
      </View>

      {user?.id === currentUser?.id && (
        <TouchableOpacity
          style={[styles.badgesRow, { borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('ActivityFeed')}
        >
          <Text style={[styles.badgesTitle, { color: colors.text }]}>Activity Feed</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>See your recent actions →</Text>
        </TouchableOpacity>
      )}

      {user?.id === currentUser?.id && achievements.length > 0 && (
        <TouchableOpacity
          style={[styles.badgesRow, { borderBottomColor: colors.border }]}
          onPress={() => navigation.navigate('Achievements')}
        >
          <Text style={[styles.badgesTitle, { color: colors.text }]}>Badges</Text>
          <View style={styles.badgesList}>
            {achievements.slice(0, 5).map((badge) => (
              <View key={badge.id} style={styles.badgeChip}>
                <Ionicons name="trophy" size={14} color="#f39c12" />
                <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      )}

      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'poems' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('poems')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'poems' ? colors.primary : colors.textSecondary }]}>
            Poems
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'favorites' ? colors.primary : colors.textSecondary }]}>
            Favorites
          </Text>
        </TouchableOpacity>
        
        {user?.id === currentUser?.id && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'playlists' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('playlists')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'playlists' ? colors.primary : colors.textSecondary }]}>
              Playlists
            </Text>
            <TouchableOpacity 
              style={styles.playlistsButton}
              onPress={() => navigation.navigate('Playlists')}
            >
              <Ionicons name="add-outline" size={16} color={colors.primary} />
              <Text style={[styles.playlistsButtonText, { color: colors.primary }]}>Manage</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      </View>

      {activeTab === 'poems' && (
        <FlatList
          data={userPoems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PoemCard 
              poem={item} 
              onPress={() => handleViewPoem(item)}
              onAuthorPress={() => openAuthorProfile(navigation, user.id)}
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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.playlistItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openPlaylistDetail(navigation, item)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.playlistTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.playlistCount, { color: colors.textSecondary }]}>
                  {item.playlist_poems?.length || 0} poems
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No playlists yet
            </Text>
          }
        />
      )}

      {activeTab === 'favorites' && (
        <FlatList
          data={favorites.poems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.poemItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openPoemDetail(navigation, item)}
            >
              <Text style={[styles.poemTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.poemAuthor, { color: colors.textSecondary }]}>
                by {item.author?.name || 'Unknown'}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No favorites yet
            </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  logoutButtonText: {
    color: '#e74c3c',
    fontWeight: '600',
    marginLeft: 4,
  },
  badgesRow: {
    padding: 16,
    borderBottomWidth: 1,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  badgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef5e7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    maxWidth: 140,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e67e22',
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
  playlistsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    marginLeft: 8,
  },
  playlistsButtonText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
    marginLeft: 2,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
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
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
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