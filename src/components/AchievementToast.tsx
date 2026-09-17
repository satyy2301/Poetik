import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Achievement } from '../types/achievement';
import { hapticSuccess } from '../utils/animations';

type AchievementToastProps = {
  achievement: Achievement | null;
  onDone?: () => void;
};

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  book: 'book',
  flame: 'flame',
  star: 'star',
  ribbon: 'ribbon',
  'help-circle': 'help-circle',
  'checkmark-circle': 'checkmark-circle',
  create: 'create',
  medal: 'medal',
  trophy: 'trophy',
  school: 'school',
};

const AchievementToast = ({ achievement, onDone }: AchievementToastProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!achievement) return;

    hapticSuccess();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]),
      Animated.delay(2200),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.9, duration: 300, useNativeDriver: true }),
      ]),
    ]).start(() => onDone?.());
  }, [achievement, onDone, opacity, scale]);

  if (!achievement) return null;

  const iconName = iconMap[achievement.icon] || 'trophy';

  return (
    <Animated.View style={[styles.toast, { opacity, transform: [{ scale }] }]}>
      <View style={styles.iconWrap}>
        <Ionicons name={iconName} size={28} color="#f39c12" />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>Achievement Unlocked!</Text>
        <Text style={styles.name}>{achievement.name}</Text>
        {achievement.xp_reward > 0 && (
          <Text style={styles.xp}>+{achievement.xp_reward} XP</Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#2c3e50',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 200,
    elevation: 10,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef5e7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: { flex: 1 },
  title: { color: '#f39c12', fontSize: 12, fontWeight: '700', marginBottom: 2 },
  name: { color: 'white', fontSize: 16, fontWeight: '700' },
  xp: { color: '#2ecc71', fontSize: 13, marginTop: 4, fontWeight: '600' },
});

export default AchievementToast;
