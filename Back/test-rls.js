// Test RLS (Row Level Security) configuration
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

console.log('🔒 Testing Row Level Security (RLS) Configuration...\n');

async function testRLS() {
  // Test 1: Service Role (should bypass RLS)
  console.log('Test 1: Service Role Access (should bypass RLS)');
  const serviceClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  try {
    const { data, error, count } = await serviceClient
      .from('User')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.log('❌ Service role cannot access tables:', error.message);
      console.log('   Error code:', error.code);
      if (error.code === '42501') {
        console.log('   ⚠️  RLS is blocking service_role!');
        console.log('   🔧 Run: Back/prisma/disable-rls-for-service.sql');
      }
    } else {
      console.log('✅ Service role can access tables');
      console.log(`   Found ${count || data.length} user(s)`);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
  
  console.log('');
  
  // Test 2: Anon Key (should be blocked by RLS)
  console.log('Test 2: Anonymous Access (should be blocked by RLS)');
  const anonClient = createClient(supabaseUrl, anonKey);
  
  try {
    const { data, error } = await anonClient
      .from('User')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('no rows')) {
        console.log('✅ RLS is working - anon key blocked (as expected)');
      } else {
        console.log('⚠️  Unexpected error:', error.message);
      }
    } else {
      console.log('⚠️  WARNING: Anon key can access data!');
      console.log('   This means RLS might not be properly configured');
      console.log('   Found', data.length, 'record(s)');
    }
  } catch (err) {
    console.log('⚠️  Error:', err.message);
  }
  
  console.log('');
  
  // Test 3: Check RLS status on tables
  console.log('Test 3: Checking RLS status on tables...');
  try {
    const { data: rlsStatus, error } = await serviceClient.rpc('check_rls_status');
    
    if (error && error.code === '42883') {
      // Function doesn't exist, check manually
      console.log('   Checking tables manually...');
      
      const tables = ['User', 'Employee', 'Location', 'Attendance', 
                     'LeaveType', 'Leave', 'LeaveBalance', 'Payroll'];
      
      for (const table of tables) {
        const { error: testError } = await serviceClient
          .from(table)
          .select('id')
          .limit(1);
        
        if (testError && testError.code === '42501') {
          console.log(`   ❌ ${table}: RLS blocking service_role`);
        } else if (testError) {
          console.log(`   ⚠️  ${table}: ${testError.message}`);
        } else {
          console.log(`   ✅ ${table}: Accessible`);
        }
      }
    }
  } catch (err) {
    console.log('   Could not check RLS status');
  }
  
  console.log('\n---\n');
  
  // Summary and recommendations
  console.log('📋 Summary:');
  console.log('');
  console.log('✅ What should work:');
  console.log('   - Backend (service_role key) should bypass RLS');
  console.log('   - Frontend (anon key) should be blocked by RLS');
  console.log('   - Authenticated users should follow RLS policies');
  console.log('');
  console.log('🔧 If service_role is blocked:');
  console.log('   1. Open Supabase SQL Editor');
  console.log('   2. Run: Back/prisma/disable-rls-for-service.sql');
  console.log('   3. This grants service_role bypass permissions');
  console.log('');
  console.log('📚 Learn more about RLS:');
  console.log('   https://supabase.com/docs/guides/auth/row-level-security');
  console.log('');
}

testRLS().catch(console.error);

