// src/screens/QuizListScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const QuizListScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quizzes</Text>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('QuizDetail', { quizId: 'sample-1' })}>
        <Text>Poetry Forms Quiz</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  item: { padding: 12, borderRadius: 8, backgroundColor: '#f1f1f1', marginBottom: 8 },
});

export default QuizListScreen;
