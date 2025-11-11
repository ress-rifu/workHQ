/**
 * HTTP Cache Headers Middleware
 * Adds appropriate cache headers to API responses
 */

import { Request, Response, NextFunction } from 'express';

interface CacheConfig {
  maxAge?: number;
  sMaxAge?: number;
  staleWhileRevalidate?: number;
  public?: boolean;
  noStore?: boolean;
}

/**
 * Create cache control middleware
 * @param config Cache configuration
 */
export function cacheControl(config: CacheConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (config.noStore) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      return next();
    }

    const directives: string[] = [];

    if (config.public) {
      directives.push('public');
    } else {
      directives.push('private');
    }

    if (config.maxAge !== undefined) {
      directives.push(`max-age=${config.maxAge}`);
    }

    if (config.sMaxAge !== undefined) {
      directives.push(`s-maxage=${config.sMaxAge}`);
    }

    if (config.staleWhileRevalidate !== undefined) {
      directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
    }

    res.setHeader('Cache-Control', directives.join(', '));
    next();
  };
}

// Predefined cache configurations
export const cachePresets = {
  // No caching - for sensitive or frequently changing data
  noCache: cacheControl({ noStore: true }),

  // 30 seconds - for real-time data
  short: cacheControl({ maxAge: 30, staleWhileRevalidate: 60 }),

  // 5 minutes - for normal data
  medium: cacheControl({ maxAge: 300, staleWhileRevalidate: 600 }),

  // 15 minutes - for rarely changing data
  long: cacheControl({ maxAge: 900, staleWhileRevalidate: 1800 }),

  // 1 hour - for static data
  veryLong: cacheControl({ maxAge: 3600, staleWhileRevalidate: 7200, public: true }),
};

