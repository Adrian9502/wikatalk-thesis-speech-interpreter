const Translation = require("../models/translation.model");
const { protect } = require("../middleware/auth.middleware");

// Update saveTranslation to get userId from authenticated request
const saveTranslation = async (req, res) => {
  try {
    const { type, fromLanguage, toLanguage, originalText, translatedText } =
      req.body;

    // Create translation object with user ID if available
    const translationData = {
      type,
      fromLanguage,
      toLanguage,
      originalText,
      translatedText,
    };

    // Add userId if request has authenticated user
    if (req.user && req.user.id) {
      translationData.userId = req.user.id;
    }

    const translation = await Translation.create(translationData);

    res.status(201).json({
      success: true,
      message: "Translation saved successfully",
      data: translation,
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

// Update getTranslations to filter by userId
const getTranslations = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};

    // If user is authenticated, filter by userId
    if (req.user && req.user.id) {
      filter.userId = req.user.id;
    }

    const translations = await Translation.find(filter).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: translations.length,
      data: translations,
    });
  } catch (error) {
    console.error("Error fetching translations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch translations",
      error: error.message,
    });
  }
};

// Update deleteTranslation to check ownership
const deleteTranslation = async (req, res) => {
  try {
    const translation = await Translation.findById(req.params.id);

    if (!translation) {
      return res.status(404).json({
        success: false,
        message: "Translation not found",
      });
    }

    // Check if the translation belongs to the user
    if (
      req.user &&
      req.user.id &&
      translation.userId &&
      translation.userId.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this translation",
      });
    }

    await translation.deleteOne();

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

module.exports = {
  saveTranslation,
  getTranslations,
  deleteTranslation,
};
