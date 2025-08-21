const encryptionService = require('../utils/encryption');
require('dotenv').config();

// Test data
const testData = {
  originalText: "Magandang umaga",
  translatedText: "Maayong buntag"
};

console.log('🧪 Testing Encryption/Decryption');
console.log('='.repeat(40));

try {
  console.log('Original text:', testData.originalText);

  // Test encryption
  const encrypted = encryptionService.encrypt(testData.originalText);
  console.log('✅ Encryption successful');
  console.log('Encrypted data structure:', {
    algorithm: encrypted.algorithm,
    ivLength: encrypted.iv.length,
    encryptedLength: encrypted.encrypted.length
  });

  // Test decryption
  const decrypted = encryptionService.decrypt(encrypted);
  console.log('✅ Decryption successful');
  console.log('Decrypted text:', decrypted);

  // Verify data integrity
  if (decrypted === testData.originalText) {
    console.log('✅ Data integrity verified');
    console.log('🎉 All tests passed!');
  } else {
    console.log('❌ Data integrity check failed');
    console.log('Expected:', testData.originalText);
    console.log('Got:', decrypted);
  }

} catch (error) {
  console.error('❌ Test failed:', error);
  console.error('Full error:', error);
}