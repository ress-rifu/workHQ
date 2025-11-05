/**
 * Geofencing Utilities
 * Calculate distance between two GPS coordinates using Haversine formula
 */

/**
 * Calculate distance between two points on Earth using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if a point is within a radius of another point
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param officeLat Office latitude
 * @param officeLon Office longitude
 * @param radiusMeters Allowed radius in meters
 * @returns true if user is within radius, false otherwise
 */
export function isWithinRadius(
  userLat: number,
  userLon: number,
  officeLat: number,
  officeLon: number,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(userLat, userLon, officeLat, officeLon);
  return distance <= radiusMeters;
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "150 m" or "1.2 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

