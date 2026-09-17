import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import PoemCard from '../components/PoemCard';
import {
  getPlaylistById,
  removePoemFromPlaylist,
  setPlaylistPublic,
  updatePlaylist,
} from '../features/playlists/playlistService';
import { incrementPoemLikes } from '../services/poemService';
import { openAuthorProfile, openPoemDetail } from '../navigation/navigationHelpers';

const PlaylistDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const colors = theme.colors;

  const initialPlaylist = route.params?.playlist;
  const playlistId = route.params?.playlistId || initialPlaylist?.id;

  const [playlist, setPlaylist] = useState<any>(initialPlaylist || null);
  const [loading, setLoading] = useState(!initialPlaylist?.playlist_poems);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const loadPlaylist = useCallback(async () => {
    if (!playlistId) return;
    setLoading(true);
    try {
      const data = await getPlaylistById(playlistId);
      setPlaylist(data);
    } catch {
      Alert.alert('Error', 'Could not load playlist');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [playlistId, navigation]);

  useEffect(() => {
    if (!initialPlaylist?.playlist_poems && playlistId) {
      loadPlaylist();
    }
  }, [initialPlaylist, playlistId, loadPlaylist]);

  const poems = (playlist?.playlist_poems || [])
    .map((pp: any) => pp.poem)
    .filter(Boolean);

  const handleRemove = (poemId: string, title: string) => {
    Alert.alert('Remove poem', `Remove "${title}" from this playlist?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removePoemFromPlaylist(playlist.id, poemId);
          setPlaylist((prev: any) => ({
            ...prev,
            playlist_poems: prev.playlist_poems.filter(
              (pp: any) => pp.poem?.id !== poemId,
            ),
          }));
        },
      },
    ]);
  };

  const handleTogglePublic = async () => {
    try {
      const { data } = await setPlaylistPublic(
        playlist.id,
        !playlist.is_public,
        playlist.title,
      );
      setPlaylist((prev: any) => ({ ...prev, ...data }));
    } catch {
      Alert.alert('Error', 'Could not update visibility');
    }
  };

  const handleShare = async () => {
    if (!playlist.share_slug) {
      Alert.alert('Make public first', 'Toggle public to generate a share link.');
      return;
    }
    await Share.share({
      message: `Check out my playlist: ${playlist.title}\nhttps://poetik.app/playlist/${playlist.share_slug}`,
    });
  };

  const handleSaveEdit = async () => {
    try {
      const { data } = await updatePlaylist(playlist.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setPlaylist((prev: any) => ({ ...prev, ...data }));
      setShowEditModal(false);
    } catch {
      Alert.alert('Error', 'Could not update playlist');
    }
  };

  const openEdit = () => {
    setEditTitle(playlist.title || '');
    setEditDescription(playlist.description || '');
    setShowEditModal(true);
  };

  if (loading || !playlist) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.text }]}>{playlist.title}</Text>
          {playlist.description && (
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{playlist.description}</Text>
          )}
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {poems.length} {poems.length === 1 ? 'poem' : 'poems'}
            {playlist.is_public ? ' · Public' : ' · Private'}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={openEdit}>
              <Ionicons name="create-outline" size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleTogglePublic}>
              <Ionicons
                name={playlist.is_public ? 'globe' : 'globe-outline'}
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
            {playlist.is_public && (
              <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color="#2ecc71" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <FlatList
        data={poems}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            No poems in this playlist yet. Add poems from the Read feed.
          </Text>
        }
        renderItem={({ item }) => (
          <View>
            <PoemCard
              poem={item}
              onPress={() => openPoemDetail(navigation, item)}
              onAuthorPress={() => openAuthorProfile(navigation, item.author)}
              onLike={async () => {
                await incrementPoemLikes(item.id);
              }}
            />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemove(item.id, item.title)}
            >
              <Ionicons name="remove-circle-outline" size={18} color="#e74c3c" />
              <Text style={styles.removeText}>Remove from playlist</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Playlist</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Title"
              placeholderTextColor={colors.textSecondary}
            />
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="Description"
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEditModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSaveEdit}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, borderBottomWidth: 1 },
  backBtn: { marginBottom: 8 },
  headerContent: { paddingLeft: 4 },
  title: { fontSize: 24, fontWeight: 'bold' },
  desc: { marginTop: 6, fontSize: 15 },
  meta: { marginTop: 8, fontSize: 13 },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  actionBtn: { padding: 10, borderRadius: 20 },
  iconBtn: { padding: 8 },
  list: { padding: 12 },
  empty: { textAlign: 'center', marginTop: 40, paddingHorizontal: 24 },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingBottom: 12 },
  removeText: { color: '#e74c3c', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 12, alignItems: 'center' },
  saveBtn: { flex: 1, padding: 12, borderRadius: 20, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: '600' },
});

export default PlaylistDetailScreen;
