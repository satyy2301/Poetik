import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Share, ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import {
  getPublicPlaylist,
  followPlaylist,
  unfollowPlaylist,
  isFollowingPlaylist,
  incrementPlayCount,
} from '../features/playlists/playlistService';
import PoemCard from '../components/PoemCard';

const PublicPlaylistScreen = ({ navigation }: any) => {
  const route = useRoute<any>();
  const { user } = useAuth();
  const slug = route.params?.slug;
  const [playlist, setPlaylist] = useState<any>(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPublicPlaylist(slug);
        setPlaylist(data);
        await incrementPlayCount(data.id);
        if (user) {
          const isFollowing = await isFollowingPlaylist(user.id, data.id);
          setFollowing(isFollowing);
        }
      } catch (err) {
        Alert.alert('Error', 'Playlist not found');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, user]);

  const handleShare = async () => {
    const url = `https://poetik.app/playlist/${slug}`;
    await Share.share({ message: `Check out this playlist: ${playlist?.title}\n${url}`, url });
  };

  const handleFollow = async () => {
    if (!user) return;
    if (following) {
      await unfollowPlaylist(user.id, playlist.id);
      setFollowing(false);
    } else {
      await followPlaylist(user.id, playlist.id);
      setFollowing(true);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  const poems = (playlist?.playlist_poems || []).map((pp: any) => pp.poem).filter(Boolean);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{playlist.title}</Text>
        {playlist.description && <Text style={styles.desc}>{playlist.description}</Text>}
        <View style={styles.stats}>
          <Text style={styles.stat}>{playlist.follower_count || 0} followers</Text>
          <Text style={styles.stat}>{playlist.play_count || 0} plays</Text>
          <Text style={styles.stat}>{poems.length} poems</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={18} color="white" />
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
          {user && (
            <TouchableOpacity style={[styles.followBtn, following && styles.followingBtn]} onPress={handleFollow}>
              <Text style={styles.followText}>{following ? 'Following' : 'Follow'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={poems}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <PoemCard
            poem={item}
            onPress={() => navigation.navigate('PoemDetail', { poem: item })}
            onAuthorPress={() => navigation.navigate('AuthorProfile', { author: item.author })}
            onLike={() => {}}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: 'white', padding: 20, borderBottomWidth: 1, borderBottomColor: '#ecf0f1' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  desc: { color: '#7f8c8d', marginTop: 6 },
  stats: { flexDirection: 'row', gap: 16, marginTop: 12 },
  stat: { color: '#636e72', fontSize: 13 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#3498db', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  shareText: { color: 'white', fontWeight: '600' },
  followBtn: { backgroundColor: '#00b894', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  followingBtn: { backgroundColor: '#bdc3c7' },
  followText: { color: 'white', fontWeight: '600' },
});

export default PublicPlaylistScreen;
