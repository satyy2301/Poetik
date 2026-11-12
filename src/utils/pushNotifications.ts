/**
 * Push tokens are stored locally. Native push delivery is not wired up.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_KEY = 'expo_push_token';

export const registerForPushNotifications = async (): Promise<string | null> => null;

export const getStoredPushToken = async () => AsyncStorage.getItem(PUSH_TOKEN_KEY);

export const scheduleLocalNotification = async (_title: string, _body: string) => {};
