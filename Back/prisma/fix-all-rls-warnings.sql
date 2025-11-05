-- ============================================================================
-- WorkHQ - Fix ALL RLS Warnings (Clean Version)
-- ============================================================================
-- This script completely removes old policies and creates optimized ones
-- Fixes both auth_rls_initplan AND multiple_permissive_policies warnings
-- ============================================================================

-- Step 1: Drop ALL existing policies completely
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies from all our tables
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename IN ('User', 'Employee', 'Location', 'Attendance', 'LeaveType', 'Leave', 'LeaveBalance', 'Payroll')
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
    
    RAISE NOTICE 'All existing policies dropped';
END $$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Employee" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeaveType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Leave" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeaveBalance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payroll" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USER TABLE - Optimized Policies
-- ============================================================================

CREATE POLICY "user_select_own"
ON "User"
FOR SELECT
TO authenticated
USING ((SELECT auth.uid())::text = id);

CREATE POLICY "user_update_own"
ON "User"
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid())::text = id)
WITH CHECK (
    (SELECT auth.uid())::text = id AND
    role = (SELECT role FROM "User" WHERE id = (SELECT auth.uid())::text)
);

-- ============================================================================
-- EMPLOYEE TABLE - Optimized Policies
-- ============================================================================

CREATE POLICY "employee_select_own"
ON "Employee"
FOR SELECT
TO authenticated
USING ("userId" = (SELECT auth.uid())::text);

-- ============================================================================
-- LOCATION TABLE - Optimized Policies
-- ============================================================================

CREATE POLICY "location_select_all"
ON "Location"
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- ATTENDANCE TABLE - Optimized Policies
-- ============================================================================

CREATE POLICY "attendance_select_own"
ON "Attendance"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "Attendance"."employeeId"
        AND "Employee"."userId" = (SELECT auth.uid())::text
    )
);

CREATE POLICY "attendance_insert_own"
ON "Attendance"
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "employeeId"
        AND "Employee"."userId" = (SELECT auth.uid())::text
    )
);

-- ============================================================================
-- LEAVETYPE TABLE - Optimized Policies
-- ============================================================================

CREATE POLICY "leavetype_select_all"
ON "LeaveType"
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- LEAVE TABLE - Optimized Policies
-- ============================================================================

CREATE POLICY "leave_select_own"
ON "Leave"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "Leave"."employeeId"
        AND "Employee"."userId" = (SELECT auth.uid())::text
    )
);

CREATE POLICY "leave_insert_own"
ON "Leave"
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "employeeId"
        AND "Employee"."userId" = (SELECT auth.uid())::text
    )
    AND status = 'PENDING'
);

CREATE POLICY "leave_update_own_pending"
ON "Leave"
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "Leave"."employeeId"
        AND "Employee"."userId" = (SELECT auth.uid())::text
    )
    AND status = 'PENDING'
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "employeeId"
        AND "Employee"."userId" = (SELECT auth.uid())::text
    )
    AND status = 'PENDING'
);

CREATE POLICY "leave_delete_own_pending"
ON "Leave"
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "Leave"."employeeId"
        AND "Employee"."userId" = (SELECT auth.uid())::text
    )
    AND status = 'PENDING'
);

-- ============================================================================
-- LEAVEBALANCE TABLE - Optimized Policies
-- ============================================================================

CREATE POLICY "leavebalance_select_own"
ON "LeaveBalance"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "LeaveBalance"."employeeId"
        AND "Employee"."userId" = (SELECT auth.uid())::text
    )
);

-- ============================================================================
-- PAYROLL TABLE - Optimized Policies
-- ============================================================================

CREATE POLICY "payroll_select_own"
ON "Payroll"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "Payroll"."employeeId"
        AND "Employee"."userId" = (SELECT auth.uid())::text
    )
);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON "User" TO authenticated;
GRANT SELECT ON "Employee" TO authenticated;
GRANT SELECT ON "Location" TO authenticated;
GRANT SELECT ON "Attendance" TO authenticated;
GRANT SELECT ON "LeaveType" TO authenticated;
GRANT SELECT ON "Leave" TO authenticated;
GRANT SELECT ON "LeaveBalance" TO authenticated;
GRANT SELECT ON "Payroll" TO authenticated;

GRANT INSERT ON "Attendance" TO authenticated;
GRANT INSERT, UPDATE, DELETE ON "Leave" TO authenticated;
GRANT UPDATE ON "User" TO authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check RLS status
SELECT 
    tablename AS "Table",
    CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END AS "RLS"
FROM pg_tables
WHERE schemaname = 'public' 
    AND tablename IN ('User', 'Employee', 'Location', 'Attendance', 'LeaveType', 'Leave', 'LeaveBalance', 'Payroll')
ORDER BY tablename;

-- Count policies (should be exactly 1 per action per table)
SELECT 
    tablename AS "Table",
    COUNT(*) AS "Policies"
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('User', 'Employee', 'Location', 'Attendance', 'LeaveType', 'Leave', 'LeaveBalance', 'Payroll')
GROUP BY tablename
ORDER BY tablename;

-- List all policies
SELECT 
    tablename AS "Table",
    policyname AS "Policy",
    cmd AS "Action"
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('User', 'Employee', 'Location', 'Attendance', 'LeaveType', 'Leave', 'LeaveBalance', 'Payroll')
ORDER BY tablename, cmd, policyname;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE '✅ ALL RLS WARNINGS FIXED!';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Fixed Issues:';
    RAISE NOTICE '  ✓ auth_rls_initplan - Using (SELECT auth.uid())';
    RAISE NOTICE '  ✓ multiple_permissive_policies - One policy per action';
    RAISE NOTICE '';
    RAISE NOTICE 'Policy Summary:';
    RAISE NOTICE '  • User: 2 policies (SELECT, UPDATE)';
    RAISE NOTICE '  • Employee: 1 policy (SELECT)';
    RAISE NOTICE '  • Location: 1 policy (SELECT)';
    RAISE NOTICE '  • Attendance: 2 policies (SELECT, INSERT)';
    RAISE NOTICE '  • LeaveType: 1 policy (SELECT)';
    RAISE NOTICE '  • Leave: 4 policies (SELECT, INSERT, UPDATE, DELETE)';
    RAISE NOTICE '  • LeaveBalance: 1 policy (SELECT)';
    RAISE NOTICE '  • Payroll: 1 policy (SELECT)';
    RAISE NOTICE '  Total: 13 policies';
    RAISE NOTICE '';
    RAISE NOTICE 'Verification:';
    RAISE NOTICE '  1. Check Supabase Linter - Should be CLEAN ✓';
    RAISE NOTICE '  2. Run: node test-rls.js';
    RAISE NOTICE '  3. Test from mobile app';
    RAISE NOTICE '';
    RAISE NOTICE 'All warnings should be GONE! 🎉';
    RAISE NOTICE '================================================';
END $$;

SELECT '✅ All RLS warnings fixed! Check Supabase Linter.' AS status;

