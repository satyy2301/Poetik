// src/screens/PlaylistScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, Pressable } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUserPlaylists, createPlaylist, deletePlaylist, setPlaylistPublic } from '../features/playlists/playlistService';
import { Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { openPlaylistDetail } from '../navigation/navigationHelpers';

const PlaylistScreen = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;
  const navigation = useNavigation<any>();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data } = await getUserPlaylists(user.id);
      setPlaylists(data);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) {
      Alert.alert('Error', 'Please enter a playlist title');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await createPlaylist(user.id, newPlaylistTitle, newPlaylistDescription);

      if (error) {
        Alert.alert('Error', 'Failed to create playlist');
        return;
      }

      setPlaylists((prev) => [data, ...prev]);
      setNewPlaylistTitle('');
      setNewPlaylistDescription('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
      Alert.alert('Error', 'Failed to create playlist');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePlaylist = (playlistId: string, title: string) => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlaylist(playlistId);
              setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
            } catch (error) {
              console.error('Error deleting playlist:', error);
              Alert.alert('Error', 'Failed to delete playlist');
            }
          },
        },
      ],
    );
  };

  const handleTogglePublic = async (playlist: any) => {
    try {
      const { data } = await setPlaylistPublic(playlist.id, !playlist.is_public, playlist.title);
      setPlaylists((prev) => prev.map((p) => (p.id === playlist.id ? { ...p, ...data } : p)));
    } catch {
      Alert.alert('Error', 'Could not update playlist visibility');
    }
  };

  const handleSharePlaylist = async (playlist: any) => {
    if (!playlist.share_slug) {
      Alert.alert('Make public first', 'Toggle public to generate a share link.');
      return;
    }
    await Share.share({
      message: `Check out my playlist: ${playlist.title}\nhttps://poetik.app/playlist/${playlist.share_slug}`,
    });
  };

  const renderPlaylistItem = ({ item: playlist }: { item: any }) => {
    const poemCount = playlist.playlist_poems?.length || 0;

    return (
      <View style={[styles.playlistCard, { backgroundColor: colors.surface }]}>
        <Pressable
          style={styles.playlistInfo}
          onPress={() => openPlaylistDetail(navigation, playlist)}
        >
          <Text style={[styles.playlistTitle, { color: colors.text }]}>{playlist.title}</Text>
          {playlist.description && (
            <Text style={[styles.playlistDescription, { color: colors.textSecondary }]}>
              {playlist.description}
            </Text>
          )}
          <Text style={[styles.playlistMeta, { color: colors.textSecondary }]}>
            {poemCount} {poemCount === 1 ? 'poem' : 'poems'}
            {playlist.is_public ? ' · Public' : ''}
          </Text>
        </Pressable>

        <View style={styles.playlistActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleTogglePublic(playlist)}>
            <Ionicons
              name={playlist.is_public ? 'globe' : 'globe-outline'}
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
          {playlist.is_public && (
            <TouchableOpacity style={styles.actionButton} onPress={() => handleSharePlaylist(playlist)}>
              <Ionicons name="share-outline" size={20} color="#2ecc71" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeletePlaylist(playlist.id, playlist.title)}
          >
            <Ionicons name="trash-outline" size={20} color="#e74c3c" />
          </TouchableOpacity>
          <Pressable onPress={() => openPlaylistDetail(navigation, playlist)} hitSlop={8}>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Playlists</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaylistItem}
        contentContainerStyle={styles.listContainer}
        refreshing={isLoading}
        onRefresh={loadPlaylists}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No Playlists Yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Create your first playlist to organize your favorite poems
              </Text>
              <TouchableOpacity
                style={[styles.emptyCreateButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.emptyCreateButtonText}>Create Playlist</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create New Playlist</Text>

            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Playlist title"
              placeholderTextColor={colors.textSecondary}
              value={newPlaylistTitle}
              onChangeText={setNewPlaylistTitle}
              maxLength={100}
            />

            <TextInput
              style={[styles.modalInput, styles.descriptionInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textSecondary}
              value={newPlaylistDescription}
              onChangeText={setNewPlaylistDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: colors.border }]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewPlaylistTitle('');
                  setNewPlaylistDescription('');
                }}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: colors.primary }, isCreating && styles.confirmButtonDisabled]}
                onPress={handleCreatePlaylist}
                disabled={isCreating}
              >
                <Text style={styles.confirmButtonText}>
                  {isCreating ? 'Creating...' : 'Create'}
                </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: { padding: 15 },
  playlistCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  playlistInfo: { flex: 1, paddingRight: 8 },
  playlistTitle: { fontSize: 18, fontWeight: 'bold' },
  playlistDescription: { fontSize: 14, marginTop: 4 },
  playlistMeta: { fontSize: 12, marginTop: 8 },
  playlistActions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { padding: 8, marginRight: 4 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 20 },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  emptyCreateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  emptyCreateButtonText: { color: 'white', fontWeight: '600', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  descriptionInput: { minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 },
  cancelButton: { flex: 1, padding: 12, borderRadius: 25, alignItems: 'center' },
  confirmButton: { flex: 1, padding: 12, borderRadius: 25, alignItems: 'center' },
  confirmButtonDisabled: { opacity: 0.6 },
  confirmButtonText: { color: 'white', fontWeight: '600' },
});

export default PlaylistScreen;
