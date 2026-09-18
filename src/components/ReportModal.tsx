import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ReportTargetType, submitReport } from '../services/abuseService';

const REASONS = [
  'Spam or misleading',
  'Harassment or hate',
  'Inappropriate content',
  'Copyright violation',
  'Other',
];

type Props = {
  visible: boolean;
  onClose: () => void;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
};

const ReportModal = ({
  visible,
  onClose,
  reporterId,
  targetType,
  targetId,
}: Props) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitReport(reporterId, targetType, targetId, reason, details.trim() || undefined);
      Alert.alert('Report submitted', 'Thank you. Our team will review this report.');
      setDetails('');
      onClose();
    } catch {
      Alert.alert('Error', 'Could not submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>Report content</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Why are you reporting this {targetType}?
          </Text>

          {REASONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.reasonRow,
                {
                  borderColor: reason === r ? colors.primary : colors.border,
                  backgroundColor: reason === r ? `${colors.primary}15` : 'transparent',
                },
              ]}
              onPress={() => setReason(r)}
            >
              <Text style={{ color: colors.text }}>{r}</Text>
            </TouchableOpacity>
          ))}

          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
            placeholder="Additional details (optional)"
            placeholderTextColor={colors.textSecondary}
            value={details}
            onChangeText={setDetails}
            multiline
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={{ color: colors.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Submit report</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 12 },
  reasonRow: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 72,
    marginTop: 8,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  cancelBtn: { padding: 12 },
  submitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '600' },
});

export default ReportModal;
