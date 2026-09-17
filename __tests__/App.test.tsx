/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../src/navigation/RootNavigator', () => 'RootNavigator');
jest.mock('../src/context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('../src/context/UserContext', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('../src/context/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('../src/context/OpenAIContext', () => ({
  OpenAIProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('../src/context/ProgressContext', () => ({
  ProgressProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('../src/context/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
