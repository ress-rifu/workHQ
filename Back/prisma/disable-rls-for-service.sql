-- Disable RLS for Service Role Access
-- This allows the backend (using service_role key) to bypass RLS
-- Run this in Supabase SQL Editor after creating tables

-- The service_role has bypassrls permission by default, but we need to grant it access to tables
-- Grant full access to service_role for all tables

GRANT ALL ON "User" TO service_role;
GRANT ALL ON "Employee" TO service_role;
GRANT ALL ON "Location" TO service_role;
GRANT ALL ON "Attendance" TO service_role;
GRANT ALL ON "LeaveType" TO service_role;
GRANT ALL ON "Leave" TO service_role;
GRANT ALL ON "LeaveBalance" TO service_role;
GRANT ALL ON "Payroll" TO service_role;

-- Grant usage on sequences if any are created
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Alternative: If you want to completely disable RLS for backend access
-- (RLS will still protect direct API access, but backend service_role bypasses it)

-- The service_role already has bypassrls privilege, so backend should work
-- But if you're having issues, you can explicitly set it:

ALTER TABLE "User" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Employee" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Location" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" FORCE ROW LEVEL SECURITY;
ALTER TABLE "LeaveType" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Leave" FORCE ROW LEVEL SECURITY;
ALTER TABLE "LeaveBalance" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Payroll" FORCE ROW LEVEL SECURITY;

-- Create RLS policies for service_role (bypass all restrictions)
-- This is usually not needed as service_role has bypassrls by default

-- For authenticated users (anon/authenticated roles), create policies
-- Example policy for User table (authenticated users can read their own data)
CREATE POLICY "Users can view own profile"
  ON "User"
  FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON "User"
  FOR UPDATE
  USING (auth.uid()::text = id);

-- Example policy for Employee table
CREATE POLICY "Employees can view own data"
  ON "Employee"
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- For other tables, you can create similar policies based on your needs
-- The service_role (used by backend) will bypass all these policies

SELECT 'RLS configured for service role!' as status;

