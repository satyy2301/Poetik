import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
const PARTICLE_COUNT = 24;
const { width } = Dimensions.get('window');

type ConfettiProps = {
  active: boolean;
  onDone?: () => void;
};

const Confetti = ({ active, onDone }: ConfettiProps) => {
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(-20),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 6,
    })),
  ).current;

  useEffect(() => {
    if (!active) return;

    const animations = particles.map((p) =>
      Animated.parallel([
        Animated.timing(p.y, {
          toValue: 400 + Math.random() * 200,
          duration: 1800 + Math.random() * 600,
          useNativeDriver: true,
        }),
        Animated.timing(p.x, {
          toValue: (p.x as any)._value + (Math.random() - 0.5) * 120,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(p.rotate, {
          toValue: Math.random() * 4,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration: 2000,
          delay: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.stagger(40, animations).start(() => {
      particles.forEach((p) => {
        p.y.setValue(-20);
        p.opacity.setValue(1);
      });
      onDone?.();
    });
  }, [active, onDone, particles]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                {
                  rotate: p.rotate.interpolate({
                    inputRange: [0, 4],
                    outputRange: ['0deg', '720deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 150,
  },
  particle: {
    position: 'absolute',
    borderRadius: 2,
  },
});

export default Confetti;
