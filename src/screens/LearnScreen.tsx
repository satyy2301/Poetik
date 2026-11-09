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
import ActivityChart from '../components/analytics/ActivityChart';
import CourseCertificate from '../components/CourseCertificate';
import ScreenContainer from '../components/layout/ScreenContainer';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/ThemeContext';
import { fetchLessonsWithProgress } from '../services/lessonService';
import { fetchSeededChallenges, getTodaysChallenge, fetchCompletedChallengeIds, DailyChallenge } from '../services/challengeService';
import { fetchBestQuizScores, fetchQuizzes } from '../services/quizService';
import { Lesson, Quiz } from '../types/lesson';
import { supabase } from '../lib/supabase';
import { levelProgress } from '../utils/xpCalculator';

const TRACKS: { type: string; title: string }[] = [
  { type: 'foundations', title: 'Foundations' },
  { type: 'grammar', title: 'Grammar' },
  { type: 'sound', title: 'Sound' },
  { type: 'tools', title: 'Tools' },
  { type: 'forms', title: 'Forms' },
  { type: 'capstone', title: 'Capstone' },
];

const shortDate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return iso;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

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
  const [seededChallenges, setSeededChallenges] = useState<DailyChallenge[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizScores, setQuizScores] = useState<Record<string, { score: number; total: number }>>({});
  const [activeTab, setActiveTab] = useState('courses');
  const [refreshing, setRefreshing] = useState(false);
  const [doneChallengeIds, setDoneChallengeIds] = useState<string[]>([]);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showEarlier, setShowEarlier] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [lessonData, challenge, seeded, quizData, scores, doneIds] = await Promise.all([
        fetchLessonsWithProgress(user?.id),
        getTodaysChallenge(),
        fetchSeededChallenges(),
        fetchQuizzes(),
        user?.id ? fetchBestQuizScores(user.id) : Promise.resolve({}),
        user?.id ? fetchCompletedChallengeIds(user.id) : Promise.resolve([]),
      ]);
      setLessons(lessonData);
      setDailyChallenge(challenge);
      setSeededChallenges(seeded);
      setQuizzes(quizData);
      setQuizScores(scores);
      setDoneChallengeIds(doneIds);
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
      Alert.alert('Locked', 'Complete the previous lesson in this track first.');
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
  const knownTracks = new Set(TRACKS.map((track) => track.type));
  const tracks = TRACKS.map((track) => ({
    ...track,
    lessons: lessons.filter((lesson) => lesson.type === track.type),
  })).filter((track) => track.lessons.length > 0);
  const otherLessons = lessons.filter((lesson) => !knownTracks.has(lesson.type));
  const quizTracks = TRACKS.map((track) => ({
    ...track,
    quizzes: quizzes.filter((quiz) => quiz.lessonType === track.type),
  })).filter((track) => track.quizzes.length > 0);
  const otherQuizzes = quizzes.filter((quiz) => !knownTracks.has(quiz.lessonType || ''));
  const todayKey = new Date().toISOString().slice(0, 10);
  const doneChallenges = new Set(doneChallengeIds);
  const practiceChallenges = seededChallenges.filter((item) => item.id !== dailyChallenge?.id);
  const upcomingChallenges = practiceChallenges.filter((item) => item.date > todayKey);
  const earlierChallenges = practiceChallenges.filter((item) => item.date <= todayKey).reverse();
  const visibleUpcoming = showAllUpcoming ? upcomingChallenges : upcomingChallenges.slice(0, 7);
  const nextLesson = [...tracks.flatMap((track) => track.lessons), ...otherLessons].find(
    (lesson) => !lesson.locked && !lesson.completed,
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCanvas }]}>
      <XPGainToast amount={lastXpGain} onDone={clearXpToast} />
      <AchievementToast achievement={newAchievement} onDone={clearAchievementToast} />
      <CourseCertificate
        visible={showCertificate}
        courseTitle="Poetry Academy"
        onClose={() => setShowCertificate(false)}
      />

      <View style={styles.summaryBar}>
        <View style={styles.summaryStats}>
          <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>
            {streak} day{streak === 1 ? '' : 's'}
          </Text>
          <Text style={[theme.typography.bodySm, { color: colors.textMuted }]}>·</Text>
          <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>{xp} XP</Text>
          <Text style={[theme.typography.bodySm, { color: colors.textMuted }]}>·</Text>
          <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>Level {level}</Text>
        </View>
        <ProgressBar progress={levelProgress(xp)} color={colors.brandPrimary} />
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
              {nextLesson && (
                <TouchableOpacity
                  style={[styles.continueCard, { backgroundColor: colors.bgSurface, borderColor: colors.brandPrimary }]}
                  onPress={() => openLesson(nextLesson)}
                >
                  <Text style={[theme.typography.bodySm, { color: colors.brandPrimary }]}>Continue</Text>
                  <Text style={[theme.typography.labelBold, { color: colors.textPrimary, marginTop: 4 }]} numberOfLines={2}>
                    {nextLesson.title}
                  </Text>
                </TouchableOpacity>
              )}
              {[...tracks, ...(otherLessons.length > 0 ? [{ type: 'more', title: 'More', lessons: otherLessons }] : [])].map((track) => {
                const done = track.lessons.filter((lesson) => lesson.completed).length;
                const ratio = track.lessons.length > 0 ? done / track.lessons.length : 0;
                return (
                  <View key={track.type}>
                    <View style={styles.trackHead}>
                      <Text style={[theme.typography.labelBold, { color: colors.textPrimary, fontSize: 16 }]}>
                        {track.title}
                      </Text>
                      <Text style={[theme.typography.bodySm, { color: colors.textSecondary }]}>
                        {done}/{track.lessons.length}
                      </Text>
                    </View>
                    <View style={[styles.trackBar, { backgroundColor: colors.borderMuted }]}>
                      <View style={[styles.trackFill, { width: `${Math.round(ratio * 100)}%`, backgroundColor: colors.brandPrimary }]} />
                    </View>
                    {track.lessons.map((lesson) => (
                      <LessonCard key={lesson.id} lesson={lesson} onPress={() => openLesson(lesson)} />
                    ))}
                  </View>
                );
              })}
              {__DEV__ && (
                <Button title="Seed Lessons" onPress={seedLessons} variant="ghost" />
              )}
            </View>
          )}

          {activeTab === 'challenges' && (
            <View>
              {dailyChallenge ? (
                <TouchableOpacity
                  style={[styles.challengeCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}
                  onPress={() => navigation.navigate('ChallengeDetail', { challenge: dailyChallenge })}
                >
                  <View style={styles.trackHead}>
                    <Text style={[theme.typography.bodySm, { color: colors.brandPrimary }]}>Today</Text>
                    <Text style={[theme.typography.bodySm, { color: doneChallenges.has(dailyChallenge.id) ? colors.success : colors.bookmarkGold }]}>
                      {doneChallenges.has(dailyChallenge.id) ? 'Done' : `+${dailyChallenge.xp_reward} XP`}
                    </Text>
                  </View>
                  <Text style={[theme.typography.labelBold, { color: colors.textPrimary, marginTop: 8 }]}>
                    {dailyChallenge.task}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={[theme.typography.bodyMd, { color: colors.textSecondary }]}>No challenge for today.</Text>
              )}

              {upcomingChallenges.length > 0 && (
                <View>
                  <Text style={[theme.typography.labelBold, styles.trackTitle, { color: colors.textPrimary }]}>
                    Coming up
                  </Text>
                  {visibleUpcoming.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.practiceRow, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}
                      onPress={() => navigation.navigate('ChallengeDetail', { challenge: item })}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]} numberOfLines={2}>
                          {item.task}
                        </Text>
                        <Text style={[theme.typography.bodySm, { color: colors.textSecondary, marginTop: 4 }]}>
                          {shortDate(item.date)} · +{item.xp_reward} XP
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                  ))}
                  {upcomingChallenges.length > 7 && (
                    <TouchableOpacity onPress={() => setShowAllUpcoming((open) => !open)} style={styles.moreLink}>
                      <Text style={[theme.typography.labelBold, { color: colors.brandPrimary }]}>
                        {showAllUpcoming ? 'Show less' : `Show ${upcomingChallenges.length - 7} more`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {earlierChallenges.length > 0 && (
                <View>
                  <TouchableOpacity style={styles.trackHead} onPress={() => setShowEarlier((open) => !open)}>
                    <Text style={[theme.typography.labelBold, { color: colors.textPrimary, fontSize: 16 }]}>
                      Earlier
                    </Text>
                    <Text style={[theme.typography.bodySm, { color: colors.textSecondary }]}>
                      {showEarlier ? 'Hide' : `${earlierChallenges.length}`}
                    </Text>
                  </TouchableOpacity>
                  {showEarlier && earlierChallenges.map((item) => {
                    const done = doneChallenges.has(item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.practiceRow, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}
                        onPress={() => navigation.navigate('ChallengeDetail', { challenge: item })}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]} numberOfLines={2}>
                            {item.task}
                          </Text>
                          <Text style={[theme.typography.bodySm, { color: done ? colors.success : colors.textSecondary, marginTop: 4 }]}>
                            {shortDate(item.date)} · {done ? 'Done' : `+${item.xp_reward} XP`}
                          </Text>
                        </View>
                        <Ionicons name={done ? 'checkmark-circle' : 'chevron-forward'} size={18} color={done ? colors.success : colors.textSecondary} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {activeTab === 'progress' && (
            <View>
              <View style={[styles.progressCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
                <View style={styles.completionRow}>
                  <Text style={[styles.completionPercent, { color: colors.textPrimary }]}>{completionRate}%</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>Course</Text>
                    <Text style={[theme.typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]}>
                      {completedLessons.length} of {lessons.length} lessons
                    </Text>
                  </View>
                </View>
                <ProgressBar progress={progress} color={colors.brandPrimary} showText={false} />
                <View style={[styles.statGrid, { borderTopColor: colors.borderMuted }]}>
                  {[
                    { value: String(xp), label: 'XP' },
                    { value: String(level), label: 'Level' },
                    { value: String(streak), label: streak === 1 ? 'Day' : 'Days' },
                  ].map((item) => (
                    <View key={item.label} style={styles.statCell}>
                      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{item.value}</Text>
                      <Text style={[theme.typography.bodySm, { color: colors.textSecondary }]}>{item.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <ActivityChart data={weeklyActivity} labels={weekLabels} />
              <View style={styles.linkRow}>
                {[
                  { title: 'Awards', icon: 'medal-outline' as const, route: 'Achievements' },
                  { title: 'Ranks', icon: 'podium-outline' as const, route: 'Leaderboard' },
                  { title: 'Study', icon: 'people-outline' as const, route: 'StudyTogether' },
                ].map((link) => (
                  <TouchableOpacity
                    key={link.route}
                    style={[styles.linkChip, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}
                    onPress={() => navigation.navigate(link.route)}
                  >
                    <Ionicons name={link.icon} size={18} color={colors.brandPrimary} />
                    <Text style={[theme.typography.labelBold, { color: colors.textPrimary, marginTop: 6 }]}>{link.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {activeTab === 'quiz' && (
            <View>
              {quizzes.length === 0 ? (
                <Text style={[theme.typography.bodyMd, { color: colors.textSecondary }]}>No quizzes yet.</Text>
              ) : (
                [...quizTracks, ...(otherQuizzes.length > 0 ? [{ type: 'more', title: 'More', quizzes: otherQuizzes }] : [])].map((track) => (
                  <View key={track.type}>
                    <Text style={[theme.typography.labelBold, styles.trackTitle, { color: colors.textPrimary }]}>
                      {track.title}
                    </Text>
                    {track.quizzes.map((quiz) => {
                      const best = quizScores[quiz.id];
                      return (
                        <TouchableOpacity
                          key={quiz.id}
                          style={[styles.practiceRow, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}
                          onPress={() => navigation.navigate('QuizDetail', { quizId: quiz.id })}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>{quiz.title}</Text>
                            <Text style={[theme.typography.bodySm, { color: colors.textSecondary, marginTop: 4 }]}>
                              {quiz.questions.length} questions
                              {best ? ` · Best ${best.score}/${best.total}` : ''}
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))
              )}
            </View>
          )}
        </ScreenContainer>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryBar: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 },
  summaryStats: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  content: { paddingBottom: 40 },
  challengeCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 4 },
  continueCard: { padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  trackHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  trackBar: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 8, marginBottom: 10 },
  trackFill: { height: '100%' },
  trackTitle: { fontSize: 16, marginTop: 16, marginBottom: 10 },
  moreLink: { paddingVertical: 8, alignItems: 'center' },
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  progressCard: { padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1 },
  completionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  completionPercent: { fontSize: 36, fontWeight: '700', lineHeight: 40 },
  statGrid: { flexDirection: 'row', borderTopWidth: 1, marginTop: 14, paddingTop: 12 },
  statCell: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  linkRow: { flexDirection: 'row', gap: 8 },
  linkChip: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
});

export default LearnScreen;
