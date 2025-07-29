import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SupabaseProvider } from './context/SupabaseContext';
import Navigation from './navigation';

export default function App() {
  return (
    <SupabaseProvider>
      <SafeAreaProvider>
        <Navigation />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </SupabaseProvider>
  );
}