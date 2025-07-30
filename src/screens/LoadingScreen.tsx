// src/screens/LoadingScreen.tsx
import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <MaterialCommunityIcons 
          name="feather" 
          size={60} 
          color="#3498db" 
          style={styles.logo}
        />
        <Text style={styles.appName}>Poetik</Text>
      </View>
      
      <ActivityIndicator 
        size="large" 
        color="#3498db" 
        style={styles.spinner}
      />
      
      <Text style={styles.loadingText}>Loading your poetry experience...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    marginBottom: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    maxWidth: '80%',
  },
});

export default LoadingScreen;