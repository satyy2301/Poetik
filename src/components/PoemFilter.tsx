import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PoemFilters, PoemSort } from '../types/poem';
import { useTheme } from '../context/ThemeContext';

type PoemFilterProps = {
  currentFilters: PoemFilters;
  currentSort: PoemSort;
  onFilterChange: (filters: PoemFilters) => void;
  onSortChange: (sort: PoemSort) => void;
};

type FilterKey = 'era' | 'theme' | 'form' | 'language';

const ERAS = ['Romantic', 'Victorian', 'Modern', 'Contemporary', 'Classical'];
const THEMES = ['Love', 'Nature', 'Dreams', 'Spiritual', 'Hope', 'Melancholy', 'Loss', 'War', 'Peace'];
const FORMS = ['Free Verse', 'Sonnet', 'Haiku', 'Limerick', 'Ballad', 'Ode', 'Lyric', 'Shayari'];
const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Urdu', value: 'ur' },
];
const SORTS: { label: string; value: PoemSort }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Popular', value: 'popular' },
  { label: 'Random', value: 'random' },
];

const ease = Easing.bezier(0.22, 1, 0.36, 1);

const PoemFilter = ({
  currentFilters,
  currentSort,
  onFilterChange,
  onSortChange,
}: PoemFilterProps) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const height = useRef(new Animated.Value(0)).current;
  const contentHeight = useRef(0);

  const hasFilters = !!(currentFilters.era || currentFilters.theme || currentFilters.form || currentFilters.language);
  const languageName = LANGUAGES.find((item) => item.value === currentFilters.language)?.label;
  const summary = [languageName, currentFilters.form, currentFilters.theme, currentFilters.era].filter(Boolean).join(' · ');

  const animateTo = (toValue: number) => {
    Animated.timing(height, {
      toValue,
      duration: toValue === 0 ? 240 : 320,
      easing: ease,
      useNativeDriver: false,
    }).start();
  };

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    animateTo(next ? contentHeight.current : 0);
  };

  const onBodyLayout = (measured: number) => {
    if (measured < 1 || Math.abs(measured - contentHeight.current) < 2) return;
    contentHeight.current = measured;
    if (open) animateTo(measured);
  };

  const toggle = (key: FilterKey, value: string) => {
    const hadFilters = hasFilters;
    const next = {
      ...currentFilters,
      [key]: currentFilters[key] === value ? null : value,
    };
    onFilterChange(next);
    const stillFiltered = !!(next.era || next.theme || next.form || next.language);
    if (!stillFiltered) onSortChange('random');
    else if (!hadFilters) onSortChange('newest');
  };

  const clearFilters = () => {
    onFilterChange({
      era: null,
      theme: null,
      form: null,
      language: null,
      authorId: currentFilters.authorId ?? null,
    });
    onSortChange('random');
  };

  const chip = (key: FilterKey, value: string, label: string) => {
    const selected = currentFilters[key] === value;
    return (
      <TouchableOpacity
        key={`${key}-${value}`}
        onPress={() => toggle(key, value)}
        style={[
          styles.chip,
          {
            backgroundColor: selected ? colors.brandPrimary : colors.bgCanvas,
            borderColor: selected ? colors.brandPrimary : colors.borderSubtle,
          },
        ]}
      >
        <Text style={[styles.chipLabel, { color: selected ? colors.onBrand : colors.textPrimary }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const chevron = height.interpolate({
    inputRange: [0, 120],
    outputRange: ['0deg', '180deg'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderMuted }]}>
      <TouchableOpacity onPress={toggleOpen} style={styles.bar} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <Text style={[styles.barTitle, { color: colors.textPrimary }]}>Filters</Text>
        <Text numberOfLines={1} style={[styles.summary, { color: colors.textSecondary }]}>
          {summary || (open ? 'Hide' : 'Sort, language, form')}
        </Text>
        <Animated.View style={{ transform: [{ rotate: chevron }] }}>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={{ height, overflow: 'hidden' }} pointerEvents={open ? 'auto' : 'none'}>
        <View
          onLayout={(event) => onBodyLayout(event.nativeEvent.layout.height)}
          style={[styles.body, styles.measure]}
        >
          <Text style={[styles.section, { color: colors.textSecondary }]}>Sort</Text>
          <View style={[styles.segment, { backgroundColor: colors.bgCanvas }]}>
            {SORTS.map((option) => {
              const selected = currentSort === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => onSortChange(option.value)}
                  style={[styles.segmentItem, selected && { backgroundColor: colors.brandPrimary }]}
                >
                  <Text style={[styles.segmentLabel, { color: selected ? colors.onBrand : colors.textSecondary }]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.sectionRow}>
            <Text style={[styles.section, { color: colors.textSecondary }]}>Language</Text>
            {hasFilters && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={[styles.clear, { color: colors.brandSecondary }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.wrap}>
            {LANGUAGES.map((option) => chip('language', option.value, option.label))}
          </View>

          <Text style={[styles.section, { color: colors.textSecondary }]}>Form</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {FORMS.map((option) => chip('form', option, option))}
          </ScrollView>

          <TouchableOpacity onPress={() => setMore((value) => !value)} style={styles.moreBtn}>
            <Text style={[styles.moreLabel, { color: colors.textPrimary }]}>
              {more ? 'Hide era and theme' : 'Era and theme'}
            </Text>
          </TouchableOpacity>

          {more && (
            <>
              <Text style={[styles.section, { color: colors.textSecondary }]}>Era</Text>
              <View style={styles.wrap}>
                {ERAS.map((option) => chip('era', option, option))}
              </View>
              <Text style={[styles.section, { color: colors.textSecondary }]}>Theme</Text>
              <View style={styles.wrap}>
                {THEMES.map((option) => chip('theme', option, option))}
              </View>
            </>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  bar: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  barTitle: { fontSize: 14, fontWeight: '700' },
  summary: { flex: 1, fontSize: 13, textAlign: 'right' },
  body: { paddingHorizontal: 12, paddingBottom: 10 },
  measure: { position: 'absolute', left: 0, right: 0 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 8,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    borderRadius: 8,
  },
  segmentLabel: { fontSize: 13, fontWeight: '600' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  row: { gap: 6, paddingRight: 4 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipLabel: { fontSize: 13, fontWeight: '500' },
  clear: { fontSize: 13, fontWeight: '700', marginTop: 6 },
  moreBtn: { paddingVertical: 8 },
  moreLabel: { fontSize: 13, fontWeight: '600' },
});

export default PoemFilter;
