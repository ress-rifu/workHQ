import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

console.log('🔧 Initializing Supabase Client...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key preview:', supabaseAnonKey.substring(0, 20) + '...');
console.log('🔑 Key length:', supabaseAnonKey.length);

if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️  Missing Supabase environment variables. Please create a .env file with:');
  console.warn('EXPO_PUBLIC_SUPABASE_URL=your-supabase-url');
  console.warn('EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key');
  console.warn('EXPO_PUBLIC_BACKEND_API_URL=your-backend-url');
}

if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
  console.error('❌ Using placeholder Supabase credentials! Login will not work.');
  console.error('❌ Please update your .env file with real Supabase credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

