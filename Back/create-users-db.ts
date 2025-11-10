import { supabaseAdmin } from './src/utils/supabase';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  role: 'ADMIN' | 'HR' | 'EMPLOYEE';
  employeeCode?: string;
  department?: string;
  designation?: string;
}

const users: CreateUserData[] = [
  {
    email: 'admin@workhq.com',
    password: 'Admin@123',
    fullName: 'Admin User',
    role: 'ADMIN',
    employeeCode: 'ADMIN001',
    department: 'Management',
    designation: 'System Administrator'
  },
  {
    email: 'hr@workhq.com',
    password: 'Hr@123',
    fullName: 'HR Manager',
    role: 'HR',
    employeeCode: 'HR001',
    department: 'Human Resources',
    designation: 'HR Manager'
  },
  {
    email: 'employee@workhq.com',
    password: 'Employee@123',
    fullName: 'John Employee',
    role: 'EMPLOYEE',
    employeeCode: 'EMP001',
    department: 'Engineering',
    designation: 'Software Developer'
  }
];

async function createUser(userData: CreateUserData) {
  try {
    console.log(`\n📝 Creating user: ${userData.email}...`);

    // Check if user already exists in Supabase Auth
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingAuthUsers.users.find(u => u.email === userData.email);

    let authUserId: string;

    if (userExists) {
      console.log(`ℹ️  User ${userData.email} already exists in Supabase Auth`);
      authUserId = userExists.id;
    } else {
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

      console.log(`✅ Created Supabase Auth user`);
      authUserId = authData.user.id;
    }

    // Check if user exists in database
    const { data: existingDbUser, error: checkError } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('email', userData.email)
      .single();

    if (existingDbUser) {
      console.log(`⚠️  User ${userData.email} already exists in database. Deleting...`);
      
      // Delete employee record first (due to foreign key)
      await supabaseAdmin
        .from('Employee')
        .delete()
        .eq('userId', existingDbUser.id);
      
      // Delete user record
      const { error: deleteError } = await supabaseAdmin
        .from('User')
        .delete()
        .eq('id', existingDbUser.id);

      if (deleteError) {
        console.log(`⚠️  Error deleting existing user: ${deleteError.message}`);
      } else {
        console.log(`✅ Deleted existing database user`);
      }
    }

    // Create user in database using Supabase client
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('User')
      .insert({
        id: authUserId,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Failed to create database user: ${dbError.message}`);
    }

    console.log(`✅ Created database user record`);

    // Create employee record if employee code provided
    if (userData.employeeCode) {
      const { data: employee, error: empError } = await supabaseAdmin
        .from('Employee')
        .insert({
          id: randomUUID(),
          userId: authUserId,
          employeeCode: userData.employeeCode,
          department: userData.department || null,
          designation: userData.designation || null,
          joinDate: new Date().toISOString(),
          salary: null
        })
        .select()
        .single();

      if (empError) {
        console.log(`⚠️  Error creating employee record: ${empError.message}`);
      } else {
        console.log(`✅ Created employee record with code: ${employee.employeeCode}`);
      }
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
  console.log('║     WorkHQ - Creating Users in Database              ║');
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

  process.exit(failCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

