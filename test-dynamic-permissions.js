const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://bghozdhitxqxysmpxtkb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnaG96ZGhpdHhxeHlzbXB4dGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzc1NTYsImV4cCI6MjA3MzA1MzU1Nn0.tdUsuu5l3NZai-2dSE2fyon_cpNwlrA-5dvt2eRrhv4";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDynamicPermissions() {
  console.log('🧪 Testing Dynamic Permissions System\n');

  // Test 1: Check permissions table
  console.log('1️⃣ Checking permissions table...');
  const { data: permissions, error: permError } = await supabase
    .from('permissions')
    .select('*');
  
  console.log(`   ✓ Found ${permissions?.length || 0} permissions`);
  permissions?.forEach(p => {
    console.log(`     - ${p.code}: ${p.name}`);
  });

  // Test 2: Check menu items
  console.log('\n2️⃣ Checking menu items...');
  const { data: menus, error: menuError } = await supabase
    .from('menu_items')
    .select('*')
    .order('sort_order');
  
  console.log(`   ✓ Found ${menus?.length || 0} menu items`);
  menus?.forEach(m => {
    console.log(`     - ${m.name} (${m.path}) - Permission: ${m.permission_code || 'None'}`);
  });

  // Test 3: Check role permissions
  console.log('\n3️⃣ Checking role permissions...');
  const { data: rolePerms } = await supabase
    .from('role_permissions')
    .select('*, roles(name), permissions(name)');
  
  const grouped = {};
  rolePerms?.forEach(rp => {
    const roleName = rp.roles?.name;
    if (!grouped[roleName]) grouped[roleName] = [];
    grouped[roleName].push(rp.permissions?.name);
  });

  Object.entries(grouped).forEach(([role, perms]) => {
    console.log(`   ${role}:`);
    perms.forEach(p => console.log(`     - ${p}`));
  });

  console.log('\n✅ Test completed!');
}

testDynamicPermissions();