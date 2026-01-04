// src/context/OpenAIContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OpenAIContextType {
  apiKey: string | null;
  setApiKey: (key: string | null) => Promise<void>;
}

const OpenAIContext = createContext<OpenAIContextType | undefined>(undefined);

export const OpenAIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('OPENAI_API_KEY');
        if (saved) setApiKeyState(saved);
      } catch (err) {
        console.warn('Failed to load OpenAI key', err);
      }
    })();
  }, []);

  const setApiKey = async (key: string | null) => {
    try {
      if (key) {
        await AsyncStorage.setItem('OPENAI_API_KEY', key);
        setApiKeyState(key);
      } else {
        await AsyncStorage.removeItem('OPENAI_API_KEY');
        setApiKeyState(null);
      }
    } catch (err) {
      console.warn('Failed to save OpenAI key', err);
    }
  };

  return (
    <OpenAIContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </OpenAIContext.Provider>
  );
};

export const useOpenAI = () => {
  const ctx = useContext(OpenAIContext);
  if (!ctx) throw new Error('useOpenAI must be used within OpenAIProvider');
  return ctx;
};
