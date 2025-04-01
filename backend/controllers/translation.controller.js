const Translation = require("../models/translation.model");

// Save a new translation to history
exports.saveTranslation = async (req, res) => {
  try {
    const { type, fromLanguage, toLanguage, originalText, translatedText } =
      req.body;

    // Validate required fields
    if (
      !type ||
      !fromLanguage ||
      !toLanguage ||
      !originalText ||
      !translatedText
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Create new translation record
    const translation = new Translation({
      type,
      fromLanguage,
      toLanguage,
      originalText,
      translatedText,
    });

    await translation.save();

    return res.status(201).json({
      success: true,
      data: translation,
    });
  } catch (error) {
    console.error("Error saving translation:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to save translation",
    });
  }
};

// Get translations, with optional type filter
exports.getTranslations = async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};

    // Filter by type if provided
    if (type && ["Speech", "Translate", "Scan"].includes(type)) {
      query.type = type;
    }

    const translations = await Translation.find(query)
      .sort({ date: -1 }) // Newest first
      .limit(100); // Limit results

    return res.status(200).json({
      success: true,
      count: translations.length,
      data: translations,
    });
  } catch (error) {
    console.error("Error retrieving translations:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve translations",
    });
  }
};

// Delete a translation by ID
exports.deleteTranslation = async (req, res) => {
  try {
    const { id } = req.params;

    const translation = await Translation.findByIdAndDelete(id);

    if (!translation) {
      return res.status(404).json({
        success: false,
        message: "Translation not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Translation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting translation:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete translation",
    });
  }
};
