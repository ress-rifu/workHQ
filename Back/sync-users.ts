import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface UserMapping {
  email: string;
  fullName: string;
  role: Role;
  employeeCode: string;
  department: string;
  designation: string;
  salary: number;
}

const userMappings: UserMapping[] = [
  {
    email: 'admin@workhq.com',
    fullName: 'Admin User',
    role: Role.ADMIN,
    employeeCode: 'EMP001',
    department: 'Administration',
    designation: 'System Administrator',
    salary: 100000
  },
  {
    email: 'hr@workhq.com',
    fullName: 'HR Manager',
    role: Role.HR,
    employeeCode: 'EMP002',
    department: 'Human Resources',
    designation: 'HR Manager',
    salary: 80000
  },
  {
    email: 'employee@workhq.com',
    fullName: 'John Employee',
    role: Role.EMPLOYEE,
    employeeCode: 'EMP003',
    department: 'Engineering',
    designation: 'Software Developer',
    salary: 60000
  }
];

async function syncUsersToDatabase() {
  console.log('🔄 Syncing Supabase users to database...\n');

  // Get all users from Supabase
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('❌ Error fetching users:', error);
    return;
  }

  console.log(`Found ${users.length} users in Supabase\n`);

  for (const mapping of userMappings) {
    try {
      // Find the Supabase user
      const supabaseUser = users.find(u => u.email === mapping.email);
      
      if (!supabaseUser) {
        console.log(`⚠️  User not found in Supabase: ${mapping.email}`);
        continue;
      }

      console.log(`Processing: ${mapping.email}...`);

      // Check if user exists in database
      const existingUser = await prisma.user.findUnique({
        where: { id: supabaseUser.id }
      });

      if (existingUser) {
        console.log(`  ⚠️  User already exists in database: ${supabaseUser.id}`);
        
        // Check if employee exists
        const existingEmployee = await prisma.employee.findUnique({
          where: { userId: supabaseUser.id }
        });

        if (!existingEmployee) {
          // Create employee record
          const employee = await prisma.employee.create({
            data: {
              userId: supabaseUser.id,
              employeeCode: mapping.employeeCode,
              department: mapping.department,
              designation: mapping.designation,
              joinDate: new Date(),
              salary: mapping.salary
            }
          });
          console.log(`  ✅ Employee record created: ${employee.employeeCode}`);
        } else {
          console.log(`  ✅ Employee already exists: ${existingEmployee.employeeCode}`);
        }
        console.log('');
        continue;
      }

      // Create user in database
      const user = await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: mapping.email,
          fullName: mapping.fullName,
          role: mapping.role,
          avatarUrl: null
        }
      });

      console.log(`  ✅ Database user created: ${user.id}`);

      // Create employee record
      const employee = await prisma.employee.create({
        data: {
          userId: user.id,
          employeeCode: mapping.employeeCode,
          department: mapping.department,
          designation: mapping.designation,
          joinDate: new Date(),
          salary: mapping.salary
        }
      });

      console.log(`  ✅ Employee record created: ${employee.employeeCode}`);
      console.log('');

    } catch (error: any) {
      console.error(`❌ Error processing ${mapping.email}:`, error.message);
      console.log('');
    }
  }

  console.log('✅ Sync completed!\n');
  console.log('📋 Login credentials:');
  console.log('Admin:    admin@workhq.com    / admin123');
  console.log('HR:       hr@workhq.com       / hr123');
  console.log('Employee: employee@workhq.com / emp123');
}

syncUsersToDatabase()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
