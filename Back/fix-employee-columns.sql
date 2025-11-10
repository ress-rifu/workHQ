-- Add missing createdAt and updatedAt columns to Employee table
ALTER TABLE "Employee" 
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create a trigger to auto-update updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_employee_updated_at ON "Employee";

-- Create trigger for Employee table
CREATE TRIGGER update_employee_updated_at
BEFORE UPDATE ON "Employee"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

