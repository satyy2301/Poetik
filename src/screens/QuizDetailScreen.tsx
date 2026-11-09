import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { useProgress } from '../context/ProgressContext';
import QuizQuestion from '../components/QuizQuestion';
import { getQuizById, submitQuizResult } from '../services/quizService';
import { Quiz } from '../types/lesson';
import XPGainToast from '../components/XPGainToast';
import { trackEvent } from '../utils/analytics';
import { palette } from '../theme/tokens/colors';

const isBlank = (answer: number | string | null) => answer === null || answer === '';

const QuizDetailScreen = ({ route, navigation }: any) => {
  const { quizId } = route.params;
  const { user } = useUser();
  const { refresh, lastXpGain, clearXpToast, addXp } = useProgress();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const [index, setIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; xpEarned: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getQuizById(quizId);
        if (!active) return;
        if (!data) {
          setLoadError(true);
          return;
        }
        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(null));
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [quizId]);

  const handleSubmit = async () => {
    if (!user || !quiz || submitting) return;

    const missing = answers.findIndex(isBlank);
    if (missing >= 0) {
      setIndex(missing);
      return;
    }

    try {
      setSubmitting(true);
      const numericAnswers = answers.map((a) => (typeof a === 'number' ? a : 0));
      const res = await submitQuizResult(user.id, quiz.id, numericAnswers, quiz.questions);
      setResult(res);
      setSubmitted(true);
      setReviewing(false);
      trackEvent('quiz_complete', { quiz_id: quiz.id, score: res.score, xp: res.xpEarned });
      await addXp(res.xpEarned);
      await refresh();
    } catch {
      Alert.alert('Error', 'Could not submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    if (!quiz) return;
    setAnswers(new Array(quiz.questions.length).fill(null));
    setIndex(0);
    setSubmitted(false);
    setReviewing(false);
    setResult(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.emerald} />
      </View>
    );
  }

  if (loadError || !quiz) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle}>This quiz could not be loaded.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const total = quiz.questions.length;
  const answered = answers.filter((answer) => !isBlank(answer)).length;
  const onLast = index === total - 1;
  const currentAnswered = !isBlank(answers[index]);

  if (submitted && result && !reviewing) {
    const percent = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
    return (
      <View style={styles.container}>
        <XPGainToast amount={lastXpGain} onDone={clearXpToast} />
        <View style={styles.resultWrap}>
          <Text style={styles.kicker}>{quiz.title}</Text>
          <Text style={styles.percent}>{percent}%</Text>
          <Text style={styles.resultLine}>
            {result.score} of {result.total} correct
          </Text>
          <Text style={styles.resultXp}>+{result.xpEarned} XP</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => { setIndex(0); setReviewing(true); }}>
            <Text style={styles.primaryText}>Review answers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleRetry}>
            <Text style={styles.secondaryText}>Try again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ghostButton} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <XPGainToast amount={lastXpGain} onDone={clearXpToast} />
      <View style={styles.progressHeader}>
        <Text style={styles.kicker} numberOfLines={1}>{quiz.title}</Text>
        <Text style={styles.stepLabel}>
          {reviewing ? 'Review' : 'Question'} {index + 1} of {total}
        </Text>
        <View style={styles.track}>
          {quiz.questions.map((_, dot) => {
            const filled = reviewing ? dot <= index : !isBlank(answers[dot]);
            return (
              <View
                key={dot}
                style={[
                  styles.dot,
                  filled && styles.dotFilled,
                  dot === index && styles.dotCurrent,
                ]}
              />
            );
          })}
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <QuizQuestion
          question={quiz.questions[index]}
          questionIndex={index}
          selectedAnswer={answers[index]}
          onSelect={(answer) => {
            const next = [...answers];
            next[index] = answer;
            setAnswers(next);
          }}
          showResult={reviewing}
        />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.secondaryButton, styles.footerButton, index === 0 && styles.disabled]}
          onPress={() => setIndex((current) => Math.max(0, current - 1))}
          disabled={index === 0}
        >
          <Text style={styles.secondaryText}>Back</Text>
        </TouchableOpacity>
        {reviewing && onLast ? (
          <TouchableOpacity
            style={[styles.primaryButton, styles.footerButton]}
            onPress={() => setReviewing(false)}
          >
            <Text style={styles.primaryText}>Score</Text>
          </TouchableOpacity>
        ) : onLast && !reviewing ? (
          <TouchableOpacity
            style={[styles.primaryButton, styles.footerButton, (answered < total || submitting) && styles.disabled]}
            onPress={handleSubmit}
            disabled={answered < total || submitting}
          >
            <Text style={styles.primaryText}>{submitting ? 'Saving…' : `Submit ${answered}/${total}`}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, styles.footerButton, !currentAnswered && !reviewing && styles.disabled]}
            onPress={() => setIndex((current) => Math.min(total - 1, current + 1))}
            disabled={!currentAnswered && !reviewing}
          >
            <Text style={styles.primaryText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.canvas },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.canvas, padding: 24 },
  content: { padding: 16, paddingBottom: 24 },
  progressHeader: { paddingHorizontal: 16, paddingTop: 12 },
  kicker: { color: palette.glacial, fontSize: 13, fontWeight: '600' },
  stepLabel: { color: palette.parchment, fontSize: 18, fontWeight: '700', marginTop: 4 },
  track: { flexDirection: 'row', gap: 6, marginTop: 12, marginBottom: 4 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: palette.border },
  dotFilled: { backgroundColor: palette.emerald },
  dotCurrent: { backgroundColor: palette.mint },
  subtitle: { color: palette.glacial, marginBottom: 16, textAlign: 'center' },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  footerButton: { flex: 1, marginTop: 0 },
  primaryButton: {
    backgroundColor: palette.emerald,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryText: { color: palette.ink, fontWeight: '700', fontSize: 15 },
  secondaryButton: {
    backgroundColor: palette.spruce,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: palette.border,
  },
  secondaryText: { color: palette.parchment, fontWeight: '700', fontSize: 15 },
  ghostButton: { paddingVertical: 12, alignItems: 'center' },
  disabled: { opacity: 0.4 },
  resultWrap: { flex: 1, justifyContent: 'center', padding: 24 },
  percent: { color: palette.parchment, fontSize: 56, fontWeight: '700', marginTop: 8 },
  resultLine: { color: palette.onSurface, fontSize: 16, marginTop: 4 },
  resultXp: { color: palette.mint, fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 8 },
});

export default QuizDetailScreen;
