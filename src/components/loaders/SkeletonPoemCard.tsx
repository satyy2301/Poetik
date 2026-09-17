import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const SkeletonPoemCard = () => {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  const bone = (width: number | `${number}%`, height: number) => (
    <Animated.View
      style={[
        styles.bone,
        {
          width,
          height,
          backgroundColor: theme.colors.borderMuted,
          opacity,
        },
      ]}
    />
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.bgSurface,
          borderColor: theme.colors.borderMuted,
        },
        theme.shadows.card,
      ]}
    >
      <View style={styles.headerRow}>
        {bone(32, 32)}
        <View style={styles.headerText}>
          {bone(120, 14)}
          {bone(60, 12)}
        </View>
      </View>
      {bone('70%', 22)}
      <View style={styles.body}>
        {bone('100%', 14)}
        {bone('90%', 14)}
        {bone('80%', 14)}
      </View>
      <View style={[styles.footer, { borderTopColor: theme.colors.borderMuted }]}>
        {bone(60, 28)}
        {bone(60, 28)}
        {bone(60, 28)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  bone: {
    borderRadius: 6,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  body: {
    marginTop: 4,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
});

export default SkeletonPoemCard;
