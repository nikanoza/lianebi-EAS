import React, { useEffect, useRef } from 'react';
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

const appSessionId = Math.random().toString(36).substring(7);

if (Platform.OS === 'web') {
  (window as any).__appSessionId = appSessionId;
}

function InitialLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const hasCheckedInitialRoute = useRef(false);

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

    const isUnitOrLessonPage =
      segments[0] === 'unit' || segments[0] === 'lesson';

    if (isUnitOrLessonPage && Platform.OS === 'web' && !hasCheckedInitialRoute.current) {
      hasCheckedInitialRoute.current = true;
      const allowedSession = sessionStorage.getItem('unitLessonSession');

      if (allowedSession !== appSessionId) {
        router.replace('/');
        return;
      }
    }

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      router.replace('/');
    } else if (session && inAuthGroup) {
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
