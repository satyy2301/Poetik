// src/features/learning/AIFeedbackWidget.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette } from '../../theme/tokens/colors';

const AIFeedbackWidget = ({ feedback }: { feedback: string }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>AI Feedback</Text>
      <View style={styles.feedbackContent}>
        <Text style={styles.feedbackText}>{feedback}</Text>
      </View>
      
      <View style={styles.feedbackCategories}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>Rhyme: 4/5</Text>
        </View>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>Meter: 3/5</Text>
        </View>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>Imagery: 5/5</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.spruce,
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: palette.emerald,
  },
  header: {
    fontWeight: 'bold',
    color: palette.parchment,
    marginBottom: 10,
    fontSize: 16,
  },
  feedbackContent: {
    marginBottom: 15,
  },
  feedbackText: {
    color: palette.onSurface,
    lineHeight: 22,
  },
  feedbackCategories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    backgroundColor: palette.veil,
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  categoryText: {
    color: palette.mint,
    fontSize: 12,
  },
});

export default AIFeedbackWidget;