import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LessonStepData } from '../../types/lesson';

const ExampleStep = ({ step }: { step: LessonStepData }) => (
  <View style={styles.container}>
    {step.title ? <Text style={styles.title}>{step.title}</Text> : null}
    {step.content ? <Text style={styles.content}>{step.content}</Text> : null}
    {(step.examples || []).map((example, index) => (
      <View key={index} style={styles.exampleBox}>
        <Text style={styles.exampleText}>{example}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: 'white', borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#2c3e50', marginBottom: 10 },
  content: { fontSize: 16, lineHeight: 24, color: '#34495e', marginBottom: 12 },
  exampleBox: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  exampleText: { fontStyle: 'italic', color: '#636e72', lineHeight: 22 },
});

export default ExampleStep;
