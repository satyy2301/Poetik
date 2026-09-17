import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { fetchQuizzes } from '../services/quizService';
import { Quiz } from '../types/lesson';

const QuizListScreen = ({ navigation }: any) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchQuizzes();
        setQuizzes(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quizzes</Text>
      <FlatList
        data={quizzes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No quizzes yet. Run seed SQL in Supabase.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('QuizDetail', { quizId: item.id })}
          >
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemMeta}>{item.questions.length} questions</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#2c3e50' },
  item: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'white',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#2c3e50' },
  itemMeta: { color: '#7f8c8d', marginTop: 4, fontSize: 13 },
  empty: { color: '#95a5a6', textAlign: 'center', marginTop: 40 },
});

export default QuizListScreen;
