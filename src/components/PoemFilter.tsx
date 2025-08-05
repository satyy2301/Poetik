// src/components/PoemFilter.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const PoemFilter = ({ currentFilters, onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(currentFilters);

  const eras = ['Romantic', 'Victorian', 'Modern', 'Contemporary'];
  const themes = ['Love', 'Nature', 'Death', 'War', 'Hope'];
  const forms = ['Sonnet', 'Haiku', 'Free Verse', 'Limerick'];

  const applyFilters = () => {
    onFilterChange(localFilters);
    setShowFilters(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Text style={styles.filterButtonText}>
          {showFilters ? 'Hide Filters' : 'Filter Poems'}
        </Text>
      </TouchableOpacity>

      {showFilters && (
        <View style={styles.filterPanel}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Era:</Text>
            <Picker
              selectedValue={localFilters.era}
              style={styles.picker}
              onValueChange={(itemValue) =>
                setLocalFilters({...localFilters, era: itemValue})
              }>
              <Picker.Item label="All Eras" value={null} />
              {eras.map(era => (
                <Picker.Item key={era} label={era} value={era} />
              ))}
            </Picker>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Theme:</Text>
            <Picker
              selectedValue={localFilters.theme}
              style={styles.picker}
              onValueChange={(itemValue) =>
                setLocalFilters({...localFilters, theme: itemValue})
              }>
              <Picker.Item label="All Themes" value={null} />
              {themes.map(theme => (
                <Picker.Item key={theme} label={theme} value={theme} />
              ))}
            </Picker>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Form:</Text>
            <Picker
              selectedValue={localFilters.form}
              style={styles.picker}
              onValueChange={(itemValue) =>
                setLocalFilters({...localFilters, form: itemValue})
              }>
              <Picker.Item label="All Forms" value={null} />
              {forms.map(form => (
                <Picker.Item key={form} label={form} value={form} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity 
            style={styles.applyButton}
            onPress={applyFilters}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
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
  filterButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  filterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterPanel: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    backgroundColor: 'white',
  },
  applyButton: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PoemFilter;