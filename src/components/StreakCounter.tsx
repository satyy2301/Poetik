import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { streakLabel } from '../utils/streakCalculator';
import { palette } from '../theme/tokens/colors';

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
        color={isActive ? palette.mint : palette.ghost}
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
    backgroundColor: palette.spruce,
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
    color: palette.mint,
    marginTop: 2,
  },
  inactive: { color: palette.ghost },
  label: {
    fontSize: 11,
    color: palette.glacial,
    marginTop: 2,
    fontWeight: '600',
  },
});

export default React.memo(StreakCounter);
