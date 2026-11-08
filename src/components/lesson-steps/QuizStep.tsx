import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LessonStepData } from '../../types/lesson';
import { palette } from '../../theme/tokens/colors';

type QuizStepProps = {
  step: LessonStepData;
  onAnswered?: (correct: boolean) => void;
};

const QuizStep = ({ step, onAnswered }: QuizStepProps) => {
  const [selected, setSelected] = useState<number | null>(null);
  const options = step.options || [];

  const handleSelect = (index: number) => {
    setSelected(index);
    onAnswered?.(index === step.answerIndex);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{step.question || step.content}</Text>
      {options.map((option, index) => {
        const isSelected = selected === index;
        const isCorrect = selected !== null && index === step.answerIndex;
        const isWrong = isSelected && index !== step.answerIndex;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              isCorrect && styles.correct,
              isWrong && styles.wrong,
            ]}
            onPress={() => handleSelect(index)}
            disabled={selected !== null}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        );
      })}
      {selected !== null && (
        <Text style={styles.feedback}>
          {selected === step.answerIndex ? 'Correct!' : 'Try to remember this for next time.'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: palette.spruce, borderRadius: 12, padding: 16 },
  title: { fontSize: 17, fontWeight: '700', color: palette.parchment, marginBottom: 14 },
  option: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: palette.spruce,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  correct: { backgroundColor: palette.malachite, borderColor: palette.emerald },
  wrong: { backgroundColor: palette.errorContainer, borderColor: palette.error },
  optionText: { color: palette.parchment, fontSize: 15 },
  feedback: { marginTop: 8, color: palette.ghost, fontStyle: 'italic' },
});

export default QuizStep;
