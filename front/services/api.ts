/**
 * API Configuration and Utilities
 */

import { supabase } from '../lib/supabase';

// Use production Vercel URL by default, or env variable if set
const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_API_URL ||
  'https://workhq-pbqtv6gip-rifus-projects-7770b67a.vercel.app';
const API_URL = `${BACKEND_URL}/api`;
const DEBUG = __DEV__; // Only log in development
const REQUEST_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS || 20000);

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

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
 * Make authenticated API request with timeout and deduplication
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // Create a unique cache key for request deduplication
  const cacheKey = `${options.method || 'GET'}:${endpoint}:${JSON.stringify(options.body || '')}`;
  
  // Check if there's already a pending request for this endpoint
  if (pendingRequests.has(cacheKey)) {
    if (DEBUG) console.log(`♻️ Reusing pending request for ${endpoint}`);
    return pendingRequests.get(cacheKey);
  }

  // Create the request promise
  const requestPromise = (async () => {
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

      // Create timeout controller (default 20 seconds timeout, configurable via env)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      if (DEBUG) console.log(`📡 API Request: ${endpoint}`);

      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (DEBUG) console.log(`✅ API Response [${endpoint}]: ${response.status}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || 'Request failed');
        }

        return data;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error(`⏱️ Request timeout [${endpoint}]`);
          throw new Error('Request timeout. Please check your connection.');
        }
        throw fetchError;
      }
    } catch (error: any) {
      console.error(`❌ API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error.message || 'An error occurred',
      };
    } finally {
      // Remove from cache after completion
      pendingRequests.delete(cacheKey);
    }
  })();

  // Store the pending request
  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
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

