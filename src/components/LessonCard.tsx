import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ProgressRing from './ProgressRing';

const LessonCard = ({ lesson, onPress }: { lesson: any; onPress: () => void }) => {
  const progress = lesson.completed ? 1 : lesson.progress || 0;

  return (
    <TouchableOpacity
      style={[styles.container, lesson.locked && styles.lockedContainer]}
      onPress={!lesson.locked ? onPress : undefined}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <View style={styles.info}>
          {lesson.locked && (
            <View style={styles.lockBadge}>
              <Text style={styles.lockText}>Locked</Text>
            </View>
          )}
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.description}>{lesson.description}</Text>
        </View>
        <ProgressRing progress={progress} size={52} color={lesson.completed ? '#2ecc71' : '#3498db'} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.difficulty}>Level {lesson.difficulty || 1}</Text>
        <Text style={styles.xp}>{lesson.xp_reward || lesson.xpReward || 10} XP</Text>
        {lesson.completed && <Text style={styles.done}>Completed</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lockedContainer: { opacity: 0.65 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, paddingRight: 12 },
  lockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 6,
  },
  lockText: { color: 'white', fontSize: 11, fontWeight: '600' },
  title: { fontSize: 17, fontWeight: 'bold', color: '#2c3e50' },
  description: { color: '#7f8c8d', marginTop: 6, lineHeight: 20 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  difficulty: { color: '#3498db', fontWeight: '500' },
  xp: { color: '#f39c12', fontWeight: 'bold' },
  done: { color: '#2ecc71', fontWeight: '700', fontSize: 12 },
});

export default React.memo(LessonCard);
