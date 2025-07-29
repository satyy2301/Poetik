// src/screens/LearnScreen.tsx
import React, { useState ,useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView ,TextInput} from 'react-native';
import { supabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import LessonCard from '../components/LessonCard';
import ProgressBar from '../components/ProgressBar';
import { useUser } from '../context/UserContext';

const LearnScreen = () => {
   const modules = [
    { 
      title: 'Haiku Mastery', 
      description: '5-7-5 syllable structure',
      progress: 3/3,
      locked: false,
      achievement: 'Haiku Master'
    },
    {
      title: 'Shakespearean Sonnets',
      description: '14 lines of structured verse',
      progress: 1/4,
      locked: false
    },
    {
      title: 'Free Verse Freedom',
      description: 'Breaking traditional rules',
      progress: 0/3,
      locked: true
    }
  ];
  const [activeTab, setActiveTab] = useState('lessons');
  const [aiResponse, setAiResponse] = useState('');

  const analyzePoem = async (poemText: string) => {
    // Call Supabase Edge Function which calls Hugging Face
    const { data, error } = await supabase.functions.invoke('analyze-poem', {
      body: { poem: poemText },
    });
    const { user } = useUser();
    const [progress, setProgress] = useState(0);
    const [lessons, setLessons] = useState([]);
    const [dailyChallenge, setDailyChallenge] = useState(null);
    if (error) {
      console.error('Error analyzing poem:', error);
      setAiResponse('Failed to get analysis. Please try again.');
    } else {
      setAiResponse(data.feedback);
    }
  };
  useEffect(() => {
    fetchLearningData();
  }, []);

   const fetchLearningData = async () => {
    // Fetch user progress
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    setProgress(progressData?.progress || 0);
    
    // Fetch lessons
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .order('order');
      
    setLessons(lessonsData || []);
    
    // Fetch daily challenge
    const { data: challengeData } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('date', new Date().toISOString().split('T')[0])
      .single();
      
    setDailyChallenge(challengeData);
  };

  const startLesson = (lesson) => {
    navigation.navigate('LessonDetail', { lessonId: lesson.id });
  };

  const startChallenge = () => {
    navigation.navigate('ChallengeDetail', { challenge: dailyChallenge });
  };

  return (
    <LinearGradient colors={['#f5f7fa', '#c3cfe2']} style={styles.container}>
      <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Poetry Academy</Text>
          <Text style={styles.subtitle}>Master the art of verse with AI guidance</Text>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Your Learning Progress</Text>
            <ProgressBar progress={progress} />
            <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
          </View>
        </View>

        {dailyChallenge && (
          <TouchableOpacity style={styles.challengeCard} onPress={startChallenge}>
            <Text style={styles.challengeTitle}>Daily Challenge</Text>
            <Text style={styles.challengeTask}>{dailyChallenge.task}</Text>
            <Text style={styles.challengeReward}>+{dailyChallenge.xp_reward} XP</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Learning Modules</Text>
        
        {lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            onPress={() => startLesson(lesson)}
          />
        ))}
      </ScrollView>
    </View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Poetry Academy</Text>
        <Text style={styles.headerSubtitle}>Master the art of verse with AI guidance</Text>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Your Progress: 70%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {width: '70%'}]} />
          </View>
          <Text style={styles.progressDetail}>7/10 lessons completed this week</Text>
        </View>
      </View>

      <View style={styles.dailyChallenge}>
        <Text style={styles.challengeTitle}>Daily Challenge</Text>
        <Text style={styles.challengeTask}>Write a haiku about your morning coffee</Text>
        <TouchableOpacity style={styles.challengeButton}>
          <Text style={styles.challengeButtonText}>+50 XP • Start Challenge</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.modulesContainer}>
        {modules.map((module, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.moduleCard,
              module.locked && styles.lockedCard
            ]}
            disabled={module.locked}
          >
            <View style={styles.moduleHeader}>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              {module.achievement && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{module.achievement}</Text>
                </View>
              )}
            </View>
            <Text style={styles.moduleDescription}>{module.description}</Text>
            
            {module.locked ? (
              <Text style={styles.lockedText}>Complete Sonnets to unlock</Text>
            ) : (
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  {module.progress === 1 ? 'Completed' : 'In Progress'}
                </Text>
                <Text style={styles.lessonCount}>
                  {Math.floor(module.progress * 3)}/3 lessons
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
    scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 15,
  },
  progressContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressText: {
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#dfe6e9',
    borderRadius: 4,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00b894',
    borderRadius: 4,
  },
  progressDetail: {
    fontSize: 12,
    color: '#636e72',
  },
  progressPercent: {
    textAlign: 'right',
    color: '#2ecc71',
    fontWeight: 'bold',
    marginTop: 5,
  },
  dailyChallenge: {
    backgroundColor: '#0984e3',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
   challengeCard: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  challengeTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  challengeTask: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  challengeButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  challengeButtonText: {
    color: '#0984e3',
    fontWeight: '600',
  },
    challengeReward: {
    color: '#f1c40f',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  modulesContainer: {
    flex: 1,
  },
  moduleCard: {
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
  lockedCard: {
    opacity: 0.6,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  badge: {
    backgroundColor: '#fdcb6e',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  moduleDescription: {
    color: '#636e72',
    marginBottom: 10,
  },
  lockedText: {
    color: '#e17055',
    fontStyle: 'italic',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonCount: {
    color: '#636e72',
    fontSize: 12,
  },
});

export default LearnScreen;