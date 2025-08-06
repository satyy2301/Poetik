// src/components/PoemCard.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal, FlatList, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUserPlaylists, addPoemToPlaylist } from '../features/playlists/playlistService';

const PoemCard = ({ poem, onPress, onAuthorPress, onLike }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = theme.colors;
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const previewContent = poem.content.length > 150 
    ? `${poem.content.substring(0, 150)}...` 
    : poem.content;

  const handleAddToPlaylist = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to add poems to playlists');
      return;
    }

    setIsLoadingPlaylists(true);
    try {
      const { data } = await getUserPlaylists(user.id);
      setPlaylists(data);
      setShowPlaylistModal(true);
    } catch (error) {
      console.error('Error loading playlists:', error);
      Alert.alert('Error', 'Failed to load playlists');
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const handleSelectPlaylist = async (playlistId: string, playlistTitle: string) => {
    try {
      const { error } = await addPoemToPlaylist(playlistId, poem.id);
      
      if (error) {
        if (error.message.includes('already in playlist')) {
          Alert.alert('Already Added', 'This poem is already in the playlist');
        } else {
          Alert.alert('Error', 'Failed to add poem to playlist');
        }
        return;
      }

      Alert.alert('Success', `Added to "${playlistTitle}"`);
      setShowPlaylistModal(false);
    } catch (error) {
      console.error('Error adding to playlist:', error);
      Alert.alert('Error', 'Failed to add poem to playlist');
    }
  };

  const renderPlaylistItem = ({ item: playlist }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => handleSelectPlaylist(playlist.id, playlist.title)}
    >
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistTitle}>{playlist.title}</Text>
        <Text style={styles.playlistCount}>
          {playlist.playlist_poems?.length || 0} poems
        </Text>
      </View>
      <MaterialIcons name="add" size={24} color="#3498db" />
    </TouchableOpacity>
  );

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Gradient Header */}
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientHeader}
        >
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: 'white' }]} numberOfLines={2}>
              {poem.title || 'Untitled'}
            </Text>
            <TouchableOpacity onPress={onAuthorPress} style={styles.authorBadge}>
              <Text style={styles.authorBadgeText}>@{poem.author?.name || 'Unknown'}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={[styles.content, { color: colors.text }]} numberOfLines={4}>
            {previewContent}
          </Text>
          
          {/* Themes */}
          {poem.themes?.length > 0 && (
            <View style={styles.themesContainer}>
              {poem.themes.slice(0, 3).map((theme, index) => (
                <View key={index} style={[styles.themePill, { backgroundColor: `${colors.primary}15` }]}>
                  <Text style={[styles.themeText, { color: colors.primary }]}>
                    {theme}
                  </Text>
                </View>
              ))}
              {poem.themes.length > 3 && (
                <View style={[styles.themePill, { backgroundColor: colors.border }]}>
                  <Text style={[styles.themeText, { color: colors.textSecondary }]}>
                    +{poem.themes.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Footer Actions */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View style={styles.metaInfo}>
            {poem.form && (
              <View style={styles.formBadge}>
                <MaterialIcons name="style" size={14} color={colors.textSecondary} />
                <Text style={[styles.formText, { color: colors.textSecondary }]}>{poem.form}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: isLiked ? `${colors.error}15` : 'transparent' }]} 
              onPress={() => {
                setIsLiked(!isLiked);
                onLike();
              }}
            >
              <MaterialIcons 
                name={isLiked ? "favorite" : "favorite-border"} 
                size={20} 
                color={colors.error}
              />
              <Text style={[styles.actionText, { color: colors.error }]}>
                {poem.like_count || 0}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleAddToPlaylist}
              disabled={isLoadingPlaylists}
            >
              <MaterialIcons 
                name="playlist-add" 
                size={20} 
                color={isLoadingPlaylists ? colors.textSecondary : colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal remains the same but with theme colors */}
        <Modal
          visible={showPlaylistModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPlaylistModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add to Playlist</Text>
              
              {playlists.length === 0 ? (
                <View style={styles.noPlaylistsContainer}>
                  <MaterialIcons name="playlist-add" size={48} color={colors.textSecondary} />
                  <Text style={[styles.noPlaylistsText, { color: colors.text }]}>No playlists found</Text>
                  <Text style={[styles.noPlaylistsSubtext, { color: colors.textSecondary }]}>
                    Create a playlist first to organize your poems
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={playlists}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item: playlist }) => (
                    <TouchableOpacity
                      style={[styles.playlistItem, { borderBottomColor: colors.border }]}
                      onPress={() => handleSelectPlaylist(playlist.id, playlist.title)}
                    >
                      <View style={styles.playlistInfo}>
                        <Text style={[styles.playlistTitle, { color: colors.text }]}>
                          {playlist.title}
                        </Text>
                        <Text style={[styles.playlistCount, { color: colors.textSecondary }]}>
                          {playlist.playlist_poems?.length || 0} poems
                        </Text>
                      </View>
                      <MaterialIcons name="add" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  style={styles.playlistsList}
                />
              )}

              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: colors.border }]}
                onPress={() => setShowPlaylistModal(false)}
              >
                <Text style={[styles.modalCloseButtonText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    overflow: 'hidden',
    marginHorizontal: 15,
  },
  gradientHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-VariableFont_wght',
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
    lineHeight: 26,
  },
  authorBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
  },
  authorBadgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  contentContainer: {
    padding: 16,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
    fontFamily: 'Inter-Regular',
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  themePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  themeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  formText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  // Modal styles
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
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-VariableFont_wght',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  playlistsList: {
    maxHeight: 300,
  },
  playlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  playlistCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  noPlaylistsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noPlaylistsText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginTop: 15,
  },
  noPlaylistsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 5,
  },
  playlistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  playlistCount: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  noPlaylistsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noPlaylistsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 15,
  },
  noPlaylistsSubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    textAlign: 'center',
    marginTop: 5,
  },
  modalCloseButton: {
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 15,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
});

export default PoemCard;