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
import FormattedText from '../components/FormattedText';

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
      ? poemData.themes.join(' · ')
      : null;

  const wordCount = poemData.word_count
    || poemData.content.trim().split(/\s+/).filter(Boolean).length;

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
      const msg = (error as Error).message || '';
      Alert.alert('Error', msg.includes('already') ? 'Already in playlist' : 'Could not add poem');
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
    <ScrollView style={[styles.container, { backgroundColor: colors.bgCanvas }]} contentContainerStyle={styles.scroll}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        <Text style={[theme.typography.labelMono, { color: colors.accent, marginLeft: 8 }]}>FOLIO</Text>
      </TouchableOpacity>

      <Text style={[theme.typography.labelMono, { color: colors.brandSecondary }]}>
        {(poemData.form || 'VERSE').toUpperCase()}
      </Text>
      <Text style={[theme.typography.displaySm, { color: colors.textPrimary, marginTop: 8 }]}>{poemData.title}</Text>
      <TouchableOpacity onPress={handleAuthorPress}>
        <Text style={[theme.typography.bodyMd, { color: colors.brandSecondary, marginTop: 6 }]}>{authorName}</Text>
      </TouchableOpacity>

      <View style={[styles.well, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted, borderLeftColor: colors.brandPrimary }]}>
        <FormattedText value={poemData.content} style={{ ...theme.typography.poemBody, color: colors.textPrimary }} />
      </View>

      <View style={styles.metaRow}>
        {poemData.form ? (
          <Text style={[theme.typography.labelMono, { color: colors.accent }]}>{poemData.form.toUpperCase()}</Text>
        ) : null}
        {themeDisplay ? (
          <Text style={[theme.typography.labelMono, { color: colors.textSecondary }]}>{themeDisplay.toUpperCase()}</Text>
        ) : null}
        <Text style={[theme.typography.labelMono, { color: colors.textSecondary }]}>{wordCount} WORDS</Text>
        {poemData.era ? (
          <Text style={[theme.typography.labelMono, { color: colors.textSecondary }]}>{poemData.era.toUpperCase()}</Text>
        ) : null}
      </View>

      <View style={[styles.actions, { borderTopColor: colors.borderMuted }]}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike} disabled={isLiking || isLiked}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={colors.likeHeart} />
          <Text style={[theme.typography.labelMono, { color: colors.textSecondary }]}>{poemData.like_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
          <Ionicons name="bookmark-outline" size={22} color={colors.accent} />
          <Text style={[theme.typography.labelMono, { color: colors.textSecondary }]}>SAVE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={22} color={colors.textSecondary} />
          <Text style={[theme.typography.labelMono, { color: colors.textSecondary }]}>SHARE</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showPlaylistModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgElevated, borderColor: colors.borderMuted }]}>
            <Text style={[theme.typography.headerTitle, { color: colors.textPrimary, textAlign: 'center' }]}>Add to playlist</Text>
            <FlatList
              data={playlists}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={[theme.typography.bodySm, { color: colors.textSecondary, textAlign: 'center', padding: 16 }]}>
                  No playlists yet. Create one from Profile.
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.playlistRow, { borderBottomColor: colors.borderMuted }]}
                  onPress={() => handleAddToPlaylist(item.id, item.title)}
                >
                  <Text style={[theme.typography.bodyMd, { color: colors.textPrimary }]}>{item.title}</Text>
                  <Text style={[theme.typography.labelMono, { color: colors.accent }]}>
                    {item.playlist_poems?.length || 0} POEMS
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowPlaylistModal(false)}>
              <Text style={[theme.typography.labelBold, { color: colors.brandSecondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 44,
  },
  well: {
    marginTop: 20,
    borderWidth: 1,
    borderLeftWidth: 2,
    borderRadius: 8,
    padding: 18,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 17, 12, 0.72)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 1,
    padding: 20,
    maxHeight: '60%',
  },
  playlistRow: { paddingVertical: 14, borderBottomWidth: 1 },
  modalClose: { padding: 16, alignItems: 'center' },
});

export default PoemScreen;
