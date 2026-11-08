import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { UserProvider } from './src/context/UserContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { OpenAIProvider } from './src/context/OpenAIContext';
import RootNavigator from './src/navigation/RootNavigator';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';
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