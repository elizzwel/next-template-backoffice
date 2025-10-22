const bcrypt = require('bcryptjs');

async function generatePassword() {
  const password = '123456';
  
  console.log('Generating hash for password:', password);
  
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n=== COPY HASH INI ===');
  console.log(hash);
  console.log('===================\n');
  
  // Test hash
  const isValid = await bcrypt.compare(password, hash);
  console.log('Hash verification test:', isValid ? '✅ VALID' : '❌ INVALID');
}

generatePassword();