import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { POEM_TEMPLATES, PoemTemplate } from '../data/poemTemplates';

type TemplateSelectorProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (template: PoemTemplate) => void;
  selectedForm?: string;
};

const TemplateSelector = ({ visible, onClose, onSelect, selectedForm }: TemplateSelectorProps) => {
  const [preview, setPreview] = useState<PoemTemplate | null>(null);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Poetry Templates</Text>
          <Text style={styles.subtitle}>{POEM_TEMPLATES.length} forms to choose from</Text>

          <FlatList
            data={POEM_TEMPLATES}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.card,
                  selectedForm === item.form && styles.cardSelected,
                  preview?.id === item.id && styles.cardPreview,
                ]}
                onPress={() => setPreview(item)}
              >
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              </TouchableOpacity>
            )}
          />

          {preview && (
            <ScrollView style={styles.previewBox}>
              <Text style={styles.previewTitle}>{preview.name}</Text>
              <Text style={styles.previewStructure}>{preview.structure}</Text>
              <Text style={styles.previewExample}>{preview.example}</Text>
              <TouchableOpacity
                style={styles.useBtn}
                onPress={() => {
                  onSelect(preview);
                  onClose();
                }}
              >
                <Text style={styles.useBtnText}>Use Template</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
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
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2c3e50' },
  subtitle: { color: '#7f8c8d', marginBottom: 16 },
  row: { justifyContent: 'space-between', marginBottom: 10 },
  card: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  cardSelected: { borderColor: '#3498db', backgroundColor: '#ebf5fb' },
  cardPreview: { borderColor: '#2ecc71' },
  cardName: { fontWeight: '700', color: '#2c3e50', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#7f8c8d' },
  previewBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    maxHeight: 180,
  },
  previewTitle: { fontWeight: '700', fontSize: 16, marginBottom: 6 },
  previewStructure: { color: '#636e72', fontSize: 13, marginBottom: 8 },
  previewExample: { color: '#2c3e50', fontStyle: 'italic', lineHeight: 22 },
  useBtn: {
    backgroundColor: '#00b894',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  useBtnText: { color: 'white', fontWeight: '700' },
  closeBtn: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  closeBtnText: { color: '#7f8c8d', fontWeight: '600' },
});

export default TemplateSelector;
