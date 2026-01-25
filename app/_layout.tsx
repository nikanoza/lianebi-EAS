import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import GlobalLanguageSwitcher from '@/components/LanguageSwitcher';
import WebContainer from '@/components/WebContainer'; // Import the new container
import { Colors } from '@/constants/theme';

// 1. Create an inner component to handle Navigation & Auth Logic
// We need this separation so we can call 'useAuth' which requires AuthProvider parent
function InitialLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!session && !inAuthGroup) {
      // If not logged in and trying to access protected screens, go to login
      // This handles the "Refresh" case on web
      router.replace('/');
    } else if (session && inAuthGroup) {
      // If already logged in and on login screen, go to dashboard
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <WebContainer>
      <GlobalLanguageSwitcher />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </WebContainer>
  );
}

// 2. Main Root Layout
export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <LanguageProvider>
          <InitialLayout />
        </LanguageProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
