import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { streakLabel } from '../utils/streakCalculator';

type StreakCounterProps = {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
};

const StreakCounter = ({ streak, size = 'md' }: StreakCounterProps) => {
  const isActive = streak > 0;
  const iconSize = size === 'lg' ? 28 : size === 'sm' ? 16 : 22;
  const fontSize = size === 'lg' ? 22 : size === 'sm' ? 14 : 18;

  return (
    <View style={[styles.container, size === 'lg' && styles.containerLg]}>
      <Ionicons
        name="flame"
        size={iconSize}
        color={isActive ? '#e67e22' : '#bdc3c7'}
      />
      <Text style={[styles.count, { fontSize }, !isActive && styles.inactive]}>
        {streak}
      </Text>
      {size !== 'sm' && (
        <Text style={styles.label}>{streakLabel(streak)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  containerLg: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  count: {
    fontWeight: '800',
    color: '#e67e22',
    marginTop: 2,
  },
  inactive: { color: '#95a5a6' },
  label: {
    fontSize: 11,
    color: '#7f8c8d',
    marginTop: 2,
    fontWeight: '600',
  },
});

export default React.memo(StreakCounter);
