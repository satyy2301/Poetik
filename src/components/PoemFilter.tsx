import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { PoemFilters, PoemSort } from '../types/poem';
import { useTheme } from '../context/ThemeContext';
import Button from './ui/Button';

type PoemFilterProps = {
  currentFilters: PoemFilters;
  currentSort: PoemSort;
  onFilterChange: (filters: PoemFilters) => void;
  onSortChange: (sort: PoemSort) => void;
};

const PoemFilter = ({
  currentFilters,
  currentSort,
  onFilterChange,
  onSortChange,
}: PoemFilterProps) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const [localSort, setLocalSort] = useState<PoemSort>(currentSort);

  const eras = ['Romantic', 'Victorian', 'Modern', 'Contemporary', 'classical'];
  const themes = ['Love', 'Nature', 'Death', 'War', 'Hope', 'literature'];
  const forms = ['Sonnet', 'Haiku', 'Free Verse', 'Limerick', 'Ballad'];
  const sorts: { label: string; value: PoemSort }[] = [
    { label: 'Newest', value: 'newest' },
    { label: 'Popular', value: 'popular' },
    { label: 'Random', value: 'random' },
  ];

  const applyFilters = () => {
    onFilterChange(localFilters);
    onSortChange(localSort);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const cleared = { era: null, theme: null, form: null, authorId: null };
    setLocalFilters(cleared);
    onFilterChange(cleared);
    onSortChange('newest');
    setLocalSort('newest');
    setShowFilters(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderMuted }]}>
      <View style={styles.row}>
        <Button
          title={showFilters ? 'Hide Filters' : 'Filter & Sort'}
          onPress={() => setShowFilters(!showFilters)}
          variant="secondary"
          size="compact"
        />
        <Text style={[theme.typography.bodySm, { color: colors.textSecondary }]}>
          Sort: {sorts.find((s) => s.value === currentSort)?.label || 'Newest'}
        </Text>
      </View>

      {showFilters && (
        <View style={[styles.filterPanel, { backgroundColor: colors.bgElevated }]}>
          <View style={styles.filterGroup}>
            <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>Sort:</Text>
            <Picker
              selectedValue={localSort}
              style={[styles.picker, { backgroundColor: colors.bgSurface, color: colors.textPrimary }]}
              onValueChange={(value) => setLocalSort(value as PoemSort)}
            >
              {sorts.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>

          <View style={styles.filterGroup}>
            <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>Era:</Text>
            <Picker
              selectedValue={localFilters.era}
              style={[styles.picker, { backgroundColor: colors.bgSurface }]}
              onValueChange={(value) => setLocalFilters({ ...localFilters, era: value })}
            >
              <Picker.Item label="All Eras" value={null} />
              {eras.map((era) => (
                <Picker.Item key={era} label={era} value={era} />
              ))}
            </Picker>
          </View>

          <View style={styles.filterGroup}>
            <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>Theme:</Text>
            <Picker
              selectedValue={localFilters.theme}
              style={[styles.picker, { backgroundColor: colors.bgSurface }]}
              onValueChange={(value) => setLocalFilters({ ...localFilters, theme: value })}
            >
              <Picker.Item label="All Themes" value={null} />
              {themes.map((t) => (
                <Picker.Item key={t} label={t} value={t} />
              ))}
            </Picker>
          </View>

          <View style={styles.filterGroup}>
            <Text style={[theme.typography.labelBold, { color: colors.textPrimary }]}>Form:</Text>
            <Picker
              selectedValue={localFilters.form}
              style={[styles.picker, { backgroundColor: colors.bgSurface }]}
              onValueChange={(value) => setLocalFilters({ ...localFilters, form: value })}
            >
              <Picker.Item label="All Forms" value={null} />
              {forms.map((form) => (
                <Picker.Item key={form} label={form} value={form} />
              ))}
            </Picker>
          </View>

          <View style={styles.actions}>
            <Button title="Clear" onPress={clearFilters} variant="ghost" style={styles.actionBtn} />
            <Button title="Apply" onPress={applyFilters} variant="primary" style={styles.actionBtn} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterPanel: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
  },
  filterGroup: { marginBottom: 15 },
  picker: { borderRadius: 8 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  actionBtn: { flex: 1 },
});

export default PoemFilter;
