const Translation = require("../models/translation.model");
const encryptionService = require("../utils/encryption");

// Save translation with encryption
const saveTranslation = async (req, res) => {
  try {
    const { type, fromLanguage, toLanguage, originalText, translatedText } = req.body;

    // Validate required fields
    if (!type || !fromLanguage || !toLanguage || !originalText || !translatedText) {
      return res.status(400).json({
        success: false,
        message: "All translation fields are required",
      });
    }

    // Encrypt sensitive text fields
    console.log('[Translation] Encrypting translation texts...');
    const encryptedOriginalText = encryptionService.encrypt(originalText);
    const encryptedTranslatedText = encryptionService.encrypt(translatedText);

    if (!encryptedOriginalText || !encryptedTranslatedText) {
      throw new Error('Failed to encrypt translation texts');
    }

    // Create translation object with encrypted data
    const translationData = {
      type,
      fromLanguage,
      toLanguage,
      originalText: encryptedOriginalText,
      translatedText: encryptedTranslatedText,
      encrypted: true,
      encryptionVersion: '1.0',
    };

    // Add userId if request has authenticated user
    if (req.user && req.user.id) {
      translationData.userId = req.user.id;
    }

    const translation = await Translation.create(translationData);

    console.log(`[Translation] Successfully saved encrypted translation: ${translation._id}`);

    res.status(201).json({
      success: true,
      message: "Translation saved successfully",
      data: {
        _id: translation._id,
        type: translation.type,
        fromLanguage: translation.fromLanguage,
        toLanguage: translation.toLanguage,
        date: translation.date,
        encrypted: translation.encrypted,
      },
    });
  } catch (error) {
    console.error("Error saving translation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save translation",
      error: error.message,
    });
  }
};

// Get translation history with decryption
const getTranslationHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { type, limit = 50, skip = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Build query
    const query = { userId };
    if (type && ["Speech", "Translate", "Scan"].includes(type)) {
      query.type = type;
    }

    // Fetch encrypted translations
    const translations = await Translation.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean(); // Use lean for better performance

    console.log(`[Translation] Fetched ${translations.length} encrypted translations for user ${userId}`);

    // DEBUG: Log first translation structure
    if (translations.length > 0) {
      console.log(`[Translation] Sample encrypted translation:`, {
        id: translations[0]._id,
        originalText: translations[0].originalText,
        translatedText: translations[0].translatedText,
        encrypted: translations[0].encrypted,
      });
    }

    // Decrypt translations for display
    const decryptedTranslations = translations.map(translation => {
      try {
        let originalText = '[Decryption Failed]';
        let translatedText = '[Decryption Failed]';

        // DEBUG: Log encryption status
        console.log(`[Translation] Processing translation ${translation._id}:`, {
          encrypted: translation.encrypted,
          originalTextType: typeof translation.originalText,
          translatedTextType: typeof translation.translatedText,
          hasOriginalEncrypted: translation.originalText?.encrypted ? 'yes' : 'no',
          hasTranslatedEncrypted: translation.translatedText?.encrypted ? 'yes' : 'no',
        });

        // Decrypt texts if they are encrypted
        if (translation.encrypted && translation.originalText) {
          try {
            originalText = encryptionService.decrypt(translation.originalText);
            console.log(`[Translation] Successfully decrypted originalText for ${translation._id}: "${originalText.substring(0, 20)}..."`);
          } catch (decryptError) {
            console.error(`[Translation] Failed to decrypt originalText for ${translation._id}:`, decryptError.message);
          }
        } else if (typeof translation.originalText === 'string') {
          // Handle legacy unencrypted data
          originalText = translation.originalText;
          console.log(`[Translation] Using legacy unencrypted originalText for ${translation._id}`);
        }

        if (translation.encrypted && translation.translatedText) {
          try {
            translatedText = encryptionService.decrypt(translation.translatedText);
            console.log(`[Translation] Successfully decrypted translatedText for ${translation._id}: "${translatedText.substring(0, 20)}..."`);
          } catch (decryptError) {
            console.error(`[Translation] Failed to decrypt translatedText for ${translation._id}:`, decryptError.message);
          }
        } else if (typeof translation.translatedText === 'string') {
          // Handle legacy unencrypted data
          translatedText = translation.translatedText;
          console.log(`[Translation] Using legacy unencrypted translatedText for ${translation._id}`);
        }

        return {
          id: translation._id.toString(),
          type: translation.type,
          fromLanguage: translation.fromLanguage,
          toLanguage: translation.toLanguage,
          originalText,
          translatedText,
          date: translation.date,
          encrypted: translation.encrypted || false,
        };
      } catch (decryptionError) {
        console.error(`Failed to decrypt translation ${translation._id}:`, decryptionError);
        return {
          id: translation._id.toString(),
          type: translation.type,
          fromLanguage: translation.fromLanguage,
          toLanguage: translation.toLanguage,
          originalText: '[Decryption Failed]',
          translatedText: '[Decryption Failed]',
          date: translation.date,
          encrypted: translation.encrypted || false,
        };
      }
    });

    console.log(`[Translation] Returning ${decryptedTranslations.length} decrypted translations`);

    res.status(200).json({
      success: true,
      history: decryptedTranslations,
      count: decryptedTranslations.length,
    });
  } catch (error) {
    console.error("Error fetching translation history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch translation history",
      error: error.message,
    });
  }
};

// Delete translation
const deleteTranslation = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const translation = await Translation.findOneAndDelete({
      _id: id,
      userId: userId,
    });

    if (!translation) {
      return res.status(404).json({
        success: false,
        message: "Translation not found",
      });
    }

    console.log(`[Translation] Deleted translation ${id} for user ${userId}`);

    res.status(200).json({
      success: true,
      message: "Translation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting translation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete translation",
      error: error.message,
    });
  }
};

// Clear all translations
const clearTranslationHistory = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = await Translation.deleteMany({ userId });

    console.log(`[Translation] Cleared ${result.deletedCount} translations for user ${userId}`);

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} translations`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing translation history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear translation history",
      error: error.message,
    });
  }
};

module.exports = {
  saveTranslation,
  getTranslationHistory,
  deleteTranslation,
  clearTranslationHistory,
};
