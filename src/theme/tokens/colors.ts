export const palette = {
  canvas: '#04110C',
  canvasRaised: '#081611',
  spruce: '#101E19',
  malachite: '#162A22',
  veil: '#1F392F',
  surfaceBright: '#2E3C36',
  parchment: '#F0FDF4',
  onSurface: '#D6E6DD',
  glacial: '#CBD5E1',
  onSurfaceVariant: '#BBCABF',
  ghost: '#4B6358',
  border: '#133326',
  borderBright: '#1B4534',
  borderHairline: '#1E4738',
  emerald: '#10B981',
  mint: '#34D399',
  jade: '#059669',
  sage: '#A7F3D0',
  ink: '#04110C',
  error: '#FFB4AB',
  onError: '#690005',
  errorContainer: '#93000A',
};

export interface SemanticColors {
  bgCanvas: string;
  bgSurface: string;
  bgElevated: string;
  borderMuted: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  brandPrimary: string;
  brandSecondary: string;
  onBrand: string;
  focus: string;
  likeHeart: string;
  bookmarkGold: string;
  cardHeaderTint: string;
  success: string;
  warning: string;
  warningContainer: string;
  error: string;
  errorContainer: string;
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

const shared: Pick<
  SemanticColors,
  | 'brandPrimary'
  | 'brandSecondary'
  | 'onBrand'
  | 'focus'
  | 'likeHeart'
  | 'bookmarkGold'
  | 'success'
  | 'warning'
  | 'warningContainer'
  | 'error'
  | 'errorContainer'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'gradient'
> = {
  brandPrimary: palette.emerald,
  brandSecondary: palette.mint,
  onBrand: palette.ink,
  focus: palette.mint,
  likeHeart: palette.mint,
  bookmarkGold: palette.sage,
  success: palette.emerald,
  warning: palette.mint,
  warningContainer: palette.malachite,
  error: palette.error,
  errorContainer: palette.errorContainer,
  primary: palette.emerald,
  secondary: palette.mint,
  accent: palette.sage,
  gradient: [palette.emerald, palette.mint, palette.jade],
};

export const lightColors: SemanticColors = {
  ...shared,
  bgCanvas: palette.canvasRaised,
  bgSurface: palette.spruce,
  bgElevated: palette.veil,
  borderMuted: palette.borderBright,
  borderSubtle: palette.borderHairline,
  textPrimary: palette.parchment,
  textSecondary: palette.onSurfaceVariant,
  textMuted: palette.ghost,
  cardHeaderTint: 'rgba(16, 185, 129, 0.12)',
  background: palette.canvasRaised,
  surface: palette.spruce,
  text: palette.parchment,
  border: palette.borderBright,
};

export const darkColors: SemanticColors = {
  ...shared,
  bgCanvas: palette.canvas,
  bgSurface: palette.spruce,
  bgElevated: palette.malachite,
  borderMuted: palette.border,
  borderSubtle: palette.borderBright,
  textPrimary: palette.parchment,
  textSecondary: palette.glacial,
  textMuted: palette.ghost,
  cardHeaderTint: 'rgba(16, 185, 129, 0.08)',
  background: palette.canvas,
  surface: palette.spruce,
  text: palette.parchment,
  border: palette.border,
};
