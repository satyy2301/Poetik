import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { UserProvider } from './src/context/UserContext';
import RootNavigator from './src/navigation/RootNavigator';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View } from 'react-native';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
    'PlayfairDisplay-Regular': require('./assets/fonts/PlayfairDisplay-Regular.ttf')
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
      <AuthProvider>
        <UserProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </UserProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}