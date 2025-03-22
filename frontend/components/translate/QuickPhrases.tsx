import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import QUICK_PHRASES from "@/constant/quickPhrases";
import { LanguageOption } from "@/types/types";
import { BASE_COLORS } from "@/constant/colors";

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
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Phrases:</Text>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScrollView}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setActiveCategory(category)}
            style={[
              styles.categoryTab,
              activeCategory === category
                ? styles.activeTab
                : styles.inactiveTab,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                activeCategory === category
                  ? styles.activeTabText
                  : styles.inactiveTabText,
              ]}
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
        style={styles.phrasesScrollView}
      >
        {currentPhrases.map((phrase, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSelectPhrase(phrase.text)}
            style={styles.phraseButton}
          >
            <Text style={styles.phraseText}>{phrase.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    color: BASE_COLORS.blue,
    fontFamily: "Poppins-Medium",
    marginBottom: 8,
    fontSize: 14,
  },
  categoryScrollView: {
    marginBottom: 8,
  },
  categoryTab: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    borderRadius: 7,
  },
  activeTab: {
    backgroundColor: BASE_COLORS.blue,
  },
  inactiveTab: {
    borderWidth: 1,
    borderColor: BASE_COLORS.lightBlue,
  },
  categoryText: {
    fontFamily: "Poppins-Regular",
  },
  activeTabText: {
    color: BASE_COLORS.white,
  },
  inactiveTabText: {
    color: BASE_COLORS.blue,
  },
  phrasesScrollView: {
    paddingBottom: 4,
  },
  phraseButton: {
    borderWidth: 1,
    borderColor: BASE_COLORS.blue,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 13,
    marginRight: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  phraseText: {
    color: BASE_COLORS.blue,
    fontFamily: "Poppins-Regular",
  },
});

export default QuickPhrases;
