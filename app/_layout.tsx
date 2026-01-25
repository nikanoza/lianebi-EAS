import React, { useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import GlobalLanguageSwitcher from '@/components/LanguageSwitcher';
import WebContainer from '@/components/WebContainer';
import { Colors } from '@/constants/theme';

function InitialLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') {
      const redirect = sessionStorage.getItem('redirect');
      if (redirect) {
        sessionStorage.removeItem('redirect');
        const url = new URL(redirect);
        if (url.pathname && url.pathname !== '/') {
          router.replace(url.pathname as any);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (loading) return;
      router.replace('/');
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
