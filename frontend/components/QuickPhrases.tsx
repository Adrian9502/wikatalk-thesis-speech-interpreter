import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import QUICK_PHRASES from "@/constant/quickPhrases";

type LanguageOption =
  | "Tagalog"
  | "Cebuano"
  | "Hiligaynon"
  | "Ilocano"
  | "Bicol"
  | "Waray"
  | "Pangasinan"
  | "Maguindanao"
  | "Kapampangan"
  | "Bisaya";

const QuickPhrases = ({
  onSelectPhrase,
  sourceLanguage,
}: {
  onSelectPhrase: (text: string) => void;
  sourceLanguage: LanguageOption;
}) => {
  const [activeCategory, setActiveCategory] = useState("Greetings");

  // Get phrases for the selected language
  const selectedLanguagePhrases = QUICK_PHRASES[sourceLanguage] || [];

  // Get categories dynamically from the selected language
  const categories = selectedLanguagePhrases.map(
    (category) => category.category
  );

  // Reset active category when language changes
  useEffect(() => {
    if (selectedLanguagePhrases.length > 0) {
      setActiveCategory(selectedLanguagePhrases[0].category);
    }
  }, [sourceLanguage, selectedLanguagePhrases]);

  // Get phrases for the active category
  const currentPhrases =
    selectedLanguagePhrases.find((cat) => cat.category === activeCategory)
      ?.phrases || [];

  // If no phrases available for the selected language
  if (selectedLanguagePhrases.length === 0) {
    return null; // Or return a placeholder
  }

  return (
    <View className="w-full mt-2 mb-3 ">
      <Text className="text-customBlue font-psemibold mb-2 text-base">
        Quick Phrases:
      </Text>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-2 "
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setActiveCategory(category)}
            className={`px-3 py-1 mx-2 rounded-lg ${
              activeCategory === category ? "bg-customBlue" : "bg-blue-100"
            }`}
          >
            <Text
              className={`font-medium ${
                activeCategory === category ? "text-white" : "text-customBlue"
              }`}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Phrases for the selected category */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pb-1"
      >
        {currentPhrases.map((phrase, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSelectPhrase(phrase.text)}
            className="bg-blue-50 border border-customBlue px-3 py-2 rounded-full mr-2 flex-row items-center"
          >
            <Text className="text-customBlue ">{phrase.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default QuickPhrases;
