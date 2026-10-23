import { DefaultTheme } from 'react-native-paper';
import { colors } from './colors';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.gold,
    tertiary: colors.primary,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    error: colors.error,
    accent: colors.accentRed,
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: { fontFamily: 'Poppins_400Regular', fontWeight: '400' as const },
    medium: { fontFamily: 'Poppins_400Regular', fontWeight: '500' as const },
    light: { fontFamily: 'Poppins_300Light', fontWeight: '300' as const },
    thin: { fontFamily: 'Poppins_300Light', fontWeight: '100' as const },
  },
};
