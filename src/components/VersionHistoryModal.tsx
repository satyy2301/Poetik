import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { DraftVersion } from '../services/draftService';
import { palette } from '../theme/tokens/colors';

type VersionHistoryModalProps = {
  visible: boolean;
  versions: DraftVersion[];
  onClose: () => void;
  onRestore: (version: DraftVersion) => void;
};

const VersionHistoryModal = ({
  visible,
  versions,
  onClose,
  onRestore,
}: VersionHistoryModalProps) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Version History</Text>
          <Text style={styles.subtitle}>{versions.length} saved version(s)</Text>

          <FlatList
            data={versions}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={styles.empty}>No versions yet. Versions are saved when you publish.</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.versionCard}>
                <View style={styles.versionHeader}>
                  <Text style={styles.versionNum}>v{item.version_number}</Text>
                  <Text style={styles.versionDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.versionTitle} numberOfLines={1}>{item.title || 'Untitled'}</Text>
                <Text style={styles.versionPreview} numberOfLines={3}>{item.content}</Text>
                <TouchableOpacity style={styles.restoreBtn} onPress={() => onRestore(item)}>
                  <Text style={styles.restoreText}>Restore</Text>
                </TouchableOpacity>
              </View>
            )}
          />

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: palette.spruce,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '75%',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: palette.parchment },
  subtitle: { color: palette.glacial, marginBottom: 16 },
  empty: { textAlign: 'center', color: palette.ghost, padding: 20 },
  versionCard: {
    backgroundColor: palette.canvas,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  versionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  versionNum: { fontWeight: '800', color: palette.emerald },
  versionDate: { fontSize: 12, color: palette.ghost },
  versionTitle: { fontWeight: '600', color: palette.parchment, marginBottom: 4 },
  versionPreview: { color: palette.glacial, fontSize: 13, lineHeight: 20 },
  restoreBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: palette.emerald,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  restoreText: { color: palette.ink, fontWeight: '600', fontSize: 13 },
  closeBtn: { marginTop: 12, alignItems: 'center', padding: 10 },
  closeText: { color: palette.glacial, fontWeight: '600' },
});

export default VersionHistoryModal;
