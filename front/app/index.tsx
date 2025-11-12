import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    console.log('📍 Index - Loading:', loading, 'Session:', !!session);
    
    if (!loading) {
      if (session) {
        console.log('➡️ Navigating to app...');
        router.replace('/(app)');
      } else {
        console.log('➡️ Navigating to login...');
        router.replace('/(auth)/login');
      }
    }
  }, [session, loading]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Loading timeout - forcing navigation to login');
        router.replace('/(auth)/login');
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WorkHQ</Text>
      <ActivityIndicator size="large" color="#0B5FFF" style={styles.loader} />
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1220',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 20,
  },
  loader: {
    marginTop: 20,
  },
});


