-- Check current status and fix salary structures

-- 1. First, let's see what we have
SELECT 'Current Users:' as info;
SELECT id, email, "fullName", role FROM "User";

SELECT 'Current Employees:' as info;
SELECT e.id, e."employeeCode", u.email 
FROM "Employee" e 
JOIN "User" u ON e."userId" = u.id;

SELECT 'Current Salary Structures:' as info;
SELECT ss.id, e."employeeCode", u.email, ss."netSalary"
FROM "SalaryStructure" ss
JOIN "Employee" e ON ss."employeeId" = e.id
JOIN "User" u ON e."userId" = u.id;

-- 2. Create salary structures for ALL employees (force insert)
DELETE FROM "SalaryStructure" WHERE "employeeId" IN (SELECT id FROM "Employee");

INSERT INTO "SalaryStructure" (id, "employeeId", "basicSalary", hra, allowances, deductions, "grossSalary", "netSalary", "effectiveFrom", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    e.id,
    50000.0,
    10000.0,
    5000.0,
    2000.0,
    65000.0,
    63000.0,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Employee" e;

-- 3. Verify it worked
SELECT 'After Fix - Salary Structures:' as info;
SELECT ss.id, e."employeeCode", u.email, ss."basicSalary", ss."netSalary"
FROM "SalaryStructure" ss
JOIN "Employee" e ON ss."employeeId" = e.id
JOIN "User" u ON e."userId" = u.id;

SELECT 'Total Salary Structures Created:' as info, COUNT(*) as count FROM "SalaryStructure";

