import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LessonCard from '../components/LessonCard';
import ProgressBar from '../components/ProgressBar';
import XPGainToast from '../components/XPGainToast';
import AchievementToast from '../components/AchievementToast';
import StreakCounter from '../components/StreakCounter';
import StatsCard from '../components/analytics/StatsCard';
import ActivityChart from '../components/analytics/ActivityChart';
import CourseCertificate from '../components/CourseCertificate';
import ScreenContainer from '../components/layout/ScreenContainer';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/ThemeContext';
import { fetchLessonsWithProgress } from '../services/lessonService';
import { getTodaysChallenge, DailyChallenge } from '../services/challengeService';
import { Lesson } from '../types/lesson';
import { supabase } from '../lib/supabase';
import { levelProgress } from '../utils/xpCalculator';

const LearnScreen = ({ navigation }: any) => {
  const { user } = useUser();
  const { theme } = useTheme();
  const colors = theme.colors;
  const {
    xp,
    level,
    streak,
    completedLessons,
    progress,
    lastXpGain,
    newAchievement,
    clearXpToast,
    clearAchievementToast,
    refresh,
  } = useProgress();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [refreshing, setRefreshing] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [lessonData, challenge] = await Promise.all([
        fetchLessonsWithProgress(user?.id),
        getTodaysChallenge(),
      ]);
      setLessons(lessonData);
      setDailyChallenge(challenge);
      const allComplete = lessonData.length > 0 && lessonData.every((lesson) => lesson.completed);
      if (allComplete) setShowCertificate(true);
    } catch (err) {
      console.warn('fetchLearningData err', err);
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
    refresh();
  }, [loadData, refresh]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await refresh();
    setRefreshing(false);
  };

  const openLesson = (lesson: Lesson) => {
    if (lesson.locked) {
      Alert.alert('Locked', 'Complete the previous lesson first.');
      return;
    }
    navigation.navigate('LessonDetail', { lessonId: lesson.id });
  };

  const seedLessons = async () => {
    try {
      const sample = {
        title: 'Seed Course: Poetry 101',
        description: 'Seeded course',
        type: 'curated',
        difficulty: 1,
        steps: [{ type: 'theory', content: 'Intro to poetry.' }],
        xp_reward: 10,
        lesson_order: 999,
      };
      const { error } = await supabase.from('lessons').insert([sample]);
      if (error) throw error;
      Alert.alert('Seeded', 'Basic lesson added.');
      loadData();
    } catch {
      Alert.alert('Seed failed', 'Check console for details.');
    }
  };

  const weeklyActivity = [1, 2, 1, 3, 2, completedLessons.length % 4, streak % 3];
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const completionRate = lessons.length > 0 ? Math.round((completedLessons.length / lessons.length) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCanvas }]}>
      <XPGainToast amount={lastXpGain} onDone={clearXpToast} />
      <AchievementToast achievement={newAchievement} onDone={clearAchievementToast} />
      <CourseCertificate
        visible={showCertificate}
        courseTitle="Poetry Academy"
        onClose={() => setShowCertificate(false)}
      />

      <View style={[styles.gamifiedHeader, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderMuted }]}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: colors.cardHeaderTint }]}>
            <Text>🔥</Text>
            <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>{streak} Days</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.cardHeaderTint }]}>
            <Text>⚡</Text>
            <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>{xp} XP</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.cardHeaderTint }]}>
            <Text>🛡️</Text>
            <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>Lvl {level}</Text>
          </View>
        </View>

        <View style={styles.headerMain}>
          <View style={{ flex: 1 }}>
            <Text style={[theme.typography.displaySm, { color: colors.textPrimary }]}>Poetry Academy</Text>
            <Text style={[theme.typography.bodySm, { color: colors.textSecondary, marginTop: 4 }]}>
              Master the art of verse
            </Text>
            <ProgressBar progress={levelProgress(xp)} color={colors.brandPrimary} />
          </View>
          <Button title="AI Tutor" onPress={() => navigation.navigate('AITutor')} variant="secondary" size="compact" />
        </View>
      </View>

      <View style={[styles.tabsRow, { borderBottomColor: colors.borderMuted }]}>
        {(['courses', 'challenges', 'progress', 'quiz'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: colors.brandPrimary }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[theme.typography.labelBold, { color: activeTab === tab ? colors.brandPrimary : colors.textSecondary, fontSize: 13 }]}>
              {tab === 'courses' ? 'Courses' : tab === 'challenges' ? 'Daily' : tab === 'progress' ? 'Progress' : 'Quiz'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brandPrimary} />}
      >
        <ScreenContainer edges={[]} scrollable={false}>
          {activeTab === 'courses' && (
            <View>
              <Text style={[theme.typography.labelBold, { color: colors.textPrimary, marginBottom: 12, fontSize: 16 }]}>
                Featured Courses
              </Text>
              {lessons.map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} onPress={() => openLesson(lesson)} />
              ))}
              {__DEV__ && (
                <Button title="Seed Lessons" onPress={seedLessons} variant="ghost" />
              )}
            </View>
          )}

          {activeTab === 'challenges' && (
            <View>
              <Text style={[theme.typography.labelBold, { color: colors.textPrimary, marginBottom: 12, fontSize: 16 }]}>
                Today's Challenge
              </Text>
              {dailyChallenge ? (
                <View style={[styles.challengeCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
                  <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>{dailyChallenge.task}</Text>
                  <Text style={[theme.typography.bodySm, { color: colors.bookmarkGold, marginTop: 8 }]}>
                    +{dailyChallenge.xp_reward} XP
                  </Text>
                  <Button
                    title="Start Challenge"
                    onPress={() => navigation.navigate('ChallengeDetail', { challenge: dailyChallenge })}
                    variant="primary"
                    style={{ marginTop: 12 }}
                  />
                </View>
              ) : (
                <Text style={[theme.typography.bodyMd, { color: colors.textSecondary }]}>No challenge for today.</Text>
              )}
            </View>
          )}

          {activeTab === 'progress' && (
            <View>
              <Text style={[theme.typography.labelBold, { color: colors.textPrimary, marginBottom: 12, fontSize: 16 }]}>
                Your Progress
              </Text>
              <View style={styles.statsRow}>
                <StatsCard label="Total XP" value={xp} accent={colors.brandPrimary} />
                <StatsCard label="Level" value={level} accent={colors.brandSecondary} />
                <StreakCounter streak={streak} size="sm" />
              </View>
              <ActivityChart data={weeklyActivity} labels={weekLabels} />
              <View style={[styles.progressCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
                <Text style={[theme.typography.statNumber, { color: colors.textPrimary }]}>{completionRate}%</Text>
                <Text style={[theme.typography.bodySm, { color: colors.textSecondary, marginBottom: 10 }]}>
                  {completedLessons.length} of {lessons.length} lessons complete
                </Text>
                <ProgressBar progress={progress} color={colors.brandPrimary} />
              </View>
              <View style={styles.quickLinks}>
                <Button title="View Achievements" onPress={() => navigation.navigate('Achievements')} variant="secondary" />
                <Button title="Leaderboard" onPress={() => navigation.navigate('Leaderboard')} variant="secondary" />
                <Button title="Study Together" onPress={() => navigation.navigate('StudyTogether')} variant="secondary" />
              </View>
            </View>
          )}

          {activeTab === 'quiz' && (
            <View>
              <Text style={[theme.typography.labelBold, { color: colors.textPrimary, marginBottom: 12, fontSize: 16 }]}>
                Quizzes
              </Text>
              <Button title="Take a Quiz" onPress={() => navigation.navigate('QuizList')} variant="primary" />
            </View>
          )}
        </ScreenContainer>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gamifiedHeader: { padding: 16, borderBottomWidth: 1 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  headerMain: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  content: { paddingBottom: 40 },
  challengeCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  progressCard: { padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1 },
  statsRow: { flexDirection: 'row', marginBottom: 12 },
  quickLinks: { gap: 8 },
});

export default LearnScreen;
