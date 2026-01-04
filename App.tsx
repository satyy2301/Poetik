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

export default function App() {
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
                <StatusBar style="auto" />
                <RootNavigator />
              </ProgressProvider>
            </UserProvider>
          </AuthProvider>
        </OpenAIProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}