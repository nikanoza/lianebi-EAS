export const Colors = {
  primary: '#44ce1b',
  primaryLight: '#6BDF4D',
  primaryDark: '#33A013',
  accent: '#FFD700',
  accentLight: '#FFE44D',
  white: '#FFFFFF',
  black: '#000000',
  background: '#F0FBE8',
  surface: '#FFFFFF',
  gray: {
    50: '#F9FBF7',
    100: '#E8F5E0',
    200: '#D4EBC8',
    300: '#B8DFA0',
    400: '#90C96B',
    500: '#6BB044',
    600: '#4A8C2A',
    700: '#3A6E1F',
    800: '#2A5015',
    900: '#1A300C',
  },
  success: '#44ce1b',
  warning: '#FFA726',
  error: '#EF5350',
  gold: '#FFD700',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Shadow = {
  small: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
