-- Seed initial leave types and balances

-- 1. Create Leave Types
INSERT INTO "LeaveType" (id, name, "maxPerYear", "isPaid")
VALUES 
    (gen_random_uuid(), 'Annual Leave', 20, true),
    (gen_random_uuid(), 'Sick Leave', 10, true),
    (gen_random_uuid(), 'Casual Leave', 12, true),
    (gen_random_uuid(), 'Unpaid Leave', NULL, false)
ON CONFLICT DO NOTHING;

-- 2. Create Leave Balances for all employees
-- Get all employees and assign leave balances
INSERT INTO "LeaveBalance" (id, "employeeId", "leaveTypeId", "balanceDays")
SELECT 
    gen_random_uuid() as id,
    e.id as "employeeId",
    lt.id as "leaveTypeId",
    COALESCE(lt."maxPerYear", 0) as "balanceDays"
FROM "Employee" e
CROSS JOIN "LeaveType" lt
WHERE NOT EXISTS (
    SELECT 1 FROM "LeaveBalance" lb 
    WHERE lb."employeeId" = e.id 
    AND lb."leaveTypeId" = lt.id
);

-- 3. Verify the data
SELECT 'Leave Types Created:' as info, COUNT(*) as count FROM "LeaveType"
UNION ALL
SELECT 'Leave Balances Created:' as info, COUNT(*) as count FROM "LeaveBalance";

-- 4. Show leave balances per employee
SELECT 
    u."fullName" as "Employee",
    e."employeeCode" as "Code",
    lt.name as "Leave Type",
    lb."balanceDays" as "Available Days"
FROM "LeaveBalance" lb
JOIN "Employee" e ON lb."employeeId" = e.id
JOIN "User" u ON e."userId" = u.id
JOIN "LeaveType" lt ON lb."leaveTypeId" = lt.id
ORDER BY u."fullName", lt.name;

