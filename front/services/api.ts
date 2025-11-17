/**
 * API Configuration and Utilities
 */

import { supabase } from '../lib/supabase';

// Use production Vercel URL by default, or env variable if set
const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL || 'https://workhq-api.vercel.app';
const API_URL = `${BACKEND_URL}/api`;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Get auth token from Supabase session
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      return null;
    }
    return session.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Make authenticated API request with timeout
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = await getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Create timeout controller (30 seconds timeout - increased for slow connections)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    console.log(`📡 API Request: ${endpoint}`);
    console.log(`🌐 Backend URL: ${BACKEND_URL}`);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`✅ API Response [${endpoint}]: ${response.status}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error(`⏱️ Request timeout [${endpoint}] - Backend may be sleeping or unreachable`);
        throw new Error('Request timeout - Backend server may be sleeping. Please try again in a moment.');
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error(`❌ API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error.message || 'An error occurred',
    };
  }
}

/**
 * Helper functions for common HTTP methods
 */
export const api = {
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T = any>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};

