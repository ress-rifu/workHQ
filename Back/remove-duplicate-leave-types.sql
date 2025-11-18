-- Remove Duplicate Leave Type Rows
-- This script identifies and removes duplicate LeaveType records based on the 'name' field
-- It keeps the oldest record (earliest created) for each unique name

BEGIN;

-- Step 1: Show duplicates before deletion
SELECT 
    'Duplicate Leave Types Found:' as info,
    name,
    COUNT(*) as count
FROM "LeaveType"
GROUP BY name
HAVING COUNT(*) > 1;

-- Step 2: Update foreign key references in Leave table
-- Point all references to the oldest LeaveType record for each name
UPDATE "Leave"
SET "leaveTypeId" = subq.keep_id
FROM (
    SELECT DISTINCT ON (name)
        name,
        id as keep_id
    FROM "LeaveType"
    ORDER BY name, id
) subq
WHERE "Leave"."leaveTypeId" IN (
    SELECT id 
    FROM "LeaveType" lt2
    WHERE lt2.name = subq.name
    AND lt2.id != subq.keep_id
);

-- Step 3: Update foreign key references in LeaveBalance table
UPDATE "LeaveBalance"
SET "leaveTypeId" = subq.keep_id
FROM (
    SELECT DISTINCT ON (name)
        name,
        id as keep_id
    FROM "LeaveType"
    ORDER BY name, id
) subq
WHERE "LeaveBalance"."leaveTypeId" IN (
    SELECT id 
    FROM "LeaveType" lt2
    WHERE lt2.name = subq.name
    AND lt2.id != subq.keep_id
);

-- Step 4: Delete duplicate LeaveType records (keep only the oldest for each name)
DELETE FROM "LeaveType"
WHERE id NOT IN (
    SELECT DISTINCT ON (name) id
    FROM "LeaveType"
    ORDER BY name, id
);

-- Step 5: Verify results
SELECT 
    'Leave Types After Cleanup:' as info,
    COUNT(*) as total_count
FROM "LeaveType";

SELECT 
    'Remaining Leave Types:' as info,
    name,
    "maxPerYear",
    "isPaid",
    id
FROM "LeaveType"
ORDER BY name;

-- Step 6: Verify no duplicates remain
SELECT 
    'Remaining Duplicates:' as info,
    name,
    COUNT(*) as count
FROM "LeaveType"
GROUP BY name
HAVING COUNT(*) > 1;

COMMIT;

-- Optional: Add a unique constraint to prevent future duplicates
-- Uncomment the following line if you want to enforce uniqueness on the name field:
-- ALTER TABLE "LeaveType" ADD CONSTRAINT "LeaveType_name_unique" UNIQUE (name);
