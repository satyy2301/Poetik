// src/screens/ChallengeDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ChallengeDetailScreen = ({ route, navigation }: any) => {
  const { challenge } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{challenge?.task || 'Challenge'}</Text>
      <Text style={styles.desc}>{challenge?.description || 'Complete this daily prompt.'}</Text>
      <TouchableOpacity style={styles.start} onPress={() => navigation.goBack()}>
        <Text style={{ color: 'white' }}>Start</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 10 },
  desc: { color: '#555', marginBottom: 20 },
  start: { backgroundColor: '#0984e3', padding: 12, borderRadius: 10, alignItems: 'center' },
});

export default ChallengeDetailScreen;
