// src/screens/LearnScreen.tsx
import React, { useState ,useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView ,TextInput, Alert, ActivityIndicator, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import LessonCard from '../components/LessonCard';
import ProgressBar from '../components/ProgressBar';
import { useUser } from '../context/UserContext';
import { useOpenAI } from '../context/OpenAIContext';
import createOpenAIClient from '../lib/openai';

const SAMPLE_COURSES = [
  { id: 'c1', title: 'Poetry 101: The Absolute Basics', description: 'Form vs free verse, stanza, meter', difficulty: 1, xpReward: 25, steps: [], lesson_order: 1 },
  { id: 'c2', title: 'Rhyme Time: Mastering Sound Patterns', description: 'Perfect vs slant rhyme, internal rhyme', difficulty: 2, xpReward: 30, steps: [], lesson_order: 2 },
  { id: 'c3', title: 'Imagery & Sensory Language', description: 'Using five senses in poetry', difficulty: 2, xpReward: 35, steps: [], lesson_order: 3 },
  { id: 'c4', title: 'Sonnet Mastery: 14 Lines to Perfection', description: 'Iambic pentameter, volta, examples', difficulty: 4, xpReward: 60, steps: [], lesson_order: 4 },
  { id: 'c5', title: 'Haiku: Less is More', description: '5-7-5 structure and kigo', difficulty: 1, xpReward: 30, steps: [], lesson_order: 5 },
  { id: 'c6', title: 'Metaphor Magic: Beyond Like and As', description: 'Extended metaphors and conceits', difficulty: 4, xpReward: 55, steps: [], lesson_order: 6 },
];

const LearnScreen = ({ navigation }: any) => {
  const [progress, setProgress] = useState(0);
  const { user } = useUser();
  const [lessons, setLessons] = useState<any[]>(SAMPLE_COURSES);
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('courses');
  const { apiKey } = useOpenAI();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    // Fetch from Supabase for lessons and daily challenge
    try {
      const { data: lessonsData } = await supabase.from('lessons').select('*').order('lesson_order');
      if (lessonsData && lessonsData.length) {
        setLessons(lessonsData);
      }

      const { data: challenge } = await supabase.from('daily_challenges').select('*').order('date', { ascending: false }).limit(1).single();
      setDailyChallenge(challenge || null);

      const { data: progressData } = await supabase.from('user_progress').select('*').eq('user_id', user?.id).single();
      setProgress(progressData?.progress || 0);
    } catch (err) {
      console.warn('fetchLearningData err', err);
    }
  };

  const openLesson = (lesson: any) => {
    navigation.navigate('LessonDetail', { lessonId: lesson.id });
  };

  const renderCourse = ({ item }: { item: any }) => (
    <LessonCard lesson={item} onPress={() => openLesson(item)} />
  );

  const seedLessons = async () => {
    try {
      // Use client-side insert instead of calling non-existent RPC
      const sample = {
        title: 'Seed Course: Poetry 101',
        description: 'Seeded course',
        type: 'curated',
        difficulty: 1,
        steps: [{ type: 'theory', content: 'Intro' }],
        xp_reward: 10,
        lesson_order: 999,
      };

      const { data, error } = await supabase.from('lessons').insert([sample]).select();
      if (error) throw error;
      Alert.alert('Seeded', 'Seeded basic lessons (run full seed via SQL editor for more).');
      fetchLearningData();
    } catch (err) {
      console.error('Seed failed', err);
      Alert.alert('Seed failed', 'Check console for details');
    }
  };

  return (
    <LinearGradient colors={["#f5f7fa", "#e6eef8"]} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.xpCard}>
          <Text style={styles.xpLabel}>XP</Text>
          <Text style={styles.xpValue}>{Math.round(progress * 1000)}</Text>
          <Text style={styles.xpSub}>Level {Math.floor((progress * 1000) / 100) || 1}</Text>
        </View>

        <View style={styles.progressContainerHeader}>
          <Text style={styles.title}>Poetry Academy</Text>
          <Text style={styles.subtitle}>Master the art of verse with AI guidance</Text>
        </View>

        <TouchableOpacity style={styles.tutorButton} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.tutorText}>AI Tutor</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity style={[styles.tab, activeTab === 'courses' && styles.activeTab]} onPress={() => setActiveTab('courses')}>
          <Text style={[styles.tabText, activeTab === 'courses' && styles.activeTabText]}>Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'challenges' && styles.activeTab]} onPress={() => setActiveTab('challenges')}>
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'progress' && styles.activeTab]} onPress={() => setActiveTab('progress')}>
          <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>Progress</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'quiz' && styles.activeTab]} onPress={() => setActiveTab('quiz')}>
          <Text style={[styles.tabText, activeTab === 'quiz' && styles.activeTabText]}>Quiz</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'courses' && (
          <View>
            <Text style={styles.sectionTitle}>Featured Courses</Text>
            <FlatList data={lessons} renderItem={renderCourse} keyExtractor={(i:any)=>i.id} />
            <TouchableOpacity style={[styles.startButton, { backgroundColor: '#6c5ce7' }]} onPress={seedLessons}>
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
                <TouchableOpacity style={styles.startButton} onPress={() => navigation.navigate('ChallengeDetail', { challenge: dailyChallenge })}>
                  <Text style={styles.startText}>Start Challenge</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text>No challenge for today.</Text>
            )}
          </View>
        )}

        {activeTab === 'progress' && (
          <View>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.progressCard}>
              <Text style={styles.progressLarge}>{Math.round(progress * 100)}%</Text>
              <Text style={styles.progressSmall}>Overall Completion</Text>
              <View style={{ marginTop: 10 }}>
                <ProgressBar progress={progress} />
              </View>
            </View>
          </View>
        )}

        {activeTab === 'quiz' && (
          <View>
            <Text style={styles.sectionTitle}>Quizzes</Text>
            <TouchableOpacity style={[styles.startButton, { backgroundColor: '#6c5ce7' }]} onPress={() => navigation.navigate('QuizList')}>
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
  header: { padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  xpCard: { backgroundColor: 'white', padding: 12, borderRadius: 12, alignItems: 'center', width: 100, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  xpLabel: { fontSize: 12, color: '#636e72' },
  xpValue: { fontSize: 20, fontWeight: 'bold' },
  xpSub: { fontSize: 12, color: '#636e72' },
  progressContainerHeader: { flex: 1, marginLeft: 12 },
  title: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { color: '#636e72' },
  tutorButton: { backgroundColor: '#0984e3', padding: 10, borderRadius: 12 },
  tutorText: { color: 'white', fontWeight: '600' },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 18, marginTop: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#0984e3' },
  tabText: { color: '#636e72' },
  activeTabText: { color: '#0984e3', fontWeight: '700' },
  content: { padding: 18, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  challengeCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.06, elevation: 2 },
  challengeTitle: { fontSize: 16, fontWeight: 'bold' },
  challengeXP: { color: '#f1c40f', marginTop: 8 },
  startButton: { marginTop: 10, backgroundColor: '#00b894', padding: 12, borderRadius: 10, alignItems: 'center' },
  startText: { color: 'white', fontWeight: '700' },
  progressCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, alignItems: 'center' },
  progressLarge: { fontSize: 32, fontWeight: 'bold' },
  progressSmall: { color: '#636e72' },
});

export default LearnScreen;