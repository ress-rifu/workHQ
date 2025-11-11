-- Add office locations with 200 meters radius

-- Location 1: Bangladesh University of Business and Technology
-- Coordinates: 23°48'42.2"N 90°21'25.0"E
INSERT INTO "Location" (id, name, latitude, longitude, "radiusMeters", "createdAt")
VALUES (
  gen_random_uuid(),
  'Bangladesh University of Business and Technology',
  23.811722,
  90.356944,
  200,
  CURRENT_TIMESTAMP
);

-- Location 2: Office Location
-- Coordinates: 24°00'46.6"N 90°14'50.8"E
INSERT INTO "Location" (id, name, latitude, longitude, "radiusMeters", "createdAt")
VALUES (
  gen_random_uuid(),
  'Office Location',
  24.012944,
  90.247444,
  200,
  CURRENT_TIMESTAMP
);

-- Verify the insertions
SELECT * FROM "Location" WHERE name IN ('Bangladesh University of Business and Technology', 'Office Location');

