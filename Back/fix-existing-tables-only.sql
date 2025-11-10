-- Fix missing columns in EXISTING tables only

-- 1. Fix Employee table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Employee') THEN
        ALTER TABLE "Employee" 
        ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Employee table updated';
    END IF;
END $$;

-- 2. Fix Leave table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Leave') THEN
        ALTER TABLE "Leave" 
        ADD COLUMN IF NOT EXISTS "remarks" TEXT,
        ADD COLUMN IF NOT EXISTS "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "decidedBy" TEXT,
        ADD COLUMN IF NOT EXISTS "decidedAt" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Leave table updated';
    END IF;
END $$;

-- 3. Fix User table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'User') THEN
        ALTER TABLE "User" 
        ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'User table updated';
    END IF;
END $$;

-- 4. Fix Location table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Location') THEN
        ALTER TABLE "Location" 
        ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Location table updated';
    END IF;
END $$;

-- 5. Fix Attendance table
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Attendance') THEN
        ALTER TABLE "Attendance" 
        ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Attendance table updated';
    END IF;
END $$;

-- 6. Create updatedAt trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Create triggers only for existing tables
DO $$
BEGIN
    -- User table trigger
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'User') THEN
        DROP TRIGGER IF EXISTS update_user_updated_at ON "User";
        CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Employee table trigger
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Employee') THEN
        DROP TRIGGER IF EXISTS update_employee_updated_at ON "Employee";
        CREATE TRIGGER update_employee_updated_at BEFORE UPDATE ON "Employee"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- Leave table trigger
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Leave') THEN
        DROP TRIGGER IF EXISTS update_leave_updated_at ON "Leave";
        CREATE TRIGGER update_leave_updated_at BEFORE UPDATE ON "Leave"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

SELECT 'Successfully updated all existing tables!' as result;

