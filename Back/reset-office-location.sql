-- Delete all existing office locations
DELETE FROM "Location";

-- Add new office location with larger radius
-- Coordinates: 24°00'46.7"N 90°14'50.7"E
-- Converted: Latitude 24.012972°, Longitude 90.247417°
-- Using 500m radius to account for GPS accuracy variations
INSERT INTO "Location" (id, name, latitude, longitude, "radiusMeters", "createdAt")
VALUES (
  gen_random_uuid(),
  'Office Location',
  24.012972,
  90.247417,
  500,
  CURRENT_TIMESTAMP
);

-- Verify the insertion
SELECT 
  id,
  name,
  latitude,
  longitude,
  "radiusMeters",
  "createdAt"
FROM "Location";

-- Show decimal degrees for verification
SELECT 
  name,
  CONCAT(latitude, '°N') as latitude_display,
  CONCAT(longitude, '°E') as longitude_display,
  CONCAT(radiusMeters, 'm') as radius_display
FROM "Location";

