import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { QuizQuestion as QuizQuestionType } from '../types/lesson';
import { palette } from '../theme/tokens/colors';

type QuizQuestionProps = {
  question: QuizQuestionType;
  questionIndex: number;
  selectedAnswer: number | string | null;
  onSelect: (answer: number | string) => void;
  showResult?: boolean;
};

const QuizQuestion = ({
  question,
  questionIndex,
  selectedAnswer,
  onSelect,
  showResult = false,
}: QuizQuestionProps) => {
  const type = question.type || 'mcq';

  if (type === 'fill_in') {
    return (
      <View style={styles.container}>
        <Text style={styles.number}>Question {questionIndex + 1}</Text>
        <Text style={styles.question}>{question.question}</Text>
        <TextInput
          style={styles.input}
          value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
          onChangeText={onSelect}
          editable={!showResult}
          placeholder="Your answer"
        />
      </View>
    );
  }

  const options =
    type === 'true_false' ? ['True', 'False'] : question.options || [];

  return (
    <View style={styles.container}>
      <Text style={styles.number}>Question {questionIndex + 1}</Text>
      <Text style={styles.question}>{question.question}</Text>
      {options.map((option, index) => {
        const isSelected = selectedAnswer === index;
        const isCorrect = showResult && index === question.answerIndex;
        const isWrong = showResult && isSelected && index !== question.answerIndex;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              isSelected && styles.selected,
              isCorrect && styles.correct,
              isWrong && styles.wrong,
            ]}
            onPress={() => !showResult && onSelect(index)}
            disabled={showResult}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.spruce,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  number: { color: palette.ghost, fontSize: 12, marginBottom: 6 },
  question: { fontSize: 17, fontWeight: '700', color: palette.parchment, marginBottom: 12 },
  option: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: palette.canvas,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  selected: { borderColor: palette.emerald, backgroundColor: palette.veil },
  correct: { borderColor: palette.emerald, backgroundColor: palette.malachite },
  wrong: { borderColor: palette.error, backgroundColor: palette.errorContainer },
  optionText: { color: palette.parchment, fontSize: 15 },
  input: {
    borderWidth: 1,
    borderColor: palette.onSurfaceVariant,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
});

export default QuizQuestion;
