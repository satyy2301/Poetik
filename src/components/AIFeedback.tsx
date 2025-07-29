// src/components/AIFeedback.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const AIFeedback = ({ feedback, scores }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="auto-awesome" size={20} color="#f1c40f" />
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
    backgroundColor: '#f0f7ff',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  feedbackText: {
    lineHeight: 22,
    color: '#34495e',
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
    color: '#2c3e50',
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#dfe6e9',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  scoreFill: {
    height: '100%',
    backgroundColor: '#2ecc71',
  },
  scoreValue: {
    width: 40,
    textAlign: 'right',
    color: '#7f8c8d',
  },
});

export default AIFeedback;