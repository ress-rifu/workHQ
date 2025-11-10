-- Update Employee salary column to match their SalaryStructure

-- First, let's see current state
SELECT 'Current Employees:' as info;
SELECT e.id, e."employeeCode", e.salary, u.email
FROM "Employee" e
JOIN "User" u ON e."userId" = u.id;

-- Update all employees with salary from SalaryStructure
UPDATE "Employee" e
SET salary = ss."grossSalary"
FROM "SalaryStructure" ss
WHERE e.id = ss."employeeId";

-- If no SalaryStructure, set a default salary
UPDATE "Employee" 
SET salary = 65000.0
WHERE salary IS NULL OR salary = 0;

-- Verify the update
SELECT 'After Update:' as result;
SELECT e.id, e."employeeCode", e.salary, u.email
FROM "Employee" e
JOIN "User" u ON e."userId" = u.id;

