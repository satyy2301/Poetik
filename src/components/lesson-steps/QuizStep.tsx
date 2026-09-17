import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LessonStepData } from '../../types/lesson';

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
  container: { backgroundColor: 'white', borderRadius: 12, padding: 16 },
  title: { fontSize: 17, fontWeight: '700', color: '#2c3e50', marginBottom: 14 },
  option: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f1f3f5',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  correct: { backgroundColor: '#e8f8f0', borderColor: '#2ecc71' },
  wrong: { backgroundColor: '#fdecea', borderColor: '#e74c3c' },
  optionText: { color: '#2c3e50', fontSize: 15 },
  feedback: { marginTop: 8, color: '#636e72', fontStyle: 'italic' },
});

export default QuizStep;
