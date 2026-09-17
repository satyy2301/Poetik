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
import { LinearGradient } from 'expo-linear-gradient';
import LessonCard from '../components/LessonCard';
import ProgressBar from '../components/ProgressBar';
import XPGainToast from '../components/XPGainToast';
import AchievementToast from '../components/AchievementToast';
import StreakCounter from '../components/StreakCounter';
import StatsCard from '../components/analytics/StatsCard';
import ActivityChart from '../components/analytics/ActivityChart';
import CourseCertificate from '../components/CourseCertificate';
import { useUser } from '../context/UserContext';
import { useProgress } from '../context/ProgressContext';
import { fetchLessonsWithProgress } from '../services/lessonService';
import { getTodaysChallenge, DailyChallenge } from '../services/challengeService';
import { Lesson } from '../types/lesson';
import { supabase } from '../lib/supabase';
import { levelProgress } from '../utils/xpCalculator';

const LearnScreen = ({ navigation }: any) => {
  const { user } = useUser();
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

      const allComplete =
        lessonData.length > 0 && lessonData.every((lesson) => lesson.completed);
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
      Alert.alert('Seeded', 'Basic lesson added. Run seed_lessons.sql for full set.');
      loadData();
    } catch (err) {
      Alert.alert('Seed failed', 'Check console for details.');
    }
  };

  const weeklyActivity = [1, 2, 1, 3, 2, completedLessons.length % 4, streak % 3];
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const completionRate =
    lessons.length > 0
      ? Math.round((completedLessons.length / lessons.length) * 100)
      : 0;

  return (
    <LinearGradient colors={['#f5f7fa', '#e6eef8']} style={styles.container}>
      <XPGainToast amount={lastXpGain} onDone={clearXpToast} />
      <AchievementToast achievement={newAchievement} onDone={clearAchievementToast} />
      <CourseCertificate
        visible={showCertificate}
        courseTitle="Poetry Academy"
        onClose={() => setShowCertificate(false)}
      />

      <View style={styles.header}>
        <View style={styles.xpCard}>
          <Text style={styles.xpLabel}>XP</Text>
          <Text style={styles.xpValue}>{xp}</Text>
          <Text style={styles.xpSub}>Level {level}</Text>
          {streak > 0 && <Text style={styles.streak}>{streak}d streak</Text>}
        </View>

        <View style={styles.progressContainerHeader}>
          <Text style={styles.title}>Poetry Academy</Text>
          <Text style={styles.subtitle}>Master the art of verse</Text>
          <ProgressBar progress={levelProgress(xp)} color="#0984e3" />
        </View>

        <TouchableOpacity
          style={styles.tutorButton}
          onPress={() => navigation.navigate('AITutor')}
        >
          <Text style={styles.tutorText}>AI Tutor</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsRow}>
        {(['courses', 'challenges', 'progress', 'quiz'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'courses' ? 'Courses' : tab === 'challenges' ? 'Daily' : tab === 'progress' ? 'Progress' : 'Quiz'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'courses' && (
          <View>
            <Text style={styles.sectionTitle}>Featured Courses</Text>
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} onPress={() => openLesson(lesson)} />
            ))}
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: '#6c5ce7' }]}
              onPress={seedLessons}
            >
              <Text style={styles.startText}>Seed Lessons</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'challenges' && (
          <View>
            <Text style={styles.sectionTitle}>Today's Challenge</Text>
            {dailyChallenge ? (
              <View style={styles.challengeCard}>
                <Text style={styles.challengeTitle}>{dailyChallenge.task}</Text>
                <Text style={styles.challengeXP}>+{dailyChallenge.xp_reward} XP</Text>
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={() =>
                    navigation.navigate('ChallengeDetail', { challenge: dailyChallenge })
                  }
                >
                  <Text style={styles.startText}>Start Challenge</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.empty}>No challenge for today. Run seedChallenges script.</Text>
            )}
          </View>
        )}

        {activeTab === 'progress' && (
          <View>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.statsRow}>
              <StatsCard label="Total XP" value={xp} accent="#3498db" />
              <StatsCard label="Level" value={level} accent="#9b59b6" />
              <StreakCounter streak={streak} size="sm" />
            </View>
            <ActivityChart data={weeklyActivity} labels={weekLabels} />
            <View style={styles.progressCard}>
              <Text style={styles.progressLarge}>{completionRate}%</Text>
              <Text style={styles.progressSmall}>
                {completedLessons.length} of {lessons.length} lessons complete
              </Text>
              <ProgressBar progress={progress} />
            </View>
            <View style={styles.quickLinks}>
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => navigation.navigate('Achievements')}
              >
                <Text style={styles.linkText}>View Achievements</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => navigation.navigate('Leaderboard')}
              >
                <Text style={styles.linkText}>Leaderboard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => navigation.navigate('StudyTogether')}
              >
                <Text style={styles.linkText}>Study Together</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'quiz' && (
          <View>
            <Text style={styles.sectionTitle}>Quizzes</Text>
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: '#6c5ce7' }]}
              onPress={() => navigation.navigate('QuizList')}
            >
              <Text style={styles.startText}>Take a Quiz</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  xpCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: 100,
    elevation: 2,
  },
  xpLabel: { fontSize: 12, color: '#636e72' },
  xpValue: { fontSize: 20, fontWeight: 'bold' },
  xpSub: { fontSize: 12, color: '#636e72' },
  streak: { fontSize: 11, color: '#e67e22', marginTop: 4, fontWeight: '600' },
  progressContainerHeader: { flex: 1, marginLeft: 12 },
  title: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { color: '#636e72', marginBottom: 8 },
  tutorButton: { backgroundColor: '#0984e3', padding: 10, borderRadius: 12 },
  tutorText: { color: 'white', fontWeight: '600' },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 18, marginTop: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#0984e3' },
  tabText: { color: '#636e72', fontSize: 13 },
  activeTabText: { color: '#0984e3', fontWeight: '700' },
  content: { padding: 18, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  challengeCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  challengeTitle: { fontSize: 16, fontWeight: 'bold' },
  challengeXP: { color: '#f1c40f', marginTop: 8 },
  startButton: {
    marginTop: 10,
    backgroundColor: '#00b894',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  startText: { color: 'white', fontWeight: '700' },
  progressCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLarge: { fontSize: 32, fontWeight: 'bold' },
  progressSmall: { color: '#636e72', marginBottom: 10 },
  statsRow: { flexDirection: 'row', marginBottom: 12 },
  quickLinks: { gap: 8 },
  linkBtn: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    elevation: 1,
  },
  linkText: { color: '#0984e3', fontWeight: '700' },
  empty: { color: '#95a5a6' },
});

export default LearnScreen;
