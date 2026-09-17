import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ComingSoonBanner from '../components/ComingSoonBanner';

const AITutorScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Tutor</Text>
      <Text style={styles.desc}>
        Ask questions about poetry forms, techniques, and lessons.
      </Text>
      <ComingSoonBanner message="AI tutoring will return in a future update." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
    color: '#2c3e50',
    textAlign: 'center',
  },
  desc: {
    color: '#636e72',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default AITutorScreen;
