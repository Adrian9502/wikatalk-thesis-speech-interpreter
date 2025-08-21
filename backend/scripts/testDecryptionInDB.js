const mongoose = require('mongoose');
const Translation = require('../models/translation.model');
const encryptionService = require('../utils/encryption');
require('dotenv').config();

async function testDecryption() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Get the latest translation
    const translation = await Translation.findOne().sort({ date: -1 });

    if (!translation) {
      console.log('❌ No translations found');
      return;
    }

    console.log('🔍 Testing translation:', translation._id);
    console.log('Encrypted flag:', translation.encrypted);
    console.log('Original text structure:', translation.originalText);
    console.log('Translated text structure:', translation.translatedText);

    // Try to decrypt
    try {
      const decryptedOriginal = encryptionService.decrypt(translation.originalText);
      const decryptedTranslated = encryptionService.decrypt(translation.translatedText);

      console.log('✅ Decryption successful!');
      console.log('Original:', decryptedOriginal);
      console.log('Translated:', decryptedTranslated);
    } catch (decryptError) {
      console.error('❌ Decryption failed:', decryptError.message);
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testDecryption();