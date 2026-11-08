import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { animateProgress } from '../utils/animations';
import { palette } from '../theme/tokens/colors';

type ProgressBarProps = {
  progress: number;
  color?: string;
  showText?: boolean;
};

const ProgressBar = ({ progress, color = palette.emerald, showText = true }: ProgressBarProps) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateProgress(animatedWidth, progress).start();
  }, [progress, animatedWidth]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <Animated.View
          style={[
            styles.progress,
            { width: widthInterpolated, backgroundColor: color },
          ]}
        />
      </View>
      {showText && (
        <Text style={styles.text}>{Math.round(progress * 100)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    flex: 1,
    height: 8,
    backgroundColor: palette.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  progress: {
    height: '100%',
  },
  text: {
    fontSize: 12,
    color: palette.glacial,
    minWidth: 35,
  },
});

export default React.memo(ProgressBar);
