import { Animated, Easing } from 'react-native';
import { hapticLight, hapticMedium, hapticSuccess } from './haptics';

export const fadeSlideIn = (opacity: Animated.Value, translateY: Animated.Value) =>
  Animated.parallel([
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
    Animated.timing(translateY, {
      toValue: 0,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }),
  ]);

export const fadeSlideOut = (opacity: Animated.Value, translateY: Animated.Value) =>
  Animated.parallel([
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }),
    Animated.timing(translateY, {
      toValue: -12,
      duration: 200,
      useNativeDriver: true,
    }),
  ]);

export const animateProgress = (animatedValue: Animated.Value, to: number) =>
  Animated.timing(animatedValue, {
    toValue: Math.min(1, Math.max(0, to)),
    duration: 400,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: false,
  });

export { hapticLight, hapticMedium, hapticSuccess };
