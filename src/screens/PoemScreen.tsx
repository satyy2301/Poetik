import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { incrementPoemLikes } from '../services/poemService';
import { getUserPlaylists, addPoemToPlaylist } from '../features/playlists/playlistService';
import { openAuthorProfile, resolvePoemForDetail } from '../navigation/navigationHelpers';
import { Poem } from '../types/poem';

const PoemScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const colors = theme.colors;
  const { user } = useAuth();

  const [poemData, setPoemData] = useState<Poem | null>(route.params?.poem || null);
  const [loading, setLoading] = useState(!route.params?.poem?.content);
  const [isLiking, setIsLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);

  const loadPoem = useCallback(async () => {
    setLoading(true);
    try {
      const poem = await resolvePoemForDetail(
        route.params?.poem,
        route.params?.poemId,
      );
      setPoemData(poem);
    } catch {
      Alert.alert('Error', 'Could not load poem');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [route.params, navigation]);

  useEffect(() => {
    if (!poemData?.content) {
      loadPoem();
    }
  }, [poemData?.content, loadPoem]);

  if (loading || !poemData) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const themeDisplay =
    poemData.themes && poemData.themes.length > 0
      ? poemData.themes[0]
      : 'General';

  const author = poemData.author;
  const authorName =
    typeof author === 'string' ? author : author?.name || 'Unknown';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${poemData.title}\n\n${poemData.content}\n\n— ${authorName}`,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLike = async () => {
    if (!poemData.id || isLiking || isLiked) return;
    setIsLiking(true);
    try {
      await incrementPoemLikes(poemData.id);
      setPoemData((prev) =>
        prev ? { ...prev, like_count: (prev.like_count || 0) + 1 } : prev,
      );
      setIsLiked(true);
    } catch {
      Alert.alert('Error', 'Could not like poem');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Login required', 'Sign in to save poems to playlists.');
      return;
    }
    const { data } = await getUserPlaylists(user.id);
    setPlaylists(data);
    setShowPlaylistModal(true);
  };

  const handleAddToPlaylist = async (playlistId: string, title: string) => {
    const { error } = await addPoemToPlaylist(playlistId, poemData.id);
    if (error) {
      Alert.alert('Error', error.message.includes('already') ? 'Already in playlist' : 'Could not add poem');
      return;
    }
    setShowPlaylistModal(false);
    Alert.alert('Saved', `Added to "${title}"`);
  };

  const handleAuthorPress = () => {
    const authorId = typeof author === 'object' ? author?.id : poemData.author_id;
    if (authorId || author) {
      openAuthorProfile(navigation, authorId || (author as any));
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={[styles.poemContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.themeTag, { backgroundColor: colors.border, color: colors.textSecondary }]}>
          {themeDisplay}
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>{poemData.title}</Text>
        <Text style={[styles.content, { color: colors.text }]}>{poemData.content}</Text>
        <TouchableOpacity onPress={handleAuthorPress}>
          <Text style={[styles.author, { color: colors.primary }]}>— {authorName}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={[styles.reads, { color: colors.textSecondary }]}>
          {poemData.like_count || 0} likes
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
            disabled={isLiking || isLiked}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color="#e17055"
            />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {poemData.like_count || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Ionicons name="bookmark-outline" size={24} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={24} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showPlaylistModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add to playlist</Text>
            <FlatList
              data={playlists}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={{ color: colors.textSecondary, textAlign: 'center', padding: 16 }}>
                  No playlists yet. Create one from Profile → Playlists.
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.playlistRow, { borderBottomColor: colors.border }]}
                  onPress={() => handleAddToPlaylist(item.id, item.title)}
                >
                  <Text style={{ color: colors.text, fontWeight: '600' }}>{item.title}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {item.playlist_poems?.length || 0} poems
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowPlaylistModal(false)}>
              <Text style={{ color: colors.primary }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: {
    marginTop: 50,
    marginLeft: 20,
    marginBottom: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  poemContainer: {
    borderRadius: 15,
    padding: 25,
    margin: 20,
    marginBottom: 20,
    elevation: 5,
  },
  themeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 12,
    marginBottom: 10,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  content: { fontSize: 18, lineHeight: 30, marginBottom: 20 },
  author: { fontSize: 16, textAlign: 'right', fontWeight: '600' },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reads: { fontSize: 14 },
  actions: { flexDirection: 'row' },
  actionButton: { flexDirection: 'row', alignItems: 'center', marginLeft: 20 },
  actionText: { marginLeft: 5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  playlistRow: { paddingVertical: 14, borderBottomWidth: 1 },
  modalClose: { padding: 16, alignItems: 'center' },
});

export default PoemScreen;
