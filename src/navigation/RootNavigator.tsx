// src/navigation/RootNavigator.tsx
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, NavigationState } from '@react-navigation/native';
import { trackScreen } from '../utils/analytics';
import { useAuth } from '../context/AuthContext';
import AppNavigator from './AppNavigator';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import LoadingScreen from '../screens/LoadingScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PoemScreen from '../screens/PoemScreen';
import PlaylistScreen from '../screens/PlaylistScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import AuthorProfileScreen from '../screens/AuthorProfileScreen';
import FollowersScreen from '../screens/FollowersScreen';
import FollowingScreen from '../screens/FollowingScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import { deferScreen } from './lazyScreens';
import { palette } from '../theme/tokens/colors';

const ONBOARDING_KEY = 'poetik.onboardingSeen';

const ActivityFeedScreen = deferScreen(() => import('../screens/ActivityFeedScreen'));
const PublicPlaylistScreen = deferScreen(() => import('../screens/PublicPlaylistScreen'));

const Stack = createNativeStackNavigator();

const getActiveRouteName = (state: NavigationState | undefined): string | undefined => {
  if (!state) return undefined;
  const route = state.routes[state.index];
  if (route.state) {
    return getActiveRouteName(route.state as NavigationState);
  }
  return route.name;
};

const RootNavigator = () => {
  const { user, isLoading } = useAuth();
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((value) => setOnboardingSeen(value === '1'))
      .catch(() => setOnboardingSeen(false));
  }, []);

  useEffect(() => {
    if (!isLoading && onboardingSeen !== null) setBooted(true);
  }, [isLoading, onboardingSeen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOnboardingSeen((seen) => seen ?? false);
      setBooted(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const enterFromSplash = () => {
    setOnboardingSeen((seen) => seen ?? false);
    setBooted(true);
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    setOnboardingSeen(true);
  };

  if (!booted) {
    return <LoadingScreen onEnter={enterFromSplash} />;
  }

  return (
    <NavigationContainer
      onStateChange={(state) => {
        const routeName = getActiveRouteName(state);
        if (routeName) trackScreen(routeName);
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.canvas } }}>
        {user ? (
          <>
            <Stack.Screen name="App" component={AppNavigator} />
            <Stack.Screen name="PoemDetail" component={PoemScreen} />
            <Stack.Screen name="Playlists" component={PlaylistScreen} />
            <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
            <Stack.Screen name="AuthorProfile" component={AuthorProfileScreen} />
            <Stack.Screen name="Followers" component={FollowersScreen} options={{ title: 'Followers' }} />
            <Stack.Screen name="Following" component={FollowingScreen} options={{ title: 'Following' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
            <Stack.Screen name="ActivityFeed" component={ActivityFeedScreen} options={{ title: 'Activity' }} />
            <Stack.Screen name="PublicPlaylist" component={PublicPlaylistScreen} options={{ title: 'Playlist' }} />
          </>
        ) : (
          <>
            {!onboardingSeen && (
              <Stack.Screen name="Onboarding">
                {() => <OnboardingScreen onDone={finishOnboarding} />}
              </Stack.Screen>
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;