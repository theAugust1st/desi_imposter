export const colors = {
  primary: '#F5A623', // Saffron Gold — marigold garlands, haldi
  secondary: '#006D77', // Deep Teal — Pakistani truck art
  danger: '#C0392B', // Crimson — imposter reveal, sindoor
  background: '#FFF8EE', // Warm Cream — light theme background
  surface: '#FFFFFF', // Pure White — card backgrounds
  accent: '#A8E063', // Electric Lime — mehndi green, modern pop
  textDark: '#1A1A2E', // Dark text for light backgrounds
  textLight: '#FFF8EE', // Light text for dark backgrounds (buttons, danger cards)
  textMuted: '#8C8C9E', // Muted gray for secondary text
  coverBg: '#000000', // PURE BLACK for cover screen (safety requirement)
  overlay: 'rgba(26, 26, 46, 0.92)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const;

export const fonts = {
  heading: 'BricolageGrotesque_700Bold',
  body: 'NotoSans_400Regular',
  label: 'NotoSans_700Bold',
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Fonts = typeof fonts;
