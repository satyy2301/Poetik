import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { PoemFilters, PoemSort } from '../types/poem';
import { useTheme } from '../context/ThemeContext';

type PoemFilterProps = {
  currentFilters: PoemFilters;
  currentSort: PoemSort;
  onFilterChange: (filters: PoemFilters) => void;
  onSortChange: (sort: PoemSort) => void;
};

type FilterKey = 'era' | 'theme' | 'form';

const ERAS = ['Romantic', 'Victorian', 'Modern', 'Contemporary', 'Classical'];
const THEMES = ['Love', 'Nature', 'Dreams', 'Spiritual', 'Hope', 'Melancholy', 'Loss', 'War', 'Peace'];
const FORMS = ['Free Verse', 'Sonnet', 'Haiku', 'Limerick', 'Ballad', 'Ode', 'Lyric'];
const SORTS: { label: string; value: PoemSort }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Popular', value: 'popular' },
  { label: 'Random', value: 'random' },
];
const GROUPS: { key: FilterKey; label: string }[] = [
  { key: 'era', label: 'Era' },
  { key: 'theme', label: 'Theme' },
  { key: 'form', label: 'Form' },
];

const OPTIONS: Record<FilterKey, string[]> = {
  era: ERAS,
  theme: THEMES,
  form: FORMS,
};

const PoemFilter = ({
  currentFilters,
  currentSort,
  onFilterChange,
  onSortChange,
}: PoemFilterProps) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [group, setGroup] = useState<FilterKey>('era');
  const activeValue = currentFilters[group] || null;
  const hasFilters = !!(currentFilters.era || currentFilters.theme || currentFilters.form);

  const selectOption = (value: string) => {
    onFilterChange({
      ...currentFilters,
      [group]: currentFilters[group] === value ? null : value,
    });
  };

  const clearFilters = () => {
    onFilterChange({ era: null, theme: null, form: null, authorId: currentFilters.authorId ?? null });
    onSortChange('newest');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCanvas, borderBottomColor: colors.borderMuted }]}>
      <View style={styles.sortRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {SORTS.map((option) => {
            const selected = currentSort === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => onSortChange(option.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.brandPrimary : colors.bgSurface,
                    borderColor: selected ? colors.brandPrimary : colors.borderMuted,
                  },
                ]}
              >
                <Text style={[theme.typography.labelMono, { color: selected ? colors.onBrand : colors.textPrimary }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {hasFilters && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearBtn}>
            <Text style={[theme.typography.labelMono, { color: colors.brandSecondary }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.groupRow}>
        {GROUPS.map((item) => {
          const selected = group === item.key;
          const chosen = currentFilters[item.key];
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => setGroup(item.key)}
              style={[
                styles.groupBtn,
                { borderBottomColor: selected ? colors.brandSecondary : 'transparent' },
              ]}
            >
              <Text style={[theme.typography.labelMono, { color: selected ? colors.textPrimary : colors.textSecondary }]}>
                {chosen ? `${item.label} · ${chosen}` : item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
        {OPTIONS[group].map((option) => {
          const selected = activeValue === option;
          return (
            <TouchableOpacity
              key={option}
              onPress={() => selectOption(option)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.brandPrimary : 'transparent',
                  borderColor: selected ? colors.brandPrimary : colors.borderSubtle,
                },
              ]}
            >
              <Text style={[theme.typography.bodySm, { color: selected ? colors.onBrand : colors.textPrimary }]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  groupRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 16,
  },
  groupBtn: {
    paddingBottom: 6,
    borderBottomWidth: 2,
  },
  chipScroll: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});

export default PoemFilter;
