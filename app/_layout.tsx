import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
// 1. Import the Language Provider and Switcher
import { LanguageProvider } from '@/contexts/LanguageContext';
import GlobalLanguageSwitcher from '@/components/LanguageSwitcher';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        {/* 2. WRAP EVERYTHING HERE */}
        <LanguageProvider>
          {/* 3. Add the floating Switcher here so it shows on every screen */}
          <GlobalLanguageSwitcher />

          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </LanguageProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
