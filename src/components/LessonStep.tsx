// src/components/LessonStep.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const LessonStep = ({ step, stepNumber, totalSteps }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.stepIndicator}>Step {stepNumber} of {totalSteps}</Text>
      <Text style={styles.stepTitle}>{step.title}</Text>
      
      {step.content && <Text style={styles.stepContent}>{step.content}</Text>}

      {step.examples && (
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>Examples:</Text>
          {step.examples.map((example, index) => (
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
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  stepIndicator: {
    color: '#7f8c8d',
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  stepContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    color: '#34495e',
  },
  examplesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  examplesTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  example: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  exampleText: {
    fontStyle: 'italic',
    color: '#7f8c8d',
    lineHeight: 22,
  },
  instructionsContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 15,
  },
  instructionsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976d2',
  },
  instructionsText: {
    color: '#1976d2',
    lineHeight: 22,
  },
});

export default LessonStep;