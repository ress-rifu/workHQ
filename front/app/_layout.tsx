import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useTheme } from '../contexts/ThemeContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash screen might already be hidden
});

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);
  const { colors } = useTheme();

  // React Native compatible error handling
  // Note: For comprehensive error handling, consider using react-native-error-boundary
  useEffect(() => {
    // Set up console error override for development debugging
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if this is an error we should handle
      const firstArg = args[0];
      if (firstArg instanceof Error && (firstArg.message.includes('Supabase') || firstArg.message.includes('Network'))) {
        setError(firstArg);
      }
      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.error }]}>⚠️ App Initialization Error</Text>
        <Text style={[styles.errorText, { color: colors.text }]}>{error.message}</Text>
        <Text style={[styles.errorHint, { color: colors.textTertiary }]}>
          Please check your .env file configuration
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      console.log('✅ Fonts loaded:', fontsLoaded);
      if (fontError) console.error('❌ Font error:', fontError);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    console.log('🚀 WorkHQ App Starting...');
    console.log('📱 Expo Public Config:', {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      backendUrl: process.env.EXPO_PUBLIC_BACKEND_API_URL || '❌ Missing',
    });
  }, []);

  // Show loading screen while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});



