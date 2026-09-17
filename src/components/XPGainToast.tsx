import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

type XPGainToastProps = {
  amount: number | null;
  onDone?: () => void;
};

const XPGainToast = ({ amount, onDone }: XPGainToastProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!amount) return;

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
      Animated.delay(1800),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -10, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(() => onDone?.());
  }, [amount, onDone, opacity, translateY]);

  if (!amount) return null;

  return (
    <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.text}>+{amount} XP</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: '#2ecc71',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 100,
    elevation: 8,
  },
  text: { color: 'white', fontWeight: '700', fontSize: 16 },
});

export default XPGainToast;
