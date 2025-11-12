-- Check all office locations in the database
SELECT 
  id,
  name,
  latitude,
  longitude,
  "radiusMeters" as radius_meters,
  "createdAt" as created_at,
  -- Convert back to DMS format for easy verification
  CONCAT(
    FLOOR(latitude)::text, '°',
    FLOOR((latitude - FLOOR(latitude)) * 60)::text, '''',
    ROUND(((latitude - FLOOR(latitude)) * 60 - FLOOR((latitude - FLOOR(latitude)) * 60)) * 60, 1)::text, '"N'
  ) as latitude_dms,
  CONCAT(
    FLOOR(longitude)::text, '°',
    FLOOR((longitude - FLOOR(longitude)) * 60)::text, '''',
    ROUND(((longitude - FLOOR(longitude)) * 60 - FLOOR((longitude - FLOOR(longitude)) * 60)) * 60, 1)::text, '"E'
  ) as longitude_dms
FROM "Location"
ORDER BY "createdAt" DESC;

-- Count total locations
SELECT COUNT(*) as total_locations FROM "Location";

