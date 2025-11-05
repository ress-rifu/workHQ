-- WorkHQ Row Level Security (RLS) Policies
-- Run this after creating tables to secure your data

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Employee" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeaveType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Leave" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LeaveBalance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payroll" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON "User";
DROP POLICY IF EXISTS "Users can update own profile" ON "User";
DROP POLICY IF EXISTS "Employees can view own data" ON "Employee";
DROP POLICY IF EXISTS "Employees can view own attendance" ON "Attendance";
DROP POLICY IF EXISTS "Employees can create own attendance" ON "Attendance";
DROP POLICY IF EXISTS "Everyone can view leave types" ON "LeaveType";
DROP POLICY IF EXISTS "Employees can view own leaves" ON "Leave";
DROP POLICY IF EXISTS "Employees can create own leaves" ON "Leave";
DROP POLICY IF EXISTS "Employees can view own leave balance" ON "LeaveBalance";
DROP POLICY IF EXISTS "Employees can view own payroll" ON "Payroll";
DROP POLICY IF EXISTS "Everyone can view locations" ON "Location";

-- =============================================================================
-- USER TABLE POLICIES
-- =============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON "User"
  FOR SELECT
  USING (auth.uid()::text = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON "User"
  FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- =============================================================================
-- EMPLOYEE TABLE POLICIES
-- =============================================================================

-- Employees can view their own employee data
CREATE POLICY "Employees can view own data"
  ON "Employee"
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- =============================================================================
-- LOCATION TABLE POLICIES
-- =============================================================================

-- Everyone (authenticated) can view office locations
CREATE POLICY "Everyone can view locations"
  ON "Location"
  FOR SELECT
  TO authenticated
  USING (true);

-- =============================================================================
-- ATTENDANCE TABLE POLICIES
-- =============================================================================

-- Employees can view their own attendance records
CREATE POLICY "Employees can view own attendance"
  ON "Attendance"
  FOR SELECT
  USING (
    auth.uid()::text IN (
      SELECT "userId" FROM "Employee" WHERE id = "employeeId"
    )
  );

-- Employees can create their own attendance records
CREATE POLICY "Employees can create own attendance"
  ON "Attendance"
  FOR INSERT
  WITH CHECK (
    auth.uid()::text IN (
      SELECT "userId" FROM "Employee" WHERE id = "employeeId"
    )
  );

-- =============================================================================
-- LEAVE TYPE TABLE POLICIES
-- =============================================================================

-- Everyone (authenticated) can view leave types
CREATE POLICY "Everyone can view leave types"
  ON "LeaveType"
  FOR SELECT
  TO authenticated
  USING (true);

-- =============================================================================
-- LEAVE TABLE POLICIES
-- =============================================================================

-- Employees can view their own leave applications
CREATE POLICY "Employees can view own leaves"
  ON "Leave"
  FOR SELECT
  USING (
    auth.uid()::text IN (
      SELECT "userId" FROM "Employee" WHERE id = "employeeId"
    )
  );

-- Employees can create their own leave applications
CREATE POLICY "Employees can create own leaves"
  ON "Leave"
  FOR INSERT
  WITH CHECK (
    auth.uid()::text IN (
      SELECT "userId" FROM "Employee" WHERE id = "employeeId"
    )
  );

-- =============================================================================
-- LEAVE BALANCE TABLE POLICIES
-- =============================================================================

-- Employees can view their own leave balances
CREATE POLICY "Employees can view own leave balance"
  ON "LeaveBalance"
  FOR SELECT
  USING (
    auth.uid()::text IN (
      SELECT "userId" FROM "Employee" WHERE id = "employeeId"
    )
  );

-- =============================================================================
-- PAYROLL TABLE POLICIES
-- =============================================================================

-- Employees can view their own payroll
CREATE POLICY "Employees can view own payroll"
  ON "Payroll"
  FOR SELECT
  USING (
    auth.uid()::text IN (
      SELECT "userId" FROM "Employee" WHERE id = "employeeId"
    )
  );

-- =============================================================================
-- GRANT PERMISSIONS TO SERVICE ROLE (Backend)
-- =============================================================================

-- The service_role already has bypassrls permission
-- But let's explicitly grant permissions for clarity
GRANT ALL ON "User" TO service_role;
GRANT ALL ON "Employee" TO service_role;
GRANT ALL ON "Location" TO service_role;
GRANT ALL ON "Attendance" TO service_role;
GRANT ALL ON "LeaveType" TO service_role;
GRANT ALL ON "Leave" TO service_role;
GRANT ALL ON "LeaveBalance" TO service_role;
GRANT ALL ON "Payroll" TO service_role;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant to authenticated role (for direct client queries - optional)
GRANT SELECT, INSERT, UPDATE ON "User" TO authenticated;
GRANT SELECT ON "Employee" TO authenticated;
GRANT SELECT ON "Location" TO authenticated;
GRANT SELECT, INSERT ON "Attendance" TO authenticated;
GRANT SELECT ON "LeaveType" TO authenticated;
GRANT SELECT, INSERT, UPDATE ON "Leave" TO authenticated;
GRANT SELECT ON "LeaveBalance" TO authenticated;
GRANT SELECT ON "Payroll" TO authenticated;

-- =============================================================================
-- VERIFY RLS IS ENABLED
-- =============================================================================

SELECT 
  schemaname, 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('User', 'Employee', 'Location', 'Attendance', 'LeaveType', 'Leave', 'LeaveBalance', 'Payroll')
ORDER BY tablename;

-- Success message
SELECT '✅ RLS policies configured successfully!' as status;

