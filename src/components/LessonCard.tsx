import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ProgressRing from './ProgressRing';

const formIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  sonnet: 'document-text-outline',
  haiku: 'leaf-outline',
  'free verse': 'water-outline',
};

const LessonCard = ({ lesson, onPress }: { lesson: any; onPress: () => void }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const progress = lesson.completed ? 1 : lesson.progress || 0;
  const formKey = (lesson.form || lesson.type || '').toLowerCase();
  const iconName = formIcons[formKey] || 'book-outline';
  const lessonCount = lesson.steps?.length || lesson.lesson_count || 0;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.bgSurface,
          borderColor: colors.borderMuted,
        },
        lesson.locked && styles.lockedContainer,
        theme.shadows.card,
      ]}
      onPress={!lesson.locked ? onPress : undefined}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: colors.cardHeaderTint }]}>
          {lesson.locked ? (
            <Ionicons name="lock-closed" size={22} color={colors.textSecondary} />
          ) : (
            <Ionicons name={iconName} size={22} color={colors.brandPrimary} />
          )}
        </View>

        <View style={styles.info}>
          <Text style={[theme.typography.labelBold, { color: colors.textPrimary, fontSize: 16 }]}>
            {lesson.title}
          </Text>
          <Text style={[theme.typography.bodySm, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={2}>
            {lesson.description}
          </Text>
          <Text style={[theme.typography.bodySm, { color: colors.textSecondary, marginTop: 6 }]}>
            {lessonCount} lessons · Level {lesson.difficulty || 1}
          </Text>
        </View>

        <ProgressRing
          progress={progress}
          size={48}
          color={lesson.completed ? colors.success : colors.brandPrimary}
        />
      </View>

      <View style={[styles.footer, { borderTopColor: colors.borderMuted }]}>
        <Text style={[theme.typography.bodySm, { color: colors.bookmarkGold, fontFamily: 'Inter-Bold' }]}>
          {lesson.xp_reward || lesson.xpReward || 10} XP
        </Text>
        {lesson.completed && (
          <Text style={[theme.typography.bodySm, { color: colors.success, fontFamily: 'Inter-Bold' }]}>
            Completed
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  lockedContainer: { opacity: 0.55 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
});

export default React.memo(LessonCard);
