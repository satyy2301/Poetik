// src/screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch, Modal } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import { toggleFollowAuthor, isFollowingAuthor } from '../features/follow/followService';
import { resolveAuthorAccountId } from '../services/authorService';
import { getUserFavorites, addFavoritePoem } from '../features/favorites/favoritesService';
import { getUserPlaylists } from '../features/playlists/playlistService';
import PoemCard from '../components/PoemCard';
import ScreenContainer from '../components/layout/ScreenContainer';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { fetchUserAchievements } from '../services/achievementService';
import { UserAchievement } from '../types/achievement';
import { openAuthorProfile, openPlaylistDetail, openPoemDetail } from '../navigation/navigationHelpers';
import { hapticLight } from '../utils/haptics';

const ProfileScreen = ({ route }: any) => {
  const { user: currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const colors = theme.colors;
  const isDarkMode = theme.isDark;
  const navigation = useNavigation<any>();
  const [user, setUser] = useState(route.params?.user || currentUser);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [favorites, setFavorites] = useState<{ poems: any[]; poets: any[] }>({ poems: [], poets: [] });
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [userPoems, setUserPoems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('poems');
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [showOverflow, setShowOverflow] = useState(false);

  const isOwnProfile = user?.id === currentUser?.id;
  const handle = user?.email?.split('@')[0] || 'user';
  const authorInitial = handle[0]?.toUpperCase() || 'U';

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

    const { data: poems, error: poemsError } = await supabase
      .from('poems')
      .select(`id, title, content, themes, form, like_count, created_at, author:author_id(id, name)`)
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (!poemsError && poems) setUserPoems(poems);

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
      hapticLight();
      const nowFollowing = await toggleFollowAuthor(currentUser.id, user.id);
      setIsFollowing(nowFollowing);
      setFollowersCount((prev) => (nowFollowing ? prev + 1 : prev - 1));
    } catch (error) {
      Alert.alert('Error', 'Could not update follow status.');
    }
  };

  const handleLike = async (poemId: string) => {
    const poemIndex = userPoems.findIndex((p) => p.id === poemId);
    if (poemIndex === -1) return;
    const updatedPoems = [...userPoems];
    updatedPoems[poemIndex] = { ...updatedPoems[poemIndex], like_count: (updatedPoems[poemIndex].like_count || 0) + 1 };
    setUserPoems(updatedPoems);
    await supabase.rpc('increment_likes', { poem_id: poemId });
    if (currentUser) {
      try { await addFavoritePoem(currentUser.id, poemId); } catch (_) { /* ignore */ }
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const stats = [
    { label: 'Followers', value: followersCount, onPress: () => navigation.navigate('Followers', { userId: user?.id }) },
    { label: 'Following', value: followingCount, onPress: () => navigation.navigate('Following', { userId: user?.id }) },
    { label: 'Poems', value: userPoems.length, onPress: () => setActiveTab('poems') },
    { label: 'Playlists', value: playlists.length, onPress: () => navigation.navigate('Playlists') },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgCanvas }]} showsVerticalScrollIndicator={false}>
      <ScreenContainer maxWidth={theme.layout.splitPaneMaxWidth} edges={[]} scrollable={false} contentStyle={styles.profileContent}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.brandPrimary }]}>
            <Text style={styles.avatarText}>{authorInitial}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[theme.typography.displaySm, { color: colors.textPrimary }]}>@{handle}</Text>
            <Text style={[theme.typography.bodySm, { color: colors.textSecondary, marginTop: 4 }]}>
              {isOwnProfile ? 'Poet & writer' : 'Poet on Poetik'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            {isOwnProfile ? (
              <>
                <Button title="Edit Profile" onPress={() => {}} variant="secondary" size="compact" />
                <TouchableOpacity onPress={() => setShowOverflow(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </>
            ) : (
              <Button
                title={isFollowing ? 'Following' : 'Follow'}
                onPress={handleFollowToggle}
                variant={isFollowing ? 'secondary' : 'primary'}
                size="compact"
              />
            )}
          </View>
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
          {stats.map((stat) => (
            <TouchableOpacity key={stat.label} style={styles.statItem} onPress={stat.onPress}>
              <Text style={[theme.typography.statNumber, { color: colors.textPrimary }]}>{stat.value}</Text>
              <Text style={[theme.typography.bodySm, { color: colors.textSecondary }]}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isOwnProfile && achievements.length > 0 && (
          <TouchableOpacity
            style={[styles.badgesRow, { borderColor: colors.borderMuted }]}
            onPress={() => navigation.navigate('Achievements')}
          >
            <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>Badges</Text>
            <View style={styles.badgesList}>
              {achievements.slice(0, 5).map((badge) => (
                <View key={badge.id} style={[styles.badgeChip, { backgroundColor: colors.cardHeaderTint }]}>
                  <Ionicons name="trophy" size={14} color={colors.bookmarkGold} />
                  <Text style={[theme.typography.bodySm, { color: colors.bookmarkGold }]} numberOfLines={1}>{badge.name}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}

        <View style={[styles.tabs, { borderBottomColor: colors.borderMuted }]}>
          {['poems', 'favorites', ...(isOwnProfile ? ['playlists'] : [])].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { borderBottomColor: colors.brandPrimary }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[theme.typography.labelBold, { color: activeTab === tab ? colors.brandPrimary : colors.textSecondary }]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'playlists' && isOwnProfile && (
          <View style={styles.panelHeader}>
            <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>Your Playlists</Text>
            <Button title="+ New Playlist" onPress={() => navigation.navigate('Playlists')} variant="ghost" size="compact" />
          </View>
        )}

        {activeTab === 'poems' && (
          userPoems.length > 0 ? userPoems.map((item) => (
            <PoemCard
              key={item.id}
              poem={item}
              onPress={() => openPoemDetail(navigation, item)}
              onAuthorPress={() => openAuthorProfile(navigation, user.id)}
              onLike={() => handleLike(item.id)}
            />
          )) : (
            <EmptyState
              icon="create-outline"
              title="No poems yet"
              description={isOwnProfile ? "You haven't published any poems yet." : "This poet hasn't published any verses yet."}
            />
          )
        )}

        {activeTab === 'playlists' && (
          playlists.length > 0 ? playlists.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.playlistItem, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}
              onPress={() => openPlaylistDetail(navigation, item)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.bodyMd, { color: colors.textPrimary, fontFamily: 'Inter-Bold' }]}>{item.title}</Text>
                <Text style={[theme.typography.bodySm, { color: colors.textSecondary }]}>
                  {item.playlist_poems?.length || 0} poems
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )) : (
            <EmptyState icon="musical-notes-outline" title="No playlists yet" description="Create a playlist to organize your favorite verses." />
          )
        )}

        {activeTab === 'favorites' && (
          favorites.poems.length > 0 ? favorites.poems.map((item) => (
            <PoemCard
              key={item.id}
              poem={item}
              onPress={() => openPoemDetail(navigation, item)}
              onAuthorPress={() => openAuthorProfile(navigation, item.author)}
              onLike={() => handleLike(item.id)}
            />
          )) : (
            <EmptyState icon="heart-outline" title="No favorites yet" description="Save poems you love to find them here." />
          )
        )}
      </ScreenContainer>

      <Modal visible={showOverflow} transparent animationType="fade" onRequestClose={() => setShowOverflow(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowOverflow(false)}>
          <View style={[styles.overflowMenu, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
            <View style={styles.prefRow}>
              <MaterialIcons name={isDarkMode ? 'light-mode' : 'dark-mode'} size={20} color={colors.textSecondary} />
              <Text style={[theme.typography.bodyMd, { color: colors.textPrimary, flex: 1 }]}>Dark mode</Text>
              <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ false: colors.borderMuted, true: colors.brandPrimary }} />
            </View>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowOverflow(false); navigation.navigate('ModerationQueue'); }}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.textPrimary} />
              <Text style={[theme.typography.bodyMd, { color: colors.textPrimary }]}>Moderation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowOverflow(false); navigation.navigate('Reports'); }}>
              <Ionicons name="flag-outline" size={20} color={colors.textPrimary} />
              <Text style={[theme.typography.bodyMd, { color: colors.textPrimary }]}>Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setShowOverflow(false); handleLogout(); }}>
              <Ionicons name="log-out-outline" size={20} color={colors.likeHeart} />
              <Text style={[theme.typography.bodyMd, { color: colors.likeHeart }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileContent: { paddingBottom: 32 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20, marginTop: 8 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 28, fontFamily: 'Inter-Bold' },
  headerInfo: { flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    marginBottom: 16,
  },
  statItem: { flex: 1, alignItems: 'center' },
  badgesRow: { paddingVertical: 12, borderBottomWidth: 1, marginBottom: 8 },
  badgesList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  badgeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, gap: 4, maxWidth: 140 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  playlistItem: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 8, borderRadius: 12, borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 60, paddingRight: 16 },
  overflowMenu: { borderRadius: 12, borderWidth: 1, padding: 8, minWidth: 220 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  prefRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
});

export default ProfileScreen;
