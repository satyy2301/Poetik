import React from 'react';
import { View, StyleSheet } from 'react-native';

type ProgressDotsProps = {
  total?: number;
  current?: number;
  totalSteps?: number;
  currentStep?: number;
  color?: string;
};

const ProgressDots = ({
  total,
  current,
  totalSteps,
  currentStep,
  color = '#6366F1',
}: ProgressDotsProps) => {
  const count = total ?? totalSteps ?? 0;
  const active = current ?? currentStep ?? 0;
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: index <= active ? color : '#E2E8F0' },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginVertical: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});

export default ProgressDots;
