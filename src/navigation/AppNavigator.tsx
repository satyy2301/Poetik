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
import LessonDetailScreen from '../screens/LessonsDetailScreen';
import ChallengeDetailScreen from '../screens/ChallengeDetailScreen';
import QuizListScreen from '../screens/QuizListScreen';
import AITutorScreen from '../screens/AITutorScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HeaderIcons = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <>
      <TouchableOpacity
        onPress={() => navigation.navigate('Search')}
        style={{ marginRight: 15 }}
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
          let iconName;

          if (route.name === 'Read') {
            iconName = 'book-outline';
          } else if (route.name === 'Write') {
            iconName = 'create-outline';
          } else if (route.name === 'Learn') {
            iconName = 'school-outline';
          } else if (route.name === 'Messages') {
            iconName = 'chatbubbles-outline';
          }

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
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
      <Stack.Screen name="QuizList" component={QuizListScreen} />
      <Stack.Screen name="AITutor" component={AITutorScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;