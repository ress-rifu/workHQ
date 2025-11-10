-- Create Payroll related tables

-- 1. Create SalaryStructure table
CREATE TABLE IF NOT EXISTS "SalaryStructure" (
    id TEXT PRIMARY KEY,
    "employeeId" TEXT UNIQUE NOT NULL,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    hra DOUBLE PRECISION DEFAULT 0,
    allowances DOUBLE PRECISION DEFAULT 0,
    deductions DOUBLE PRECISION DEFAULT 0,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalaryStructure_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 2. Create Payslip table
CREATE TABLE IF NOT EXISTS "Payslip" (
    id TEXT PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    hra DOUBLE PRECISION NOT NULL,
    allowances DOUBLE PRECISION NOT NULL,
    deductions DOUBLE PRECISION NOT NULL,
    "grossSalary" DOUBLE PRECISION NOT NULL,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "workingDays" INTEGER NOT NULL,
    "presentDays" INTEGER NOT NULL,
    "leaveDays" INTEGER NOT NULL,
    "fileUrl" TEXT,
    status TEXT DEFAULT 'GENERATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payslip_employeeId_month_year_key" UNIQUE ("employeeId", month, year)
);

-- 3. Create triggers for updatedAt
DROP TRIGGER IF EXISTS update_salary_structure_updated_at ON "SalaryStructure";
CREATE TRIGGER update_salary_structure_updated_at
BEFORE UPDATE ON "SalaryStructure"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payslip_updated_at ON "Payslip";
CREATE TRIGGER update_payslip_updated_at
BEFORE UPDATE ON "Payslip"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 4. Seed initial salary structures for all employees
INSERT INTO "SalaryStructure" (id, "employeeId", "basicSalary", hra, allowances, deductions, "grossSalary", "netSalary", "effectiveFrom")
SELECT 
    gen_random_uuid(),
    e.id,
    50000.0 as "basicSalary",
    10000.0 as hra,
    5000.0 as allowances,
    2000.0 as deductions,
    65000.0 as "grossSalary",
    63000.0 as "netSalary",
    CURRENT_TIMESTAMP as "effectiveFrom"
FROM "Employee" e
WHERE NOT EXISTS (
    SELECT 1 FROM "SalaryStructure" ss WHERE ss."employeeId" = e.id
);

-- 5. Verify tables created
SELECT 'Tables Created Successfully!' as message;
SELECT 'Salary Structures:' as info, COUNT(*) as count FROM "SalaryStructure"
UNION ALL
SELECT 'Payslips:' as info, COUNT(*) as count FROM "Payslip";

-- 6. Show salary structures
SELECT 
    u."fullName" as "Employee",
    e."employeeCode" as "Code",
    ss."basicSalary" as "Basic",
    ss.hra as "HRA",
    ss.allowances as "Allowances",
    ss.deductions as "Deductions",
    ss."netSalary" as "Net Salary"
FROM "SalaryStructure" ss
JOIN "Employee" e ON ss."employeeId" = e.id
JOIN "User" u ON e."userId" = u.id
ORDER BY u."fullName";

