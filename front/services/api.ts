/**
 * API Configuration and Utilities
 */

import { supabase } from '../lib/supabase';

// Use production Vercel URL by default, or env variable if set
const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_API_URL ||
  'https://workhq-api.vercel.app';
const API_URL = `${BACKEND_URL}/api`;
const DEBUG = __DEV__; // Only log in development
const REQUEST_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS || 10000); // Reduced to 10s for faster failures

// Log backend configuration on app start
if (DEBUG) {
  console.log('🔧 API Configuration:');
  console.log('  Backend URL:', BACKEND_URL);
  console.log('  API URL:', API_URL);
  console.log('  Timeout:', REQUEST_TIMEOUT_MS, 'ms');
}

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

// Backend health check cache
let backendHealthy: boolean | null = null;
let lastHealthCheck: number = 0;
const HEALTH_CHECK_INTERVAL = 60000; // Check every 60 seconds

/**
 * Check if backend is reachable
 */
async function checkBackendHealth(): Promise<boolean> {
  const now = Date.now();

  // Use cached result if recent
  if (backendHealthy !== null && (now - lastHealthCheck) < HEALTH_CHECK_INTERVAL) {
    return backendHealthy;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    backendHealthy = response.ok;
    lastHealthCheck = now;

    if (DEBUG) {
      console.log('🏥 Backend health check:', backendHealthy ? '✅ Healthy' : '❌ Unhealthy');
    }

    return backendHealthy;
  } catch (error) {
    if (DEBUG) {
      console.error('🏥 Backend health check failed:', error);
    }
    backendHealthy = false;
    lastHealthCheck = now;
    return false;
  }
}

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
 * Check if device has network connectivity
 */
async function checkNetworkConnectivity(): Promise<boolean> {
  try {
    // Try to fetch a lightweight endpoint to verify connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get user-friendly error message based on error type
 */
function getUserFriendlyError(error: any, endpoint: string): string {
  // Network errors
  if (error.message?.includes('Network request failed') || error.message?.includes('Failed to fetch')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // Timeout errors
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return 'Request timed out. Please check your internet connection and try again.';
  }

  // Authentication errors
  if (error.message?.includes('Authentication') || error.message?.includes('Unauthorized')) {
    return 'Your session has expired. Please log in again.';
  }

  // Server errors
  if (error.message?.includes('Server error') || error.message?.includes('500')) {
    return 'The server is experiencing issues. Please try again later.';
  }

  // Not found errors
  if (error.message?.includes('not found') || error.message?.includes('404')) {
    return 'The requested resource was not found.';
  }

  // Backend not reachable
  if (error.message?.includes('ECONNREFUSED') || error.message?.includes('ENOTFOUND')) {
    return 'Cannot reach the server. Please check your internet connection.';
  }

  // Default to original error message if it's user-friendly enough
  if (error.message && error.message.length < 100 && !error.message.includes('prisma')) {
    return error.message;
  }

  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
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

      // Create timeout controller
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

        // Check content type before parsing
        const contentType = response.headers.get('content-type');
        const isJson = contentType?.includes('application/json');

        // Handle non-JSON responses (like HTML error pages)
        if (!isJson) {
          const text = await response.text();
          if (DEBUG) console.error(`❌ Non-JSON response [${endpoint}]:`, text.substring(0, 200));

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Your session has expired. Please log in again.');
            } else if (response.status === 404) {
              throw new Error('The requested resource was not found.');
            } else if (response.status >= 500) {
              throw new Error('The server is experiencing issues. Please try again later.');
            }
            throw new Error('Unable to connect to the server. Please try again.');
          }

          // If it's a successful non-JSON response, return empty success
          return { success: true, data: null as any };
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || 'Request failed');
        }

        return data;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);

        // Handle timeout specifically
        if (fetchError.name === 'AbortError') {
          console.error(`⏱️ Request timeout [${endpoint}]`);
          throw new Error('Request timed out. Please check your internet connection and try again.');
        }

        // Re-throw to be caught by outer catch
        throw fetchError;
      }
    } catch (error: any) {
      console.error(`❌ API Error [${endpoint}]:`, error);

      // Remove from cache immediately on error (don't cache failures)
      pendingRequests.delete(cacheKey);

      // Get user-friendly error message
      const userMessage = getUserFriendlyError(error, endpoint);

      return {
        success: false,
        error: userMessage,
        message: userMessage,
      };
    } finally {
      // Remove from cache after completion (success case)
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

