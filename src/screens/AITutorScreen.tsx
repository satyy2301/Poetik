// src/screens/AITutorScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AITutorScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Tutor</Text>
      <Text style={styles.desc}>This is a simple AI tutor placeholder. Build dialogs here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
  desc: { color: '#555' },
});

export default AITutorScreen;
