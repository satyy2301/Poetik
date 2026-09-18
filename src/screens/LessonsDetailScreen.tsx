import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { getLessonById, completeLesson } from '../services/lessonService';
import { Lesson, LessonStepData } from '../types/lesson';
import TheoryStep from '../components/lesson-steps/TheoryStep';
import ExampleStep from '../components/lesson-steps/ExampleStep';
import ExerciseStep from '../components/lesson-steps/ExerciseStep';
import QuizStep from '../components/lesson-steps/QuizStep';
import XPGainToast from '../components/XPGainToast';
import Confetti from '../components/Confetti';
import ProgressBar from '../components/ProgressBar';
import StackHeader from '../components/ui/StackHeader';
import Button from '../components/ui/Button';
import ScreenContainer from '../components/layout/ScreenContainer';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { trackEvent } from '../utils/analytics';

const LessonsDetailScreen = ({ route, navigation }: any) => {
  const { lessonId } = route.params;
  const { user } = useUser();
  const { theme } = useTheme();
  const colors = theme.colors;
  const { isMobile } = useResponsive();
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
      case 'theory': return <TheoryStep step={step} />;
      case 'example': return <ExampleStep step={step} />;
      case 'exercise': return <ExerciseStep step={step} value={userResponse} onChange={setUserResponse} />;
      case 'quiz': return <QuizStep step={step} onAnswered={() => setQuizAnswered(true)} />;
      default: return <TheoryStep step={step} />;
    }
  };

  const canProceed = () => {
    if (!lesson) return false;
    const step = lesson.steps[currentStep];
    const type = normalizeType(step);
    if (type === 'exercise' && step.requiresResponse && !userResponse.trim()) return false;
    if (type === 'quiz' && !quizAnswered) return false;
    return true;
  };

  const handleComplete = async () => {
    if (!user || !lesson) return;
    const xpReward = lesson.xp_reward || 25;
    await completeLesson(user.id, lesson.id, xpReward);
    trackEvent('lesson_complete', { lesson_id: lesson.id, xp: xpReward });
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.bgCanvas }]}>
        <ActivityIndicator size="large" color={colors.brandPrimary} />
      </View>
    );
  }

  const stepProgress = (currentStep + 1) / lesson.steps.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCanvas }]}>
      <XPGainToast amount={lastXpGain} onDone={clearXpToast} />
      <Confetti active={showConfetti} onDone={() => setShowConfetti(false)} />

      <StackHeader
        title={lesson.title}
        onBack={() => navigation.goBack()}
        useSerif
        rightActions={
          <Text style={[theme.typography.bodySm, { color: colors.textSecondary }]}>
            {Math.round(stepProgress * 100)}%
          </Text>
        }
      />

      <ProgressBar progress={stepProgress} color={colors.brandPrimary} />

      <ScreenContainer edges={[]} scrollable contentStyle={styles.scrollContent}>
        <View style={[styles.contentCard, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
          <Text style={[theme.typography.bodyMd, { color: colors.textSecondary, marginBottom: 16 }]}>
            {lesson.description}
          </Text>
          <Text style={[theme.typography.labelBold, { color: colors.textSecondary, marginBottom: 12 }]}>
            Step {currentStep + 1} of {lesson.steps.length}
          </Text>
          <Animated.View style={{ opacity: fadeAnim }}>
            {renderStep(lesson.steps[currentStep])}
          </Animated.View>
        </View>
      </ScreenContainer>

      <View style={[styles.bottomBar, { backgroundColor: colors.bgSurface, borderTopColor: colors.borderMuted }]}>
        {currentStep > 0 && (
          <Button
            title="Back"
            onPress={handlePrevious}
            variant="ghost"
            style={isMobile ? styles.bottomBtn : undefined}
          />
        )}
        <Button
          title={currentStep === lesson.steps.length - 1 ? 'Complete' : 'Continue'}
          onPress={handleNext}
          variant="primary"
          disabled={!canProceed()}
          style={[isMobile ? styles.bottomBtnFull : styles.bottomBtnRight, !canProceed() && styles.disabled]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 100 },
  contentCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginTop: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  bottomBtn: { flex: 1 },
  bottomBtnFull: { flex: 1 },
  bottomBtnRight: { minWidth: 140 },
  disabled: { opacity: 0.5 },
});

export default LessonsDetailScreen;
