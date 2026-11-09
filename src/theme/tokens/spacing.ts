import { ViewStyle } from 'react-native';
import { palette } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
};

export const shadows = {
  card: {
    shadowColor: palette.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 2,
  } as ViewStyle,
  floating: {
    shadowColor: palette.emerald,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  } as ViewStyle,
};

export const layout = {
  feedMaxWidth: 720,
  splitPaneMaxWidth: 1080,
  inboxWidth: 340,
};
