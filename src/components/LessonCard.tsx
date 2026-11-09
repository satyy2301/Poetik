import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const LessonCard = ({ lesson, onPress }: { lesson: any; onPress: () => void }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const locked = !!lesson.locked;
  const completed = !!lesson.completed;

  return (
    <TouchableOpacity
      style={[
        styles.row,
        { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted },
        locked && styles.locked,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name={locked ? 'lock-closed' : completed ? 'checkmark-circle' : 'book-outline'}
        size={18}
        color={completed ? colors.success : locked ? colors.textMuted : colors.brandPrimary}
      />
      <View style={styles.info}>
        <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]} numberOfLines={1}>
          {lesson.title}
        </Text>
        <Text style={[theme.typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]}>
          Level {lesson.difficulty || 1} · {lesson.xp_reward || lesson.xpReward || 10} XP
          {locked ? ' · Locked' : ''}
        </Text>
      </View>
      {!completed && (
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  locked: { opacity: 0.55 },
  info: { flex: 1 },
});

export default React.memo(LessonCard);
