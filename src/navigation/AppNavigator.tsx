// src/navigation/AppNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ReadScreenWithTabs from '../screens/ReadScreenWithTabs';
import WriteScreen from '../screens/WriteScreen';
import LearnScreen from '../screens/LearnScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';
import LessonDetailScreen from '../screens/LessonsDetailScreen';
import ChallengeDetailScreen from '../screens/ChallengeDetailScreen';
import QuizListScreen from '../screens/QuizListScreen';
import QuizDetailScreen from '../screens/QuizDetailScreen';
import AITutorScreen from '../screens/AITutorScreen';
import ModerationQueueScreen from '../screens/admin/ModerationQueueScreen';
import ReportsScreen from '../screens/admin/ReportsScreen';
import { deferScreen } from './lazyScreens';

const LazyStudyTogetherScreen = deferScreen(() => import('../screens/StudyTogetherScreen'));
import AchievementsScreen from '../screens/AchievementsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import { useNotifications } from '../context/NotificationContext';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HeaderIcons = () => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { unreadCount } = useNotifications();
  const colors = theme.colors;

  return (
    <>
      <TouchableOpacity
        onPress={() => navigation.navigate('Notifications')}
        style={{ marginRight: 12 }}
      >
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
        {unreadCount > 0 && (
          <View style={{
            position: 'absolute', top: -4, right: -4, backgroundColor: '#e74c3c',
            borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Search')}
        style={{ marginRight: 12 }}
      >
        <Ionicons name="search-outline" size={24} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('Profile')}
        style={{ marginRight: 15 }}
      >
        <MaterialIcons name="account-circle" size={24} color={colors.text} />
      </TouchableOpacity>
    </>
  );
};

const MainTabNavigator = () => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Read: 'book-outline',
            Write: 'create-outline',
            Learn: 'school-outline',
            Messages: 'chatbubbles-outline',
          };
          const iconName = icons[route.name] ?? 'ellipse-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: 'PlayfairDisplay-VariableFont_wght',
          fontSize: 20,
          fontWeight: 'bold',
        },
        headerRight: HeaderIcons,
      })}
    >
      <Tab.Screen name="Read" component={ReadScreenWithTabs} />
      <Tab.Screen name="Write" component={WriteScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontFamily: 'PlayfairDisplay-VariableFont_wght',
          fontSize: 18,
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
      <Stack.Screen name="QuizList" component={QuizListScreen} />
      <Stack.Screen name="QuizDetail" component={QuizDetailScreen} options={{ title: 'Quiz' }} />
      <Stack.Screen name="AITutor" component={AITutorScreen} />
      <Stack.Screen
        name="ModerationQueue"
        component={ModerationQueueScreen}
        options={{ title: 'Moderation' }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'Abuse Reports' }}
      />
      <Stack.Screen name="Achievements" component={AchievementsScreen} options={{ title: 'Achievements' }} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Leaderboard' }} />
      <Stack.Screen name="StudyTogether" component={LazyStudyTogetherScreen} options={{ title: 'Study Together' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;