import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type CourseCertificateProps = {
  visible: boolean;
  courseTitle: string;
  onClose: () => void;
};

const CourseCertificate = ({ visible, courseTitle, onClose }: CourseCertificateProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.heading}>Certificate of Completion</Text>
          <Text style={styles.subheading}>Poetry Academy</Text>
          <Text style={styles.course}>{courseTitle}</Text>
          <Text style={styles.body}>
            You completed all lessons in this course. Keep writing and learning.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Continue</Text>
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
    padding: 24,
  },
  card: {
    backgroundColor: '#fffdf8',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    borderWidth: 2,
    borderColor: '#d4af37',
    alignItems: 'center',
  },
  heading: { fontSize: 22, fontWeight: '700', color: '#2c3e50' },
  subheading: { color: '#7f8c8d', marginTop: 4, marginBottom: 16 },
  course: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0984e3',
    textAlign: 'center',
    marginBottom: 12,
  },
  body: { textAlign: 'center', color: '#636e72', lineHeight: 22, marginBottom: 20 },
  button: {
    backgroundColor: '#0984e3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: { color: 'white', fontWeight: '700' },
});

export default CourseCertificate;
