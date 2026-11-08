import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LessonStepData } from '../../types/lesson';
import { palette } from '../../theme/tokens/colors';

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
  container: { backgroundColor: palette.spruce, borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: palette.parchment, marginBottom: 10 },
  content: { fontSize: 16, lineHeight: 24, color: palette.onSurface, marginBottom: 12 },
  exampleBox: {
    backgroundColor: palette.canvas,
    borderLeftWidth: 3,
    borderLeftColor: palette.emerald,
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  exampleText: { fontStyle: 'italic', color: palette.ghost, lineHeight: 22 },
});

export default ExampleStep;
