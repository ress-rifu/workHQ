-- Fix duplicate index on LeaveBalance table
-- Drop the manually created duplicate index, keep the Prisma-generated one

-- Drop duplicate index
DROP INDEX IF EXISTS idx_leavebalance_employeeId;

-- Verify remaining indexes on LeaveBalance
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'LeaveBalance'
ORDER BY indexname;

