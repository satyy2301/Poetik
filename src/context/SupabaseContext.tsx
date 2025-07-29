import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import React, { createContext, useContext } from 'react';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be defined in app.json');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const SupabaseContext = createContext(supabase);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => useContext(SupabaseContext);