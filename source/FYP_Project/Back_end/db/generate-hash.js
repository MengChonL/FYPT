<<<<<<< HEAD
/**
 * Generate a bcrypt hash for the admin password.
 * 
 * Usage:
 *   node generate-hash.js <your-password>
 * 
 * Copy the output hash to your .env file as ADMIN_PASSWORD_HASH.
 */
import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Usage: node generate-hash.js <password>');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log('\n✅ Password hash generated:');
console.log(hash);
console.log('\nAdd to your .env file:');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
=======
/**
 * Generate a bcrypt hash for the admin password.
 * 
 * Usage:
 *   node generate-hash.js <your-password>
 * 
 * Copy the output hash to your .env file as ADMIN_PASSWORD_HASH.
 */
import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Usage: node generate-hash.js <password>');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log('\n✅ Password hash generated:');
console.log(hash);
console.log('\nAdd to your .env file:');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
