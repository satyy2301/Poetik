// src/components/ProgressBar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressBar = ({ progress, color = '#3498db', showText = true }) => {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View 
          style={[
            styles.progress,
            { width: `${Math.min(100, Math.max(0, progress * 100))}%` },
            { backgroundColor: color }
          ]}
        />
      </View>
      {showText && (
        <Text style={styles.text}>{Math.round(progress * 100)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    flex: 1,
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  progress: {
    height: '100%',
  },
  text: {
    fontSize: 12,
    color: '#7f8c8d',
    minWidth: 35,
  },
});

export default ProgressBar;