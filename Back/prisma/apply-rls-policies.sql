-- ============================================================================
-- WorkHQ - Row Level Security (RLS) Policies
-- ============================================================================
-- Run this script in Supabase SQL Editor to secure all tables
-- This ensures users can only access their own data
-- ============================================================================

-- First, ensure RLS is enabled on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Employee" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeaveType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Leave" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeaveBalance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payroll" ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN 
              ('User', 'Employee', 'Location', 'Attendance', 'LeaveType', 'Leave', 'LeaveBalance', 'Payroll'))
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS policy_' || r.tablename || '_select ON "' || r.tablename || '"';
        EXECUTE 'DROP POLICY IF EXISTS policy_' || r.tablename || '_insert ON "' || r.tablename || '"';
        EXECUTE 'DROP POLICY IF EXISTS policy_' || r.tablename || '_update ON "' || r.tablename || '"';
        EXECUTE 'DROP POLICY IF EXISTS policy_' || r.tablename || '_delete ON "' || r.tablename || '"';
    END LOOP;
END $$;

-- ============================================================================
-- USER TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "policy_User_select"
ON "User"
FOR SELECT
TO authenticated
USING (auth.uid()::text = id);

-- Users can update their own profile (fullName and avatarUrl only)
CREATE POLICY "policy_User_update"
ON "User"
FOR UPDATE
TO authenticated
USING (auth.uid()::text = id)
WITH CHECK (
    auth.uid()::text = id AND
    role = (SELECT role FROM "User" WHERE id = auth.uid()::text)  -- Prevent role escalation
);

-- Service role can do everything (INSERT handled by backend during registration)
-- No policy needed - service_role bypasses RLS

-- ============================================================================
-- EMPLOYEE TABLE POLICIES
-- ============================================================================

-- Employees can view their own employee record
CREATE POLICY "policy_Employee_select"
ON "Employee"
FOR SELECT
TO authenticated
USING ("userId" = auth.uid()::text);

-- Only backend (service_role) can INSERT/UPDATE/DELETE employees
-- No policies for these actions = only service_role can do them

-- ============================================================================
-- LOCATION TABLE POLICIES (Office locations)
-- ============================================================================

-- All authenticated users can view office locations
CREATE POLICY "policy_Location_select"
ON "Location"
FOR SELECT
TO authenticated
USING (true);

-- Only backend can manage locations
-- No INSERT/UPDATE/DELETE policies = only service_role can manage

-- ============================================================================
-- ATTENDANCE TABLE POLICIES
-- ============================================================================

-- Employees can view their own attendance records
CREATE POLICY "policy_Attendance_select"
ON "Attendance"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "Attendance"."employeeId"
        AND "Employee"."userId" = auth.uid()::text
    )
);

-- Employees can create their own attendance (check-in/out)
CREATE POLICY "policy_Attendance_insert"
ON "Attendance"
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "employeeId"
        AND "Employee"."userId" = auth.uid()::text
    )
);

-- No UPDATE/DELETE - attendance records are immutable after creation
-- Backend can manage via service_role if needed

-- ============================================================================
-- LEAVETYPE TABLE POLICIES
-- ============================================================================

-- All authenticated users can view leave types
CREATE POLICY "policy_LeaveType_select"
ON "LeaveType"
FOR SELECT
TO authenticated
USING (true);

-- Only backend can manage leave types
-- No INSERT/UPDATE/DELETE policies = only service_role can manage

-- ============================================================================
-- LEAVE TABLE POLICIES (Leave applications)
-- ============================================================================

-- Employees can view their own leave applications
CREATE POLICY "policy_Leave_select"
ON "Leave"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "Leave"."employeeId"
        AND "Employee"."userId" = auth.uid()::text
    )
);

-- Employees can apply for leave (create leave application)
CREATE POLICY "policy_Leave_insert"
ON "Leave"
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "employeeId"
        AND "Employee"."userId" = auth.uid()::text
    )
    AND status = 'PENDING'  -- New applications must be PENDING
);

