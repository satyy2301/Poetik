import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { PoemFilters, PoemSort } from '../types/poem';

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
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>
            {showFilters ? 'Hide Filters' : 'Filter & Sort'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.sortLabel}>
          Sort: {sorts.find((s) => s.value === currentSort)?.label || 'Newest'}
        </Text>
      </View>

      {showFilters && (
        <View style={styles.filterPanel}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Sort:</Text>
            <Picker
              selectedValue={localSort}
              style={styles.picker}
              onValueChange={(value) => setLocalSort(value as PoemSort)}
            >
              {sorts.map((option) => (
                <Picker.Item key={option.value} label={option.label} value={option.value} />
              ))}
            </Picker>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Era:</Text>
            <Picker
              selectedValue={localFilters.era}
              style={styles.picker}
              onValueChange={(value) => setLocalFilters({ ...localFilters, era: value })}
            >
              <Picker.Item label="All Eras" value={null} />
              {eras.map((era) => (
                <Picker.Item key={era} label={era} value={era} />
              ))}
            </Picker>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Theme:</Text>
            <Picker
              selectedValue={localFilters.theme}
              style={styles.picker}
              onValueChange={(value) => setLocalFilters({ ...localFilters, theme: value })}
            >
              <Picker.Item label="All Themes" value={null} />
              {themes.map((theme) => (
                <Picker.Item key={theme} label={theme} value={theme} />
              ))}
            </Picker>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Form:</Text>
            <Picker
              selectedValue={localFilters.form}
              style={styles.picker}
              onValueChange={(value) => setLocalFilters({ ...localFilters, form: value })}
            >
              <Picker.Item label="All Forms" value={null} />
              {forms.map((form) => (
                <Picker.Item key={form} label={form} value={form} />
              ))}
            </Picker>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortLabel: { color: '#636e72', fontSize: 13 },
  filterButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  filterButtonText: { color: 'white', fontWeight: 'bold' },
  filterPanel: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
  filterGroup: { marginBottom: 15 },
  filterLabel: { fontWeight: 'bold', marginBottom: 5 },
  picker: { backgroundColor: 'white' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  applyButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  applyButtonText: { color: 'white', fontWeight: 'bold' },
  clearButton: {
    flex: 1,
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  clearButtonText: { color: '#636e72', fontWeight: 'bold' },
});

export default PoemFilter;
