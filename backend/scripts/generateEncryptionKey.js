const crypto = require('crypto');

// Generate a secure 256-bit (32-byte) encryption key
const key = crypto.randomBytes(32);
const hexKey = key.toString('hex');

console.log('='.repeat(60));
console.log('🔐 SECURE ENCRYPTION KEY GENERATED');
console.log('='.repeat(60));
console.log('Add this to your .env file:');
console.log('');
console.log(`ENCRYPTION_KEY=${hexKey}`);
console.log('');
console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('- Keep this key SECRET and secure');
console.log('- Never commit this key to version control');
console.log('- Use different keys for different environments');
console.log('- Back up this key securely - losing it means losing data');
console.log('- Use a secure key management system in production');
console.log('='.repeat(60));