-- Employees can update their own PENDING leaves only (before approval)
CREATE POLICY "policy_Leave_update"
ON "Leave"
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "Leave"."employeeId"
        AND "Employee"."userId" = auth.uid()::text
    )
    AND status = 'PENDING'  -- Can only update pending leaves
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "employeeId"
        AND "Employee"."userId" = auth.uid()::text
    )
    AND status = 'PENDING'  -- Status must remain PENDING
);

-- Employees can delete their own PENDING leaves
CREATE POLICY "policy_Leave_delete"
ON "Leave"
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "Leave"."employeeId"
        AND "Employee"."userId" = auth.uid()::text
    )
    AND status = 'PENDING'  -- Can only delete pending leaves
);

-- Approval/rejection handled by backend (service_role)

-- ============================================================================
-- LEAVEBALANCE TABLE POLICIES
-- ============================================================================

-- Employees can view their own leave balances
CREATE POLICY "policy_LeaveBalance_select"
ON "LeaveBalance"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "LeaveBalance"."employeeId"
        AND "Employee"."userId" = auth.uid()::text
    )
);

-- Only backend can manage leave balances
-- No INSERT/UPDATE/DELETE policies = only service_role can manage

-- ============================================================================
-- PAYROLL TABLE POLICIES
-- ============================================================================

-- Employees can view their own payroll records
CREATE POLICY "policy_Payroll_select"
ON "Payroll"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "Employee"
        WHERE "Employee".id = "Payroll"."employeeId"
        AND "Employee"."userId" = auth.uid()::text
    )
);

-- Only backend can manage payroll
-- No INSERT/UPDATE/DELETE policies = only service_role can manage

-- ============================================================================
-- GRANT PERMISSIONS TO ROLES
-- ============================================================================

-- Grant SELECT permission to authenticated role for tables where they can read
GRANT SELECT ON "User" TO authenticated;
GRANT SELECT ON "Employee" TO authenticated;
GRANT SELECT ON "Location" TO authenticated;
GRANT SELECT ON "Attendance" TO authenticated;
GRANT SELECT ON "LeaveType" TO authenticated;
GRANT SELECT ON "Leave" TO authenticated;
GRANT SELECT ON "LeaveBalance" TO authenticated;
GRANT SELECT ON "Payroll" TO authenticated;

-- Grant INSERT/UPDATE where needed
GRANT INSERT ON "Attendance" TO authenticated;
GRANT INSERT, UPDATE, DELETE ON "Leave" TO authenticated;
GRANT UPDATE ON "User" TO authenticated;

-- Grant all permissions to service_role (backend)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================================
-- VERIFY RLS CONFIGURATION
-- ============================================================================

-- Check that RLS is enabled on all tables
SELECT 
    tablename AS "Table",
    CASE 
        WHEN rowsecurity THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END AS "RLS Status"
FROM pg_tables
WHERE schemaname = 'public' 
    AND tablename IN ('User', 'Employee', 'Location', 'Attendance', 'LeaveType', 'Leave', 'LeaveBalance', 'Payroll')
ORDER BY tablename;

-- Count policies per table
SELECT 
    schemaname,
    tablename AS "Table",
    COUNT(*) AS "Policy Count"
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ RLS Policies Applied Successfully!';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Security Configuration:';
    RAISE NOTICE '  ✓ RLS enabled on all 8 tables';
    RAISE NOTICE '  ✓ Users can only access their own data';
    RAISE NOTICE '  ✓ Service role has full access (backend)';
    RAISE NOTICE '  ✓ Anonymous access blocked';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Test with: node test-rls.js';
    RAISE NOTICE '  2. Create test user via Supabase Dashboard';
    RAISE NOTICE '  3. Login from mobile app';
    RAISE NOTICE '';
    RAISE NOTICE 'Your database is now secure! 🔒';
    RAISE NOTICE '============================================';
END $$;

SELECT '✅ RLS policies applied successfully!' AS status;

