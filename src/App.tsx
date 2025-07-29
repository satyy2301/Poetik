// src/App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { supabase } from './lib/supabase';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}