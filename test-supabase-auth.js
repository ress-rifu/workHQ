const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rdkgfezrowfnlrbtiekn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka2dmZXpyb3dmbmxyYnRpZWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTIzMzcsImV4cCI6MjA2MTIyODMzN30.l-eDnZ15BScEIHfpjnTj7gJQhUUBQG5EBZXZnU0UKjU';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJka2dmZXpyb3dmbmxyYnRpZWtuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTY1MjMzNywiZXhwIjoyMDYxMjI4MzM3fQ.aNsPJhKEOiGvwA2gPgN2lhN5YKKZiqUqJzs8TKfgXuc';

async function testAuth() {
  console.log('\n=== Testing Supabase Authentication ===\n');
  
  // Test 1: Login with anon key (like frontend does)
  console.log('Test 1: Login with email/password (anon key)...');
  const clientUser = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data: loginData, error: loginError } = await clientUser.auth.signInWithPassword({
    email: 'admin@workhq.com',
    password: 'Admin@123',
  });
  
  if (loginError) {
    console.log('❌ Login failed:', loginError.message);
    return;
  }
  
  console.log('✅ Login successful!');
  console.log('   User ID:', loginData.user.id);
  console.log('   Email:', loginData.user.email);
  console.log('   Access Token:', loginData.session.access_token.substring(0, 50) + '...');
  
  // Test 2: Validate token with service key (like backend does)
  console.log('\nTest 2: Validate token with service role key...');
  const clientAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  
  const { data: userData, error: userError } = await clientAdmin.auth.getUser(loginData.session.access_token);
  
  if (userError) {
    console.log('❌ Token validation failed:', userError.message);
    console.log('   Error details:', JSON.stringify(userError, null, 2));
    return;
  }
  
  console.log('✅ Token validation successful!');
  console.log('   User ID:', userData.user.id);
  console.log('   Email:', userData.user.email);
  
  console.log('\n✅ All tests passed! Authentication flow is working correctly.\n');
}

testAuth().catch(error => {
  console.error('\n❌ Test failed with error:', error);
  process.exit(1);
});

