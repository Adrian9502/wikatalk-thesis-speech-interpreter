const mongoose = require('mongoose');
const Translation = require('../models/translation.model');
const encryptionService = require('../utils/encryption');
require('dotenv').config();

async function migrateTranslations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB');

    // Find all unencrypted translations
    const unencryptedTranslations = await Translation.find({
      $or: [
        { encrypted: { $ne: true } },
        { encrypted: { $exists: false } }
      ]
    });

    console.log(`🔍 Found ${unencryptedTranslations.length} unencrypted translations`);

    if (unencryptedTranslations.length === 0) {
      console.log('✅ No translations need migration');
      return;
    }

    let migrated = 0;
    let failed = 0;

    for (const translation of unencryptedTranslations) {
      try {
        // Check if already encrypted
        if (typeof translation.originalText === 'object' && translation.originalText.encrypted) {
          console.log(`⏭️  Skipping already encrypted translation: ${translation._id}`);
          continue;
        }

        // Encrypt the text fields
        const encryptedOriginalText = encryptionService.encrypt(translation.originalText);
        const encryptedTranslatedText = encryptionService.encrypt(translation.translatedText);

        // Update the document
        await Translation.findByIdAndUpdate(translation._id, {
          originalText: encryptedOriginalText,
          translatedText: encryptedTranslatedText,
          encrypted: true,
          encryptionVersion: '1.0'
        });

        migrated++;
        console.log(`✅ Migrated translation: ${translation._id}`);
      } catch (error) {
        failed++;
        console.error(`❌ Failed to migrate translation ${translation._id}:`, error.message);
      }
    }

    console.log('='.repeat(50));
    console.log('🎉 MIGRATION COMPLETE');
    console.log(`✅ Successfully migrated: ${migrated} translations`);
    console.log(`❌ Failed to migrate: ${failed} translations`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
  }
}

// Run migration
migrateTranslations();