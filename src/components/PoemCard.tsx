// src/components/PoemCard.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
  Animated,
  Platform,
  Share,
  TextInput,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { deletePoem } from '../services/poemService';
import { getUserPlaylists, addPoemToPlaylist, createPlaylist } from '../features/playlists/playlistService';
import { hapticMedium } from '../utils/haptics';
import ReportModal from './ReportModal';
import FormattedText from './FormattedText';
import { palette } from '../theme/tokens/colors';

const formatTimestamp = (dateStr?: string) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const PoemCard = ({
  poem,
  onPress,
  onAuthorPress,
  onLike,
  onRemove,
}: {
  poem: any;
  onPress: () => void;
  onAuthorPress: () => void;
  onLike: () => void;
  onRemove?: (poemId: string) => void;
}) => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const colors = theme.colors;
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const heartScale = useRef(new Animated.Value(1)).current;

  const animateHeart = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.35, useNativeDriver: true, damping: 12 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, damping: 12 }),
    ]).start();
  };

  const handleLike = (e?: any) => {
    e?.stopPropagation?.();
    setIsLiked(!isLiked);
    animateHeart();
    hapticMedium();
    onLike();
  };

  const handleAddToPlaylist = async (e?: any) => {
    e?.stopPropagation?.();
    if (!user) {
      Alert.alert('Login Required', 'Please login to save poems to playlists');
      return;
    }
    setIsLoadingPlaylists(true);
    try {
      const { data } = await getUserPlaylists(user.id);
      setPlaylists(data || []);
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
        if ((error as Error).message?.includes('already in playlist')) {
          Alert.alert('Already Added', 'This poem is already in the playlist');
        } else {
          Alert.alert('Error', 'Failed to add poem to playlist');
        }
        return;
      }
      setIsSaved(true);
      Alert.alert('Success', `Added to "${playlistTitle}"`);
      setShowPlaylistModal(false);
    } catch (error) {
      console.error('Error adding to playlist:', error);
      Alert.alert('Error', 'Failed to add poem to playlist');
    }
  };

  const handleCreatePlaylist = async () => {
    const title = newPlaylistTitle.trim();
    if (!user) {
      Alert.alert('Login Required', 'Please login to save poems to playlists');
      return;
    }
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
      const added = await addPoemToPlaylist(data.id, poem.id);
      if (added.error) {
        Alert.alert('Error', 'The playlist was created, but the poem was not saved.');
        return;
      }
      setIsSaved(true);
      setNewPlaylistTitle('');
      setShowPlaylistModal(false);
      Alert.alert('Saved', `Added to "${title}"`);
    } catch (error) {
      console.error('Error creating playlist:', error);
      Alert.alert('Error', 'Could not create the playlist');
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  const ownerId = poem.author_id || poem.author?.id;
  const isOwner = !!user && ownerId === user.id;

  const handleMoreOptions = (e?: any) => {
    e?.stopPropagation?.();
    if (!user) {
      Alert.alert('Login Required', 'Please login to manage this poem');
      return;
    }
    setConfirmDelete(false);
    setDeleteError('');
    setShowOptions(true);
  };

  const handleEdit = () => {
    setShowOptions(false);
    const params = { editPoem: poem };
    const routeNames: string[] = navigation.getState?.()?.routeNames || [];
    if (routeNames.includes('Write')) {
      navigation.navigate('Write', params);
      return;
    }
    navigation.navigate('MainTabs', { screen: 'Write', params });
  };

  const handleDelete = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await deletePoem(poem.id, user.id);
      setShowOptions(false);
      onRemove?.(poem.id);
    } catch (error: any) {
      setDeleteError(error.message || 'Could not delete this poem.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async (e?: any) => {
    e?.stopPropagation?.();
    try {
      await Share.share({
        message: `"${poem.title || 'Untitled'}" by @${poem.author?.name || 'Unknown'}\n\n${poem.content?.slice(0, 200)}`,
      });
    } catch (_) {
      // user cancelled
    }
  };

  const authorInitial = (poem.author?.name || 'U')[0].toUpperCase();
  const tags = [
    ...(poem.form ? [poem.form] : []),
    ...(poem.themes?.slice(0, 2) || []),
  ];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.bgSurface,
            borderColor: colors.borderMuted,
          },
          theme.shadows.card,
        ]}
      >
        <View style={styles.authorRow}>
          <TouchableOpacity onPress={onAuthorPress} style={styles.authorInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.brandPrimary }]}>
              <Text style={styles.avatarText}>{authorInitial}</Text>
            </View>
            <View style={styles.authorMeta}>
              <Text style={[styles.handle, theme.typography.labelBold, { color: colors.textPrimary }]} numberOfLines={1}>
                @{poem.author?.name || 'Unknown'}
              </Text>
              <Text style={[styles.timestamp, theme.typography.bodySm, { color: colors.textSecondary }]}>
                {formatTimestamp(poem.created_at)}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={handleMoreOptions}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <Text
            style={[theme.typography.poemTitle, styles.title, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {poem.title || 'Untitled'}
          </Text>

          {tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.map((tag: string, index: number) => (
                <View
                  key={index}
                  style={[styles.tag, { backgroundColor: colors.cardHeaderTint }]}
                >
                  <Text style={[styles.tagText, { color: colors.brandSecondary }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.contentWrapper}>
            <FormattedText
              value={poem.content || ''}
              numberOfLines={4}
              style={{ ...theme.typography.poemBody, color: colors.textSecondary }}
            />
            {Platform.OS === 'web' && (
              <LinearGradient
                colors={[`${colors.bgSurface}00`, colors.bgSurface]}
                style={styles.fadeMask}
                pointerEvents="none"
              />
            )}
          </View>
        </View>

        <View style={[styles.actionsRow, { borderTopColor: colors.borderSubtle }]}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={18}
                color={colors.likeHeart}
              />
            </Animated.View>
            <Text style={[styles.actionCount, { color: colors.textSecondary }]}>
              {poem.like_count || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={handleAddToPlaylist}
            disabled={isLoadingPlaylists}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isSaved ? colors.bookmarkGold : colors.textSecondary}
            />
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>Share</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showOptions} transparent animationType="fade" onRequestClose={() => setShowOptions(false)}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowOptions(false)} />
            <View style={[styles.optionsSheet, { backgroundColor: colors.bgElevated, borderColor: colors.borderMuted }]}>
              <Text style={[theme.typography.headerTitle, { color: colors.textPrimary, marginBottom: 12 }]}>
                {poem.title || 'Untitled'}
              </Text>
              {confirmDelete ? (
                <>
                  <Text style={[theme.typography.bodySm, { color: colors.textSecondary, marginBottom: 16 }]}>
                    Delete this poem from your folio? This cannot be undone.
                  </Text>
                  {!!deleteError && (
                    <Text style={[theme.typography.bodySm, { color: colors.error, marginBottom: 12 }]}>
                      {deleteError}
                    </Text>
                  )}
                  <TouchableOpacity
                    style={[styles.optionBtn, { backgroundColor: colors.errorContainer }]}
                    onPress={handleDelete}
                    disabled={isDeleting}
                  >
                    <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>
                      {isDeleting ? 'Deleting...' : 'Delete poem'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.optionBtn} onPress={() => setConfirmDelete(false)}>
                    <Text style={[theme.typography.labelBold, { color: colors.textSecondary }]}>Keep it</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {isOwner ? (
                    <>
                      <TouchableOpacity style={[styles.optionBtn, { borderColor: colors.borderMuted, borderWidth: 1 }]} onPress={handleEdit}>
                        <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>Edit poem</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.optionBtn, { borderColor: colors.error, borderWidth: 1 }]} onPress={() => setConfirmDelete(true)}>
                        <Text style={[theme.typography.labelBold, { color: colors.error }]}>Delete poem</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={[styles.optionBtn, { borderColor: colors.borderMuted, borderWidth: 1 }]}
                      onPress={() => {
                        setShowOptions(false);
                        setShowReportModal(true);
                      }}
                    >
                      <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>Report</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.optionBtn} onPress={() => setShowOptions(false)}>
                    <Text style={[theme.typography.labelBold, { color: colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={showPlaylistModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowPlaylistModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.bgSurface }]}>
              <Text style={[theme.typography.displaySm, { color: colors.textPrimary, textAlign: 'center', marginBottom: 20 }]}>
                Add to Playlist
              </Text>

              <View style={[styles.createRow, { borderColor: colors.borderMuted, backgroundColor: colors.bgCanvas }]}>
                <TextInput
                  value={newPlaylistTitle}
                  onChangeText={setNewPlaylistTitle}
                  placeholder="New playlist name"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.createInput, { color: colors.textPrimary }]}
                  editable={!isCreatingPlaylist}
                />
                <TouchableOpacity
                  onPress={handleCreatePlaylist}
                  disabled={isCreatingPlaylist}
                  accessibilityLabel="Create playlist and save poem"
                >
                  <Text style={[theme.typography.labelBold, { color: colors.brandPrimary }]}>
                    {isCreatingPlaylist ? 'Saving...' : 'Create'}
                  </Text>
                </TouchableOpacity>
              </View>

              {playlists.length === 0 ? (
                <View style={styles.noPlaylistsContainer}>
                  <MaterialIcons name="playlist-add" size={48} color={colors.textSecondary} />
                  <Text style={[theme.typography.emptyTitle, { color: colors.textPrimary, marginTop: 15 }]}>
                    No playlists yet
                  </Text>
                  <Text style={[theme.typography.emptyDescription, { color: colors.textSecondary, marginTop: 5, textAlign: 'center' }]}>
                    Name one above and this poem is saved into it.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={playlists}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item: playlist }) => (
                    <TouchableOpacity
                      style={[styles.playlistItem, { borderBottomColor: colors.borderMuted }]}
                      onPress={() => handleSelectPlaylist(playlist.id, playlist.title)}
                    >
                      <View style={styles.playlistInfo}>
                        <Text style={[theme.typography.bodyMd, { color: colors.textPrimary, fontFamily: 'Inter-Bold' }]}>
                          {playlist.title}
                        </Text>
                        <Text style={[theme.typography.bodySm, { color: colors.textSecondary }]}>
                          {playlist.playlist_poems?.length || 0} poems
                        </Text>
                      </View>
                      <MaterialIcons name="add" size={24} color={colors.brandPrimary} />
                    </TouchableOpacity>
                  )}
                  style={styles.playlistsList}
                />
              )}

              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: colors.bgElevated }]}
                onPress={() => setShowPlaylistModal(false)}
              >
                <Text style={[theme.typography.labelBold, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {user && (
          <ReportModal
            visible={showReportModal}
            onClose={() => setShowReportModal(false)}
            reporterId={user.id}
            targetType="poem"
            targetId={poem.id}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 2,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  authorMeta: {
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: palette.ink,
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  handle: {
    fontSize: 13,
  },
  timestamp: {
    marginTop: 1,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  title: {
    marginBottom: 8,
  },
  contentWrapper: {
    marginTop: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  fadeMask: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tagText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
  },
  actionCount: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  actionLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
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
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 44,
    marginBottom: 12,
  },
  createInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  noPlaylistsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  optionsSheet: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  optionBtn: {
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
  },
  modalCloseButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
});

export default React.memo(PoemCard);
