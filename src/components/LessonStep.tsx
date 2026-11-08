// src/components/LessonStep.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette } from '../theme/tokens/colors';

type LessonStepProps = {
  step: {
    title?: string;
    content?: string;
    examples?: string[];
    instructions?: string;
  };
  stepNumber: number;
  totalSteps: number;
};

const LessonStep = ({ step, stepNumber, totalSteps }: LessonStepProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.stepIndicator}>Step {stepNumber} of {totalSteps}</Text>
      <Text style={styles.stepTitle}>{step.title}</Text>
      
      {step.content && <Text style={styles.stepContent}>{step.content}</Text>}

      {step.examples && (
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>Examples:</Text>
          {step.examples.map((example: string, index: number) => (
            <View key={index} style={styles.example}>
              <Text style={styles.exampleText}>{example}</Text>
            </View>
          ))}
        </View>
      )}

      {step.instructions && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Your Turn:</Text>
          <Text style={styles.instructionsText}>{step.instructions}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.spruce,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  stepIndicator: {
    color: palette.glacial,
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: palette.parchment,
  },
  stepContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    color: palette.onSurface,
  },
  examplesContainer: {
    backgroundColor: palette.canvas,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  examplesTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: palette.parchment,
  },
  example: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  exampleText: {
    fontStyle: 'italic',
    color: palette.glacial,
    lineHeight: 22,
  },
  instructionsContainer: {
    backgroundColor: palette.veil,
    borderRadius: 8,
    padding: 15,
  },
  instructionsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: palette.mint,
  },
  instructionsText: {
    color: palette.mint,
    lineHeight: 22,
  },
});

export default LessonStep;