import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { UserProvider } from './src/context/UserContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { OpenAIProvider } from './src/context/OpenAIContext';
import RootNavigator from './src/navigation/RootNavigator';
import { useFonts } from 'expo-font';
import { ActivityIndicator, Platform, View } from 'react-native';
import { ProgressProvider } from './src/context/ProgressContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { initAnalytics } from './src/utils/analytics';
import { initErrorTracking } from './src/utils/errorTracking';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import Constants from 'expo-constants';
import { palette } from './src/theme/tokens/colors';

const extra = Constants.expoConfig?.extra || {};

export default function App() {
  useEffect(() => {
    initErrorTracking({ sentryDsn: extra.sentryDsn as string | undefined });
    initAnalytics({
      enabled: !__DEV__,
      posthogKey: extra.posthogKey as string | undefined,
    });
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    if (document.getElementById('poetik-input-color')) return;
    const style = document.createElement('style');
    style.id = 'poetik-input-color';
    style.textContent = `
      input, textarea, [contenteditable="true"] {
        color: #F4FBF7;
        -webkit-text-fill-color: #F4FBF7;
        caret-color: #F4FBF7;
      }
      input::placeholder, textarea::placeholder {
        color: #8FA89C;
        -webkit-text-fill-color: #8FA89C;
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }, []);
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
    'Newsreader-Regular': require('./assets/fonts/Newsreader-Regular.ttf'),
    'Newsreader-Italic': require('./assets/fonts/Newsreader-Italic.ttf'),
    'JetBrainsMono-Medium': require('./assets/fonts/JetBrainsMono-Medium.ttf'),
    'PlayfairDisplay-Regular': require('./assets/fonts/Newsreader-Regular.ttf'),
    'PlayfairDisplay-VariableFont_wght': require('./assets/fonts/Newsreader-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.ink }}>
        <ActivityIndicator size="large" color={palette.emerald} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <OpenAIProvider>
            <AuthProvider>
              <UserProvider>
                <ProgressProvider>
                  <NotificationProvider>
                    <StatusBar style="light" />
                    <RootNavigator />
                  </NotificationProvider>
                </ProgressProvider>
              </UserProvider>
            </AuthProvider>
          </OpenAIProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}