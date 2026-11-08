// src/components/AIFeedback.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { palette } from '../theme/tokens/colors';

type AIFeedbackProps = {
  feedback: string;
  scores?: Record<string, number>;
};

const AIFeedback = ({ feedback, scores }: AIFeedbackProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="auto-awesome" size={20} color={palette.mint} />
        <Text style={styles.headerText}>AI Feedback</Text>
      </View>
      
      <Text style={styles.feedbackText}>{feedback}</Text>
      
      {scores && (
        <View style={styles.scoresContainer}>
          {Object.entries(scores).map(([category, score]) => (
            <View key={category} style={styles.scoreItem}>
              <Text style={styles.scoreCategory}>{category}:</Text>
              <View style={styles.scoreBar}>
                <View 
                  style={[
                    styles.scoreFill,
                    { width: `${(score / 5) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.scoreValue}>{score}/5</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.spruce,
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    borderLeftWidth: 3,
    borderLeftColor: palette.emerald,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: palette.parchment,
  },
  feedbackText: {
    lineHeight: 22,
    color: palette.onSurface,
  },
  scoresContainer: {
    marginTop: 15,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreCategory: {
    width: 100,
    fontWeight: '500',
    color: palette.parchment,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: palette.onSurfaceVariant,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  scoreFill: {
    height: '100%',
    backgroundColor: palette.emerald,
  },
  scoreValue: {
    width: 40,
    textAlign: 'right',
    color: palette.glacial,
  },
});

export default AIFeedback;