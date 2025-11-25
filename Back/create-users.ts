import { supabaseAdmin } from './src/utils/supabase';
import prisma from './src/utils/prisma';
import { Role } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  role: Role;
  employeeCode?: string;
  department?: string;
  designation?: string;
}

const users: CreateUserData[] = [
  {
    email: 'admin@workhq.com',
    password: 'Admin@123',
    fullName: 'Admin User',
    role: Role.ADMIN,
    employeeCode: 'ADMIN001',
    department: 'Management',
    designation: 'System Administrator'
  },
  {
    email: 'hr@workhq.com',
    password: 'Hr@123',
    fullName: 'HR Manager',
    role: Role.HR,
    employeeCode: 'HR001',
    department: 'Human Resources',
    designation: 'HR Manager'
  },
  {
    email: 'employee@workhq.com',
    password: 'Employee@123',
    fullName: 'John Employee',
    role: Role.EMPLOYEE,
    employeeCode: 'EMP001',
    department: 'Engineering',
    designation: 'Software Developer'
  }
];

async function createUser(userData: CreateUserData) {
  try {
    console.log(`\n📝 Creating user: ${userData.email}...`);

    // Check if user already exists in Supabase Auth
    const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingAuthUser.users.find(u => u.email === userData.email);

    if (userExists) {
      console.log(`⚠️  User ${userData.email} already exists in Supabase Auth. Deleting...`);
      await supabaseAdmin.auth.admin.deleteUser(userExists.id);
      console.log(`✅ Deleted existing auth user`);
    }

    // Check if user exists in database (with timeout)
    try {
      const existingDbUser = await Promise.race([
        prisma.user.findUnique({
          where: { email: userData.email }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 5000)
        )
      ]) as any;

      if (existingDbUser) {
        console.log(`⚠️  User ${userData.email} already exists in database. Deleting...`);
        await prisma.user.delete({
          where: { id: existingDbUser.id }
        });
        console.log(`✅ Deleted existing database user`);
      }
    } catch (dbError: any) {
      console.log(`⚠️  Database check skipped: ${dbError.message}`);
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.fullName,
        role: userData.role
      }
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create auth user: ${authError?.message}`);
    }

    console.log(`✅ Created Supabase Auth user with ID: ${authData.user.id}`);

    // Try to create user in database
    try {
      const dbUser = await prisma.user.create({
        data: {
          id: authData.user.id,
          email: userData.email,
          fullName: userData.fullName,
          role: userData.role,
          avatarUrl: null
        }
      });

      console.log(`✅ Created database user record`);

      // Create employee record if employee code provided
      if (userData.employeeCode) {
        const employee = await prisma.employee.create({
          data: {
            userId: dbUser.id,
            employeeCode: userData.employeeCode,
            department: userData.department || null,
            designation: userData.designation || null,
            joinDate: new Date(),
            salary: null
          }
        });

        console.log(`✅ Created employee record with code: ${employee.employeeCode}`);
      }
    } catch (dbError: any) {
      console.log(`⚠️  Database operations skipped: ${dbError.message}`);
      console.log(`ℹ️  User created in Supabase Auth but not in database. This will be auto-created on first login.`);
    }

    console.log(`✅ Successfully created ${userData.role} user: ${userData.email}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Error creating user ${userData.email}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║        WorkHQ - Creating Test Users                  ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  let successCount = 0;
  let failCount = 0;

  for (const userData of users) {
    const success = await createUser(userData);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║              USER CREATION SUMMARY                    ║');
  console.log('╠═══════════════════════════════════════════════════════╣');
  console.log(`║  Total Users: ${users.length}                                         ║`);
  console.log(`║  ✅ Successfully Created: ${successCount}                            ║`);
  console.log(`║  ❌ Failed: ${failCount}                                            ║`);
  console.log('╠═══════════════════════════════════════════════════════╣');
  console.log('║                                                       ║');
  console.log('║  🔐 ADMIN:                                            ║');
  console.log('║     📧 Email: admin@workhq.com                        ║');
  console.log('║     🔑 Password: Admin@123                            ║');
  console.log('║                                                       ║');
  console.log('║  👔 HR MANAGER:                                       ║');
  console.log('║     📧 Email: hr@workhq.com                           ║');
  console.log('║     🔑 Password: Hr@123                               ║');
  console.log('║                                                       ║');
  console.log('║  👤 EMPLOYEE:                                         ║');
  console.log('║     📧 Email: employee@workhq.com                     ║');
  console.log('║     🔑 Password: Employee@123                         ║');
  console.log('║                                                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  await prisma.$disconnect();
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

