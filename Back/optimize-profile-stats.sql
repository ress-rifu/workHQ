-- Optimize profile stats queries by adding indexes
-- Run this on your Supabase database to improve performance

-- Index for employee lookups by userId
CREATE INDEX IF NOT EXISTS idx_employee_user_id ON "Employee"("userId");

-- Index for leave balance lookups by employeeId
CREATE INDEX IF NOT EXISTS idx_leave_balance_employee ON "LeaveBalance"("employeeId");

-- Index for attendance queries (employeeId + timestamp + type)
CREATE INDEX IF NOT EXISTS idx_attendance_employee_time_type 
ON "Attendance"("employeeId", "timestamp" DESC, "type");

-- Index for pending leaves count
CREATE INDEX IF NOT EXISTS idx_leave_employee_status ON "Leave"("employeeId", "status");

-- Analyze tables to update statistics
ANALYZE "Employee";
ANALYZE "LeaveBalance";
ANALYZE "Attendance";
ANALYZE "Leave";

