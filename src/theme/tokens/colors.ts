export const palette = {
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  violet500: '#8B5CF6',
  violet600: '#7C3AED',
  cyan500: '#06B6D4',
  amber500: '#F59E0B',
  rose500: '#F43F5E',
  emerald500: '#10B981',

  parchment50: '#FAF8F5',
  parchment100: '#F4EFEA',
  parchment200: '#E8E1D7',
  parchment700: '#5C5449',
  parchment900: '#1C1917',

  dark950: '#0B0D13',
  dark900: '#121620',
  dark800: '#1A202E',
  dark700: '#262F42',
  dark400: '#7E8B9F',
  dark100: '#E2E8F0',
};

export interface SemanticColors {
  bgCanvas: string;
  bgSurface: string;
  bgElevated: string;
  borderMuted: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  brandPrimary: string;
  brandSecondary: string;
  likeHeart: string;
  bookmarkGold: string;
  cardHeaderTint: string;
  success: string;
  warning: string;
  error: string;
  // Backward-compat aliases
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  border: string;
  gradient: string[];
}

export const lightColors: SemanticColors = {
  bgCanvas: palette.parchment50,
  bgSurface: '#FFFFFF',
  bgElevated: palette.parchment100,
  borderMuted: palette.parchment200,
  borderSubtle: '#D6CEBE',
  textPrimary: palette.parchment900,
  textSecondary: palette.parchment700,
  brandPrimary: palette.indigo600,
  brandSecondary: palette.violet600,
  likeHeart: palette.rose500,
  bookmarkGold: palette.amber500,
  cardHeaderTint: 'rgba(99, 102, 241, 0.04)',
  success: palette.emerald500,
  warning: palette.amber500,
  error: palette.rose500,
  primary: palette.indigo600,
  secondary: palette.violet600,
  accent: palette.cyan500,
  background: palette.parchment50,
  surface: '#FFFFFF',
  text: palette.parchment900,
  border: palette.parchment200,
  gradient: [palette.indigo600, palette.violet600, palette.cyan500],
};

export const darkColors: SemanticColors = {
  bgCanvas: palette.dark950,
  bgSurface: palette.dark900,
  bgElevated: palette.dark800,
  borderMuted: palette.dark800,
  borderSubtle: palette.dark700,
  textPrimary: palette.dark100,
  textSecondary: palette.dark400,
  brandPrimary: palette.indigo500,
  brandSecondary: palette.violet500,
  likeHeart: palette.rose500,
  bookmarkGold: palette.amber500,
  cardHeaderTint: 'rgba(99, 102, 241, 0.08)',
  success: palette.emerald500,
  warning: palette.amber500,
  error: palette.rose500,
  primary: palette.indigo500,
  secondary: palette.violet500,
  accent: palette.cyan500,
  background: palette.dark950,
  surface: palette.dark900,
  text: palette.dark100,
  border: palette.dark800,
  gradient: [palette.indigo500, palette.violet500, palette.cyan500],
};
