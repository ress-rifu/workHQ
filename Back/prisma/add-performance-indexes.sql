-- Performance Optimization: Add Indexes to Frequently Queried Fields
-- This will dramatically speed up all database queries

-- User indexes
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "User_email_role_idx" ON "User"("email", "role");

-- Attendance indexes (most frequently queried for today's check-in/out)
CREATE INDEX IF NOT EXISTS "Attendance_employeeId_timestamp_idx" ON "Attendance"("employeeId", "timestamp");
CREATE INDEX IF NOT EXISTS "Attendance_employeeId_type_timestamp_idx" ON "Attendance"("employeeId", "type", "timestamp");

-- Leave indexes (frequently filtered by status and employee)
CREATE INDEX IF NOT EXISTS "Leave_employeeId_status_idx" ON "Leave"("employeeId", "status");
CREATE INDEX IF NOT EXISTS "Leave_status_appliedAt_idx" ON "Leave"("status", "appliedAt");
CREATE INDEX IF NOT EXISTS "Leave_employeeId_startDate_endDate_idx" ON "Leave"("employeeId", "startDate", "endDate");

-- LeaveBalance indexes (lookup by employee and leave type)
CREATE INDEX IF NOT EXISTS "LeaveBalance_employeeId_idx" ON "LeaveBalance"("employeeId");
CREATE INDEX IF NOT EXISTS "LeaveBalance_employeeId_leaveTypeId_idx" ON "LeaveBalance"("employeeId", "leaveTypeId");

-- Payslip indexes (frequently queried by employee, year, month)
CREATE INDEX IF NOT EXISTS "Payslip_employeeId_year_month_idx" ON "Payslip"("employeeId", "year", "month");
CREATE INDEX IF NOT EXISTS "Payslip_status_idx" ON "Payslip"("status");

-- Verify indexes created
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

