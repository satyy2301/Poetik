// src/screens/ReadScreenWithTabs.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ReadScreen from './ReadScreen';

const ReadScreenWithTabs = () => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>All Poems</Text>
      </View>

      <View style={styles.content}>
        <ReadScreen />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay-VariableFont_wght',
    fontWeight: 'bold',
  },
  content: { flex: 1 },
});

export default ReadScreenWithTabs;
