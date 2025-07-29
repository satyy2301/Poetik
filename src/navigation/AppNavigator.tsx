// src/navigation/AppNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ReadScreen from '../screens/ReadScreen';
import WriteScreen from '../screens/WriteScreen';
import LearnScreen from '../screens/LearnScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
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
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Read" component={ReadScreen} />
      <Tab.Screen name="Write" component={WriteScreen} />
      <Tab.Screen name="Learn" component={LearnScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;