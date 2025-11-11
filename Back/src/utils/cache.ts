/**
 * In-Memory Cache Utility
 * Fast caching for frequently accessed data
 */

interface CacheEntry {
  data: any;
  expiry: number;
}

class Cache {
  private cache: Map<string, CacheEntry>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Set cache entry with TTL (time to live in seconds)
   */
  set(key: string, data: any, ttl: number = 300): void {
    const expiry = Date.now() + ttl * 1000;
    this.cache.set(key, { data, expiry });
  }

  /**
   * Get cache entry if not expired
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear cache entries by pattern
   */
  clearByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const cache = new Cache();

// Clear expired entries every 5 minutes
setInterval(() => {
  cache.clearExpired();
}, 5 * 60 * 1000);

// Cache key generators
export const cacheKeys = {
  userProfile: (userId: string) => `user:profile:${userId}`,
  employeeStats: (employeeId: string) => `employee:stats:${employeeId}`,
  leaveTypes: () => 'leave:types',
  leaveBalances: (employeeId: string) => `leave:balances:${employeeId}`,
  officeLocations: () => 'attendance:locations',
  todayAttendance: (employeeId: string) => `attendance:today:${employeeId}`,
  salaryStructure: (employeeId: string) => `payroll:salary:${employeeId}`,
  payslips: (employeeId: string, month?: number, year?: number) => 
    `payroll:payslips:${employeeId}:${month || 'all'}:${year || 'all'}`,
  hrEmployees: () => 'hr:employees',
  hrLeaveRequests: (status?: string) => `hr:leave:requests:${status || 'all'}`,
};

// Cache TTL (time to live) in seconds
export const cacheTTL = {
  short: 60,        // 1 minute - for frequently changing data
  medium: 300,      // 5 minutes - for normal data
  long: 900,        // 15 minutes - for rarely changing data
  veryLong: 3600,   // 1 hour - for static data
};

