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
  selectedAnswer,
  onSelect,
  showResult = false,
}: QuizQuestionProps) => {
  const type = question.type || 'mcq';

  if (type === 'fill_in') {
    return (
      <View style={styles.container}>
        <Text style={styles.question}>{question.question}</Text>
        <TextInput
          style={styles.input}
          value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
          onChangeText={onSelect}
          editable={!showResult}
          placeholder="Your answer"
          placeholderTextColor={palette.ghost}
        />
      </View>
    );
  }

  const options =
    type === 'true_false' ? ['True', 'False'] : question.options || [];

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question.question}</Text>
      {options.map((option, index) => {
        const isSelected = selectedAnswer === index;
        const isCorrect = showResult && index === question.answerIndex;
        const isWrong = showResult && isSelected && index !== question.answerIndex;
        const letter = String.fromCharCode(65 + index);

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
            <View style={[styles.letter, (isSelected || isCorrect) && styles.letterOn, isWrong && styles.letterWrong]}>
              <Text style={[styles.letterText, (isSelected || isCorrect) && styles.letterTextOn]}>{letter}</Text>
            </View>
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
  question: { fontSize: 18, fontWeight: '700', color: palette.parchment, marginBottom: 14, lineHeight: 26 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: palette.canvas,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  letter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.spruce,
  },
  letterOn: { backgroundColor: palette.emerald },
  letterWrong: { backgroundColor: palette.errorContainer },
  letterText: { color: palette.glacial, fontWeight: '700', fontSize: 13 },
  letterTextOn: { color: palette.ink },
  selected: { borderColor: palette.emerald, backgroundColor: palette.veil },
  correct: { borderColor: palette.emerald, backgroundColor: palette.malachite },
  wrong: { borderColor: palette.error, backgroundColor: palette.errorContainer },
  optionText: { color: palette.parchment, fontSize: 15, flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: palette.onSurfaceVariant,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: palette.parchment,
  },
});

export default QuizQuestion;
