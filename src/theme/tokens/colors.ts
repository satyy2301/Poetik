export const palette = {
  canvas: '#071510',
  canvasRaised: '#0B1C16',
  spruce: '#132820',
  malachite: '#1B342A',
  veil: '#244338',
  surfaceBright: '#305246',
  parchment: '#F4FBF7',
  onSurface: '#C5D6CC',
  glacial: '#8FA89C',
  onSurfaceVariant: '#9BB3A6',
  ghost: '#6E877C',
  border: '#1E3A2E',
  borderBright: '#2A4A3C',
  borderHairline: '#243F34',
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
  borderMuted: palette.border,
  borderSubtle: palette.borderHairline,
  textPrimary: palette.parchment,
  textSecondary: palette.onSurfaceVariant,
  textMuted: palette.ghost,
  cardHeaderTint: 'rgba(16, 185, 129, 0.10)',
  background: palette.canvasRaised,
  surface: palette.spruce,
  text: palette.parchment,
  border: palette.border,
};

export const darkColors: SemanticColors = {
  ...shared,
  bgCanvas: palette.canvas,
  bgSurface: palette.spruce,
  bgElevated: palette.malachite,
  borderMuted: palette.border,
  borderSubtle: palette.borderHairline,
  textPrimary: palette.parchment,
  textSecondary: palette.onSurfaceVariant,
  textMuted: palette.ghost,
  cardHeaderTint: 'rgba(16, 185, 129, 0.08)',
  background: palette.canvas,
  surface: palette.spruce,
  text: palette.parchment,
  border: palette.border,
};
