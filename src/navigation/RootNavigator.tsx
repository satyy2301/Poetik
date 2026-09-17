// src/navigation/RootNavigator.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AppNavigator from './AppNavigator';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import LoadingScreen from '../screens/LoadingScreen';
import PoemScreen from '../screens/PoemScreen';
import PlaylistScreen from '../screens/PlaylistScreen';
import AuthorProfileScreen from '../screens/AuthorProfileScreen';
import FollowersScreen from '../screens/FollowersScreen';
import FollowingScreen from '../screens/FollowingScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import { deferScreen } from './lazyScreens';

const ActivityFeedScreen = deferScreen(() => import('../screens/ActivityFeedScreen'));
const PublicPlaylistScreen = deferScreen(() => import('../screens/PublicPlaylistScreen'));

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="App" component={AppNavigator} />
            <Stack.Screen name="PoemDetail" component={PoemScreen} />
            <Stack.Screen name="Playlists" component={PlaylistScreen} />
            <Stack.Screen name="AuthorProfile" component={AuthorProfileScreen} />
            <Stack.Screen name="Followers" component={FollowersScreen} options={{ title: 'Followers' }} />
            <Stack.Screen name="Following" component={FollowingScreen} options={{ title: 'Following' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
            <Stack.Screen name="ActivityFeed" component={ActivityFeedScreen} options={{ title: 'Activity' }} />
            <Stack.Screen name="PublicPlaylist" component={PublicPlaylistScreen} options={{ title: 'Playlist' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;