import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { useProgress } from '../context/ProgressContext';
import { getLessonById, completeLesson } from '../services/lessonService';
import { Lesson, LessonStepData } from '../types/lesson';
import TheoryStep from '../components/lesson-steps/TheoryStep';
import ExampleStep from '../components/lesson-steps/ExampleStep';
import ExerciseStep from '../components/lesson-steps/ExerciseStep';
import QuizStep from '../components/lesson-steps/QuizStep';
import XPGainToast from '../components/XPGainToast';
import Confetti from '../components/Confetti';
import ProgressBar from '../components/ProgressBar';
import { hapticLight, hapticSuccess } from '../utils/animations';

const LessonsDetailScreen = ({ route, navigation }: any) => {
  const { lessonId } = route.params;
  const { user } = useUser();
  const { addXp, refresh, checkAchievements, lastXpGain, clearXpToast } = useProgress();
  const [showConfetti, setShowConfetti] = useState(false);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      try {
        const data = await getLessonById(lessonId);
        setLesson(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonId]);

  const animateStepChange = (next: number) => {
    hapticLight();
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    setCurrentStep(next);
    setUserResponse('');
    setQuizAnswered(false);
  };

  const normalizeType = (step: LessonStepData) => {
    if (step.type === 'interactive') return 'exercise';
    return step.type;
  };

  const renderStep = (step: LessonStepData) => {
    const type = normalizeType(step);

    switch (type) {
      case 'theory':
        return <TheoryStep step={step} />;
      case 'example':
        return <ExampleStep step={step} />;
      case 'exercise':
        return (
          <ExerciseStep step={step} value={userResponse} onChange={setUserResponse} />
        );
      case 'quiz':
        return <QuizStep step={step} onAnswered={() => setQuizAnswered(true)} />;
      default:
        return <TheoryStep step={step} />;
    }
  };

  const canProceed = () => {
    if (!lesson) return false;
    const step = lesson.steps[currentStep];
    const type = normalizeType(step);

    if (type === 'exercise' && step.requiresResponse && !userResponse.trim()) {
      return false;
    }
    if (type === 'quiz' && !quizAnswered) {
      return false;
    }
    return true;
  };

  const handleComplete = async () => {
    if (!user || !lesson) return;

    const xpReward = lesson.xp_reward || 25;
    await completeLesson(user.id, lesson.id, xpReward);
    await addXp(xpReward);
    await refresh();
    await checkAchievements();
    hapticSuccess();
    setShowConfetti(true);
    setTimeout(() => navigation.goBack(), 1600);
  };

  const handleNext = () => {
    if (!lesson || !canProceed()) return;

    if (currentStep < lesson.steps.length - 1) {
      animateStepChange(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) animateStepChange(currentStep - 1);
  };

  if (loading || !lesson) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  const stepProgress = (currentStep + 1) / lesson.steps.length;

  return (
    <View style={styles.container}>
      <XPGainToast amount={lastXpGain} onDone={clearXpToast} />
      <Confetti active={showConfetti} onDone={() => setShowConfetti(false)} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.lessonDescription}>{lesson.description}</Text>

        <Text style={styles.stepIndicator}>
          Step {currentStep + 1} of {lesson.steps.length}
        </Text>
        <ProgressBar progress={stepProgress} color="#0984e3" />

        <Animated.View style={{ opacity: fadeAnim, marginTop: 16 }}>
          {renderStep(lesson.steps[currentStep])}
        </Animated.View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton, !canProceed() && styles.disabled]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.navButtonText}>
            {currentStep === lesson.steps.length - 1 ? 'Complete' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { padding: 20, paddingBottom: 100 },
  lessonTitle: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 8 },
  lessonDescription: { fontSize: 16, color: '#7f8c8d', marginBottom: 16 },
  stepIndicator: { color: '#636e72', marginBottom: 8, fontWeight: '600' },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    backgroundColor: '#bdc3c7',
  },
  nextButton: { backgroundColor: '#2ecc71', marginLeft: 'auto' },
  disabled: { opacity: 0.5 },
  navButtonText: { color: 'white', fontWeight: 'bold' },
});

export default LessonsDetailScreen;
