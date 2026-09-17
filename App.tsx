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
import Constants from 'expo-constants';

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
    'PlayfairDisplay-Regular': require('./assets/fonts/PlayfairDisplay-Regular.ttf'),
    'PlayfairDisplay-VariableFont_wght': require('./assets/fonts/PlayfairDisplay-VariableFont_wght.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <OpenAIProvider>
          <AuthProvider>
            <UserProvider>
              <ProgressProvider>
                <NotificationProvider>
                  <StatusBar style="auto" />
                  <RootNavigator />
                </NotificationProvider>
              </ProgressProvider>
            </UserProvider>
          </AuthProvider>
        </OpenAIProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}