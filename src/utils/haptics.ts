import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const canHaptic = Platform.OS !== 'web';

export const hapticLight = async () => {
  if (!canHaptic) return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export const hapticMedium = async () => {
  if (!canHaptic) return;
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

export const hapticSuccess = async () => {
  if (!canHaptic) return;
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

export const hapticSelection = async () => {
  if (!canHaptic) return;
  await Haptics.selectionAsync();
};
