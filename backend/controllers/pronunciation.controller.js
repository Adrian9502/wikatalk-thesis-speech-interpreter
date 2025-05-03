const Pronunciation = require("../models/pronunciation.model");

exports.getAllPronunciations = async (req, res) => {
  try {
    const pronunciations = await Pronunciation.find({});
    res.status(200).json(pronunciations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pronunciation data", error: error.message });
  }
};