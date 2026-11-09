import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { LessonStepData } from '../../types/lesson';
import { palette } from '../../theme/tokens/colors';

type ExerciseStepProps = {
  step: LessonStepData;
  value: string;
  onChange: (text: string) => void;
};

const ExerciseStep = ({ step, value, onChange }: ExerciseStepProps) => (
  <View style={styles.container}>
    {step.title ? <Text style={styles.title}>{step.title}</Text> : null}
    <Text style={styles.prompt}>{step.content || step.instructions}</Text>
    <TextInput
      style={styles.input}
      multiline
      placeholder="Write your response here..."
      placeholderTextColor={palette.ghost}
      value={value}
      onChangeText={onChange}
      textAlignVertical="top"
    />
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: palette.spruce, borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: palette.parchment, marginBottom: 10 },
  prompt: { fontSize: 16, lineHeight: 24, color: palette.onSurface, marginBottom: 12 },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: palette.onSurfaceVariant,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: palette.parchment,
    backgroundColor: palette.canvas,
  },
});

export default ExerciseStep;
