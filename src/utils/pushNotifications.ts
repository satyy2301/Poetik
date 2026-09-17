/**
 * Push notification utilities.
 * Install expo-notifications when ready: npx expo install expo-notifications
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_KEY = 'expo_push_token';

export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    // Dynamic import — optional dependency
    const Notifications = await import('expo-notifications' as any).catch(() => null);
    if (!Notifications) {
      console.warn('expo-notifications not installed — in-app notifications only');
      return null;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
    return token;
  } catch (err) {
    console.warn('push registration failed', err);
    return null;
  }
};

export const getStoredPushToken = async () => AsyncStorage.getItem(PUSH_TOKEN_KEY);

export const scheduleLocalNotification = async (title: string, body: string) => {
  try {
    const Notifications = await import('expo-notifications' as any).catch(() => null);
    if (!Notifications) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  } catch {
    // ignore
  }
};
