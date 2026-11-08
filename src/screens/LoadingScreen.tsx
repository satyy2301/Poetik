import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type LoadingScreenProps = {
  onEnter?: () => void;
};

const LoadingScreen = ({ onEnter }: LoadingScreenProps) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCanvas }]}>
      <View style={styles.topRow}>
        <Text style={[theme.typography.labelMono, { color: colors.accent }]}>A QUIET NIGHT</Text>
        <Text style={[theme.typography.labelMono, { color: colors.textSecondary }]}>POEMS</Text>
      </View>

      <View style={[styles.mark, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }, theme.shadows.floating]}>
        <Ionicons name="leaf-outline" size={36} color={colors.brandSecondary} />
        <Text style={[theme.typography.labelMono, styles.markWord, { color: colors.brandSecondary }]}>POETIK</Text>
      </View>

      <Text style={[theme.typography.displayLg, styles.wordmark, { color: colors.textPrimary }]}>POETIK</Text>
      <Text style={[theme.typography.labelMono, { color: colors.brandSecondary }]}>WHERE WORDS TAKE FLIGHT</Text>

      <View style={[styles.quote, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
        <Text style={[theme.typography.poemBody, styles.quoteText, { color: colors.textPrimary }]}>
          The world is full of paper.
        </Text>
        <Text style={[theme.typography.poemBody, styles.quoteText, { color: colors.brandSecondary }]}>
          Write until the dark turns luminous.
        </Text>
      </View>

      <Text style={[theme.typography.labelMono, { color: colors.textSecondary, marginTop: 28 }]}>
        A quiet place for poems
      </Text>

      {onEnter ? (
        <TouchableOpacity
          style={[styles.enter, { backgroundColor: colors.brandPrimary }]}
          onPress={onEnter}
          activeOpacity={0.9}
        >
          <Text style={[theme.typography.labelBold, { color: colors.onBrand }]}>Get started</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.onBrand} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  topRow: {
    position: 'absolute',
    top: 56,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mark: {
    width: 132,
    height: 132,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
  },
  markWord: {
    marginTop: 8,
  },
  wordmark: {
    letterSpacing: 6,
    marginBottom: 8,
  },
  quote: {
    marginTop: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 22,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 460,
  },
  enter: {
    marginTop: 28,
    height: 52,
    borderRadius: 8,
    width: '100%',
    maxWidth: 460,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quoteText: {
    textAlign: 'center',
  },
});

export default LoadingScreen;
