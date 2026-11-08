import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { PoemVersion } from '../../types/poem';
import {
  approveVersion,
  getPendingVersions,
  rejectVersion,
} from '../../services/moderationService';
import { palette } from '../../theme/tokens/colors';

const ModerationQueueScreen = () => {
  const { user } = useAuth();
  const [versions, setVersions] = useState<PoemVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPendingVersions();
      setVersions(data);
    } catch (error) {
      console.error('Failed to load moderation queue:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleApprove = async (version: PoemVersion) => {
    if (!user) return;

    try {
      await approveVersion(version.id, version.poem_id, user.id);
      setVersions((prev) => prev.filter((v) => v.id !== version.id));
      Alert.alert('Approved', 'Poem is now public.');
    } catch (error) {
      Alert.alert('Error', 'Could not approve poem.');
    }
  };

  const handleReject = async (version: PoemVersion) => {
    if (!user) return;

    try {
      await rejectVersion(version.id, version.poem_id, user.id, 'Does not meet guidelines');
      setVersions((prev) => prev.filter((v) => v.id !== version.id));
      Alert.alert('Rejected', 'Poem was rejected.');
    } catch (error) {
      Alert.alert('Error', 'Could not reject poem.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.emerald} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moderation Queue</Text>
      <Text style={styles.subtitle}>{versions.length} pending review</Text>

      <FlatList
        data={versions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No poems awaiting review.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardContent} numberOfLines={6}>{item.content}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleReject(item)}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleApprove(item)}
              >
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.canvas, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: palette.parchment },
  subtitle: { color: palette.glacial, marginBottom: 16 },
  list: { paddingBottom: 24 },
  empty: { textAlign: 'center', color: palette.ghost, marginTop: 40 },
  card: {
    backgroundColor: palette.spruce,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: palette.parchment },
  cardContent: { color: palette.onSurface, lineHeight: 22, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 10 },
  rejectButton: {
    flex: 1,
    backgroundColor: palette.errorContainer,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectText: { color: palette.error, fontWeight: '600' },
  approveButton: {
    flex: 1,
    backgroundColor: palette.malachite,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveText: { color: palette.emerald, fontWeight: '600' },
});

export default ModerationQueueScreen;
