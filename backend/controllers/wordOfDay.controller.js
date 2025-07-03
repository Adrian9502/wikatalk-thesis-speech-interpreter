const WordOfDay = require("../models/wordOfDay.model");
const Pronunciation = require("../models/pronunciation.model");

exports.getWordOfTheDay = async (req, res) => {
  try {
    // Get today's date (UTC midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log("[wordOfDay] Looking for today's word, date:", today);

    // Try to find today's word
    let wordOfDay = await WordOfDay.findOne({
      date: { $gte: today }
    }).sort({ date: -1 });

    // If we don't have a word for today, generate a new one
    if (!wordOfDay) {
      console.log("[wordOfDay] No word for today, generating new one");
      
      // Get a random word from the pronunciation collection
      const count = await Pronunciation.countDocuments();
      console.log(`[wordOfDay] Found ${count} words in Pronunciation collection`);
      
      if (count === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "No words available in the database" 
        });
      }

      const random = Math.floor(Math.random() * count);
      const randomWord = await Pronunciation.findOne().lean().skip(random);
      
      console.log("[wordOfDay] Selected random word:", randomWord ? randomWord.english : "NONE FOUND");
      
      if (!randomWord) {
        return res.status(404).json({ 
          success: false, 
          message: "Failed to retrieve random word" 
        });
      }
      
      // Debug the translations object
      console.log("[wordOfDay] Translations keys:", Object.keys(randomWord.translations));
      
      // Get valid language keys (filter out non-objects like 'v')
      const languages = Object.keys(randomWord.translations).filter(key => 
        typeof randomWord.translations[key] === 'object' && 
        randomWord.translations[key] !== null &&
        key !== 'v' // Explicitly filter out the 'v' property
      );
      
      console.log("[wordOfDay] Available languages:", languages);
      
      if (languages.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: "No translations available for selected word" 
        });
      }
      
      // Select a random language from the valid ones
      const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
      console.log("[wordOfDay] Selected random language:", randomLanguage);
      
      // Get translation data for the selected language
      const translationData = randomWord.translations[randomLanguage];
      console.log("[wordOfDay] Translation data:", translationData);
      
      if (!translationData) {
        return res.status(404).json({ 
          success: false, 
          message: `No translation data for language: ${randomLanguage}` 
        });
      }
      
      // Format language with uppercase first letter
      const formattedLanguage = randomLanguage.charAt(0).toUpperCase() + randomLanguage.slice(1);
      
      // Create a new word of the day
      wordOfDay = new WordOfDay({
        english: randomWord.english,
        translation: translationData.translation || "Translation not available",
        pronunciation: translationData.pronunciation || "Pronunciation not available",
        language: formattedLanguage,
        date: today // Start of today (UTC)
      });
      
      await wordOfDay.save();
      console.log(`[wordOfDay] New Word of the Day saved: ${randomWord.english}`);
    } else {
      console.log("[wordOfDay] Found existing word for today:", wordOfDay.english);
    }

    return res.status(200).json({ 
      success: true, 
      word: wordOfDay 
    });
  } catch (error) {
    console.error("[wordOfDay] Error in getWordOfTheDay:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Error retrieving word of the day", 
      error: error.message
    });
  }
};