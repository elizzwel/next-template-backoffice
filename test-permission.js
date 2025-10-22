const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://bghozdhitxqxysmpxtkb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnaG96ZGhpdHhxeHlzbXB4dGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzc1NTYsImV4cCI6MjA3MzA1MzU1Nn0.tdUsuu5l3NZai-2dSE2fyon_cpNwlrA-5dvt2eRrhv4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPermissions() {
  console.log('Testing permissions...\n');
  
  // Get admin user
  const { data: admin } = await supabase
    .from('users')
    .select('*, roles(*)')
    .eq('email', 'admin@example.com')
    .single();
  
  console.log('Admin User:');
  console.log('- Email:', admin.email);
  console.log('- Role:', admin.roles.name);
  console.log('- Permissions:', admin.roles.permissions);
  
  console.log('\n✅ Admin has permissions:', admin.roles.permissions.length > 0 ? 'Yes' : 'No');
}

testPermissions();