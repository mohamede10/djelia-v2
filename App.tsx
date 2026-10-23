import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { useFonts, Poppins_300Light, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { 
  PlayfairDisplay_400Regular, 
  PlayfairDisplay_700Bold 
} from '@expo-google-fonts/playfair-display';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/store/AppProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { theme } from './src/config/theme';
import { ActivityIndicator, View } from 'react-native';
import { colors } from './src/config/colors';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppProvider>
          <AppNavigator />
        </AppProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
