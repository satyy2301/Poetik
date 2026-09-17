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

const QuizDetailScreen = ({ route, navigation }: any) => {
  const { quizId } = route.params;
  const { user } = useUser();
  const { refresh, lastXpGain, clearXpToast, addXp } = useProgress();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; xpEarned: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getQuizById(quizId);
      setQuiz(data);
      if (data) setAnswers(new Array(data.questions.length).fill(null));
      setLoading(false);
    })();
  }, [quizId]);

  const handleSubmit = async () => {
    if (!user || !quiz) return;

    const unanswered = answers.some((a) => a === null || a === '');
    if (unanswered) {
      Alert.alert('Incomplete', 'Please answer all questions.');
      return;
    }

    try {
      const numericAnswers = answers.map((a) =>
        typeof a === 'number' ? a : 0,
      );
      const res = await submitQuizResult(user.id, quiz.id, numericAnswers, quiz.questions);
      setResult(res);
      setSubmitted(true);
      await addXp(res.xpEarned);
      await refresh();
    } catch (error) {
      Alert.alert('Error', 'Could not submit quiz.');
    }
  };

  const handleRetry = () => {
    if (!quiz) return;
    setAnswers(new Array(quiz.questions.length).fill(null));
    setSubmitted(false);
    setResult(null);
  };

  if (loading || !quiz) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <XPGainToast amount={lastXpGain} onDone={clearXpToast} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{quiz.title}</Text>
        <Text style={styles.subtitle}>{quiz.questions.length} questions</Text>

        {quiz.questions.map((question, index) => (
          <QuizQuestion
            key={index}
            question={question}
            questionIndex={index}
            selectedAnswer={answers[index]}
            onSelect={(answer) => {
              const next = [...answers];
              next[index] = answer;
              setAnswers(next);
            }}
            showResult={submitted}
          />
        ))}

        {submitted && result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Score: {result.score}/{result.total}</Text>
            <Text style={styles.resultXp}>+{result.xpEarned} XP earned</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryText}>Retry Quiz</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Quiz</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: '#2c3e50' },
  subtitle: { color: '#7f8c8d', marginBottom: 16 },
  submitButton: {
    backgroundColor: '#0984e3',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: { color: 'white', fontWeight: '700' },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  resultTitle: { fontSize: 20, fontWeight: '700', color: '#2c3e50' },
  resultXp: { color: '#f39c12', marginTop: 8, fontWeight: '600' },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
  },
  retryText: { color: '#2c3e50', fontWeight: '600' },
  doneButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#2ecc71',
  },
  doneText: { color: 'white', fontWeight: '700' },
});

export default QuizDetailScreen;
