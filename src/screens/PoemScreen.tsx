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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { incrementPoemLikes } from '../services/poemService';
import { getUserPlaylists, addPoemToPlaylist, createPlaylist } from '../features/playlists/playlistService';
import { openAuthorProfile, resolvePoemForDetail } from '../navigation/navigationHelpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Poem } from '../types/poem';
import FormattedText from '../components/FormattedText';

const PoemScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();

  const [poemData, setPoemData] = useState<Poem | null>(route.params?.poem || null);
  const [loading, setLoading] = useState(!route.params?.poem?.content);
  const [isLiking, setIsLiking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

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
      <View style={[styles.container, { backgroundColor: colors.bgCanvas, paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.headerSide} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          <Text style={[styles.headerLabel, { color: colors.textPrimary }]}>Back</Text>
        </TouchableOpacity>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandPrimary} />
        </View>
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
    try {
      const { data } = await getUserPlaylists(user.id);
      setPlaylists(data || []);
      setShowPlaylistModal(true);
    } catch {
      Alert.alert('Error', 'Could not load your playlists');
    }
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

  const handleCreatePlaylist = async () => {
    const title = newPlaylistTitle.trim();
    if (!user || !poemData) return;
    if (!title) {
      Alert.alert('Name required', 'Give the new playlist a name.');
      return;
    }
    setIsCreatingPlaylist(true);
    try {
      const { data, error } = await createPlaylist(user.id, title);
      if (error || !data?.id) {
        Alert.alert('Error', 'Could not create the playlist');
        return;
      }
      const added = await addPoemToPlaylist(data.id, poemData.id);
      if (added.error) {
        Alert.alert('Error', 'The playlist was created, but the poem was not saved.');
        return;
      }
      setNewPlaylistTitle('');
      setShowPlaylistModal(false);
      Alert.alert('Saved', `Added to "${title}"`);
    } catch {
      Alert.alert('Error', 'Could not create the playlist');
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const handleAuthorPress = () => {
    const authorId = typeof author === 'object' ? author?.id : poemData.author_id;
    if (authorId || author) {
      openAuthorProfile(navigation, authorId || (author as any));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCanvas }]}>
      <View style={[styles.header, { paddingTop: insets.top, borderBottomColor: colors.borderMuted, backgroundColor: colors.bgCanvas }]}>
        <TouchableOpacity style={styles.headerSide} onPress={() => navigation.goBack()} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          <Text style={[styles.headerLabel, { color: colors.textPrimary }]}>Back</Text>
        </TouchableOpacity>
        <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.textSecondary }]}>{poemData.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[theme.typography.displaySm, styles.title, { color: colors.textPrimary }]}>{poemData.title}</Text>
        <TouchableOpacity onPress={handleAuthorPress} style={styles.authorRow}>
          <Text style={[styles.authorName, { color: colors.brandSecondary }]}>{authorName}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.brandSecondary} />
        </TouchableOpacity>

        <View style={styles.metaRow}>
          {poemData.form ? (
            <Text style={[styles.metaChip, { color: colors.textSecondary, borderColor: colors.borderSubtle }]}>{poemData.form}</Text>
          ) : null}
          {poemData.language ? (
            <Text style={[styles.metaChip, { color: colors.textSecondary, borderColor: colors.borderSubtle }]}>
              {poemData.language === 'hi' ? 'Hindi' : poemData.language === 'ur' ? 'Urdu' : poemData.language === 'en' ? 'English' : poemData.language}
            </Text>
          ) : null}
          {poemData.era ? (
            <Text style={[styles.metaChip, { color: colors.textSecondary, borderColor: colors.borderSubtle }]}>{poemData.era}</Text>
          ) : null}
          {themeDisplay ? (
            <Text style={[styles.metaChip, { color: colors.textSecondary, borderColor: colors.borderSubtle }]}>{themeDisplay}</Text>
          ) : null}
          <Text style={[styles.metaChip, { color: colors.textSecondary, borderColor: colors.borderSubtle }]}>{wordCount} words</Text>
        </View>

        <View style={[styles.well, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
          <FormattedText value={poemData.content} style={{ ...theme.typography.poemBody, color: colors.textPrimary }} />
        </View>
      </ScrollView>

      <View style={[styles.actions, { borderTopColor: colors.borderMuted, backgroundColor: colors.bgCanvas, paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike} disabled={isLiking || isLiked}>
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={colors.likeHeart} />
          <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{poemData.like_count || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
          <Ionicons name="bookmark-outline" size={22} color={colors.brandSecondary} />
          <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color={colors.textSecondary} />
          <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Share</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showPlaylistModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bgElevated, borderColor: colors.borderMuted }]}>
            <Text style={[theme.typography.headerTitle, { color: colors.textPrimary, textAlign: 'center' }]}>Add to playlist</Text>
            <View style={[styles.createRow, { borderColor: colors.borderMuted, backgroundColor: colors.bgCanvas }]}>
              <TextInput
                value={newPlaylistTitle}
                onChangeText={setNewPlaylistTitle}
                placeholder="New playlist name"
                placeholderTextColor={colors.textMuted}
                style={[styles.createInput, { color: colors.textPrimary }]}
                editable={!isCreatingPlaylist}
              />
              <TouchableOpacity onPress={handleCreatePlaylist} disabled={isCreatingPlaylist}>
                <Text style={[theme.typography.labelBold, { color: colors.brandPrimary }]}>
                  {isCreatingPlaylist ? 'Saving...' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={playlists}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={[theme.typography.bodySm, { color: colors.textSecondary, textAlign: 'center', padding: 16 }]}>
                  No playlists yet. Name one above to save this poem.
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 28 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  headerSide: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 72,
    minHeight: 44,
    paddingRight: 8,
  },
  headerLabel: { fontSize: 16, fontWeight: '600', marginLeft: 2 },
  headerTitle: { flex: 1, fontSize: 14, textAlign: 'center' },
  headerSpacer: { width: 72 },
  title: { marginTop: 4 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 8 },
  authorName: { fontSize: 16, fontWeight: '600' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  metaChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  well: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 16,
    paddingLeft: 16,
    paddingRight: 20,
    paddingVertical: 20,
    width: '100%',
    alignSelf: 'stretch',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, paddingHorizontal: 4 },
  actionLabel: { fontSize: 13, fontWeight: '600' },
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
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
    marginTop: 16,
    marginBottom: 8,
  },
  createInput: { flex: 1, fontSize: 15, paddingVertical: 8 },
  modalClose: { padding: 16, alignItems: 'center' },
});

export default PoemScreen;
