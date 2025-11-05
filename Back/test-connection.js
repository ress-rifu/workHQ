// Simple test script to verify Supabase connection with RLS
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase Connection (with RLS)...\n');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key:', supabaseKey ? '✓ Present' : '✗ Missing');
console.log('Note: Using service_role key to bypass RLS');
console.log('---\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

// Create Supabase client with service_role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    // Test 1: Check connection
    console.log('Test 1: Checking Supabase connection...');
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log(`📊 Found ${data.users.length} user(s) in auth\n`);
    
    // Test 2: Check database tables
    console.log('Test 2: Checking database tables...');
    const { data: tables, error: dbError } = await supabase
      .from('User')
      .select('*')
      .limit(1);
    
    if (dbError) {
      if (dbError.code === '42P01') {
        console.log('⚠️  Table "User" does not exist yet');
        console.log('👉 You need to run the SQL script in Supabase SQL Editor');
        console.log('   See: CREATE_TABLES_GUIDE.md\n');
        return false;
      } else {
        console.log('❌ Database error:', dbError.message);
        return false;
      }
    }
    
    console.log('✅ Database tables exist!');
    console.log(`📊 Found ${tables ? tables.length : 0} user(s) in database\n`);
    
    // Test 3: List all tables
    console.log('Test 3: Listing available tables...');
    const { data: tableList, error: listError } = await supabase.rpc('get_tables', {}, {
      count: 'exact'
    });
    
    // Try alternative method to check tables
    const checkTables = async (tableName) => {
      const { error } = await supabase.from(tableName).select('*').limit(1);
      return !error || error.code !== '42P01';
    };
    
    const tablesToCheck = [
      'User', 'Employee', 'Location', 'Attendance', 
      'LeaveType', 'Leave', 'LeaveBalance', 'Payroll'
    ];
    
    console.log('\nChecking WorkHQ tables:');
    for (const table of tablesToCheck) {
      const exists = await checkTables(table);
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    }
    
    console.log('\n---');
    console.log('🎉 Connection test complete!\n');
    
    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

testConnection()
  .then(success => {
    if (success) {
      console.log('✨ All tests passed! Your Supabase is ready.');
      console.log('🚀 You can now start the backend server: npm run dev\n');
    } else {
      console.log('⚠️  Some tests failed. Please check the errors above.');
      console.log('📚 See CREATE_TABLES_GUIDE.md for setup instructions\n');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

