-- ============================================================================
-- WorkHQ - Add Foreign Key Indexes for Performance
-- ============================================================================
-- Fixes "unindexed_foreign_keys" linter warnings
-- Improves query performance for foreign key lookups
-- ============================================================================

-- These indexes significantly improve JOIN performance and foreign key lookups
-- Without them, PostgreSQL has to scan entire tables to find related records

-- ============================================================================
-- ATTENDANCE TABLE INDEXES
-- ============================================================================

-- Index on employeeId (used in JOINs with Employee table)
CREATE INDEX IF NOT EXISTS "idx_attendance_employeeId" 
ON "Attendance"("employeeId");

-- Index on locationId (used in JOINs with Location table)
CREATE INDEX IF NOT EXISTS "idx_attendance_locationId" 
ON "Attendance"("locationId");

-- Additional useful index: timestamp for date range queries
CREATE INDEX IF NOT EXISTS "idx_attendance_timestamp" 
ON "Attendance"("timestamp" DESC);

-- ============================================================================
-- LEAVE TABLE INDEXES
-- ============================================================================

-- Index on employeeId (used in JOINs with Employee table)
CREATE INDEX IF NOT EXISTS "idx_leave_employeeId" 
ON "Leave"("employeeId");

-- Index on leaveTypeId (used in JOINs with LeaveType table)
CREATE INDEX IF NOT EXISTS "idx_leave_leaveTypeId" 
ON "Leave"("leaveTypeId");

-- Additional useful indexes
CREATE INDEX IF NOT EXISTS "idx_leave_status" 
ON "Leave"("status");

CREATE INDEX IF NOT EXISTS "idx_leave_dates" 
ON "Leave"("startDate", "endDate");

-- ============================================================================
-- LEAVEBALANCE TABLE INDEXES
-- ============================================================================

-- Index on employeeId (used in JOINs with Employee table)
CREATE INDEX IF NOT EXISTS "idx_leavebalance_employeeId" 
ON "LeaveBalance"("employeeId");

-- Index on leaveTypeId (used in JOINs with LeaveType table)
CREATE INDEX IF NOT EXISTS "idx_leavebalance_leaveTypeId" 
ON "LeaveBalance"("leaveTypeId");

-- Composite index for common query pattern (employee + leave type)
CREATE INDEX IF NOT EXISTS "idx_leavebalance_employee_type" 
ON "LeaveBalance"("employeeId", "leaveTypeId");

-- ============================================================================
-- PAYROLL TABLE INDEXES
-- ============================================================================

-- Index on employeeId (used in JOINs with Employee table)
CREATE INDEX IF NOT EXISTS "idx_payroll_employeeId" 
ON "Payroll"("employeeId");

-- Additional useful index: salaryMonth for date range queries
CREATE INDEX IF NOT EXISTS "idx_payroll_salaryMonth" 
ON "Payroll"("salaryMonth" DESC);

-- ============================================================================
-- VERIFY INDEXES
-- ============================================================================

-- List all indexes on our tables
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('Attendance', 'Leave', 'LeaveBalance', 'Payroll')
ORDER BY tablename, indexname;

-- Count indexes per table
SELECT 
    tablename AS "Table",
    COUNT(*) AS "Index Count"
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('Attendance', 'Leave', 'LeaveBalance', 'Payroll')
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE '✅ Foreign Key Indexes Created!';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Indexes Added:';
    RAISE NOTICE '  Attendance:';
    RAISE NOTICE '    • idx_attendance_employeeId';
    RAISE NOTICE '    • idx_attendance_locationId';
    RAISE NOTICE '    • idx_attendance_timestamp';
    RAISE NOTICE '';
    RAISE NOTICE '  Leave:';
    RAISE NOTICE '    • idx_leave_employeeId';
    RAISE NOTICE '    • idx_leave_leaveTypeId';
    RAISE NOTICE '    • idx_leave_status';
    RAISE NOTICE '    • idx_leave_dates';
    RAISE NOTICE '';
    RAISE NOTICE '  LeaveBalance:';
    RAISE NOTICE '    • idx_leavebalance_employeeId';
    RAISE NOTICE '    • idx_leavebalance_leaveTypeId';
    RAISE NOTICE '    • idx_leavebalance_employee_type';
    RAISE NOTICE '';
    RAISE NOTICE '  Payroll:';
    RAISE NOTICE '    • idx_payroll_employeeId';
    RAISE NOTICE '    • idx_payroll_salaryMonth';
    RAISE NOTICE '';
    RAISE NOTICE 'Performance Benefits:';
    RAISE NOTICE '  ✓ Faster JOIN operations';
    RAISE NOTICE '  ✓ Faster foreign key lookups';
    RAISE NOTICE '  ✓ Optimized date range queries';
    RAISE NOTICE '  ✓ Better query planning';
    RAISE NOTICE '';
    RAISE NOTICE 'Verification:';
    RAISE NOTICE '  1. Check Supabase Linter';
    RAISE NOTICE '  2. Should have NO foreign key warnings';
    RAISE NOTICE '  3. Database is fully optimized!';
    RAISE NOTICE '';
    RAISE NOTICE 'Your database is now production-ready! 🚀';
    RAISE NOTICE '================================================';
END $$;

SELECT '✅ All foreign key indexes created!' AS status;

