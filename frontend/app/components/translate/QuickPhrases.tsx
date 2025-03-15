import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import QUICK_PHRASES from "@/app/constant/quickPhrases";
import { LanguageOption } from "@/app/types/types";
import { BASE_COLORS } from "@/app/constant/colors";

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
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
  },
  categoryScrollView: {
    marginBottom: 8,
  },
  categoryTab: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: BASE_COLORS.blue,
  },
  inactiveTab: {
    backgroundColor: BASE_COLORS.lightBlue,
  },
  categoryText: {
    fontWeight: "500",
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
    backgroundColor: BASE_COLORS.lightBlue,
    borderWidth: 1,
    borderColor: BASE_COLORS.blue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  phraseText: {
    color: BASE_COLORS.blue,
  },
});

export default QuickPhrases;
