import { Animated, Easing } from 'react-native';
import { StackCardInterpolationProps, StackCardInterpolatedStyle } from '@react-navigation/stack';

const ease = Easing.bezier(0.22, 1, 0.36, 1);

export const softTransitionSpec = {
  open: {
    animation: 'timing' as const,
    config: {
      duration: 340,
      easing: ease,
    },
  },
  close: {
    animation: 'timing' as const,
    config: {
      duration: 260,
      easing: ease,
    },
  },
};

export function forSoftPush({
  current,
  next,
  inverted,
  layouts,
}: StackCardInterpolationProps): StackCardInterpolatedStyle {
  const arrive = Animated.multiply(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [layouts.screen.width * 0.08, 0],
      extrapolate: 'clamp',
    }),
    inverted,
  );
  const opacity = current.progress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.72, 1],
    extrapolate: 'clamp',
  });
  const recede = next
    ? Animated.multiply(
      next.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -16],
        extrapolate: 'clamp',
      }),
      inverted,
    )
    : 0;
  const dim = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.18],
    extrapolate: 'clamp',
  });

  return {
    cardStyle: {
      opacity,
      transform: [{ translateX: next ? Animated.add(arrive, recede) : arrive }],
    },
    overlayStyle: { opacity: dim },
  };
}

export const stackMotion = {
  gestureEnabled: true,
  gestureResponseDistance: 32,
  transitionSpec: softTransitionSpec,
  cardStyleInterpolator: forSoftPush,
};

export const nativeStackMotion = {
  animation: 'fade_from_bottom' as const,
  animationDuration: 320,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
};
