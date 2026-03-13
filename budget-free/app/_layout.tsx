import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Handles redirecting based on auth state
function AuthGate() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Wait until auth state is resolved

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!user && !inAuthGroup && !inOnboarding) {
      // No session — redirect to login
      router.replace('/(auth)/login');
    } else if (user && (inAuthGroup || inOnboarding)) {
      // Has a valid session but is on auth/onboarding screen — go to app
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  return null;
}

function RootLayoutContent() {
  const { theme } = useTheme();

  return (
    <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthGate />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false, animation: 'fade_from_bottom' }} />
        <Stack.Screen name="(auth)/register" options={{ headerShown: false, animation: 'fade_from_bottom' }} />
        <Stack.Screen name="(auth)/verify" options={{ headerShown: false, animation: 'fade_from_bottom' }} />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppThemeProvider>
        <RootLayoutContent />
      </AppThemeProvider>
    </AuthProvider>
  );
}
