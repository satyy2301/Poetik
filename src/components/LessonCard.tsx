// src/components/LessonCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const LessonCard = ({ lesson, onPress }) => {
  const progress = lesson.completed ? 1 : (lesson.progress || 0);
  
  return (
    <TouchableOpacity 
      style={[styles.container, lesson.locked && styles.lockedContainer]}
      onPress={!lesson.locked ? onPress : null}
      activeOpacity={0.7}
    >
      {lesson.locked && (
        <View style={styles.lockBadge}>
          <Text style={styles.lockText}>Locked</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={styles.title}>{lesson.title}</Text>
        {lesson.completed && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.description}>{lesson.description}</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${progress * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(progress * 100)}% complete
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.difficulty}>{lesson.difficulty}</Text>
        <Text style={styles.xp}>{lesson.xpReward} XP</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lockedContainer: {
    opacity: 0.6,
  },
  lockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  lockText: {
    color: 'white',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  completedBadge: {
    backgroundColor: '#2ecc71',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  completedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  description: {
    color: '#7f8c8d',
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  progressText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficulty: {
    color: '#3498db',
    fontWeight: '500',
  },
  xp: {
    color: '#f39c12',
    fontWeight: 'bold',
  },
});

export default LessonCard;