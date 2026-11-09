import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchQuizzes } from '../services/quizService';
import { Quiz } from '../types/lesson';
import { palette } from '../theme/tokens/colors';

const TRACKS: { type: string; title: string }[] = [
  { type: 'foundations', title: 'Foundations' },
  { type: 'grammar', title: 'Grammar' },
  { type: 'sound', title: 'Sound' },
  { type: 'tools', title: 'Tools' },
  { type: 'forms', title: 'Forms' },
  { type: 'capstone', title: 'Capstone' },
];

const QuizListScreen = ({ navigation }: any) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setQuizzes(await fetchQuizzes());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={palette.emerald} />
      </View>
    );
  }

  const known = new Set(TRACKS.map((track) => track.type));
  const groups = [
    ...TRACKS.map((track) => ({
      ...track,
      quizzes: quizzes.filter((quiz) => quiz.lessonType === track.type),
    })).filter((track) => track.quizzes.length > 0),
    ...(() => {
      const rest = quizzes.filter((quiz) => !known.has(quiz.lessonType || ''));
      return rest.length > 0 ? [{ type: 'more', title: 'More', quizzes: rest }] : [];
    })(),
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {groups.length === 0 ? (
        <Text style={styles.empty}>No quizzes yet.</Text>
      ) : (
        groups.map((group) => (
          <View key={group.type}>
            <Text style={styles.track}>{group.title}</Text>
            {group.quizzes.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.item}
                onPress={() => navigation.navigate('QuizDetail', { quizId: item.id })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemMeta}>{item.questions.length} questions</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={palette.glacial} />
              </TouchableOpacity>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.canvas },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.canvas },
  track: { color: palette.parchment, fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 10 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: palette.spruce,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  itemTitle: { fontSize: 15, fontWeight: '700', color: palette.parchment },
  itemMeta: { color: palette.glacial, marginTop: 4, fontSize: 13 },
  empty: { color: palette.ghost, textAlign: 'center', marginTop: 40 },
});

export default QuizListScreen;
