import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { LessonStepData } from '../../types/lesson';

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
      value={value}
      onChangeText={onChange}
      textAlignVertical="top"
    />
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: 'white', borderRadius: 12, padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#2c3e50', marginBottom: 10 },
  prompt: { fontSize: 16, lineHeight: 24, color: '#34495e', marginBottom: 12 },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#dfe6e9',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafbfc',
  },
});

export default ExerciseStep;
