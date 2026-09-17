import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LessonStepData } from '../../types/lesson';

const TheoryStep = ({ step }: { step: LessonStepData }) => (
  <View style={styles.container}>
    {step.title ? <Text style={styles.title}>{step.title}</Text> : null}
    <Text style={styles.content}>{step.content}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: 'white', borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#2c3e50', marginBottom: 10 },
  content: { fontSize: 16, lineHeight: 24, color: '#34495e' },
});

export default TheoryStep;
