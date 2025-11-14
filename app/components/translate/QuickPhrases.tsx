import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import QUICK_PHRASES from "@/constants/quickPhrases";
import { LanguageOption } from "@/types/types";
import { BASE_COLORS } from "@/constants/colors";
import {
  FONT_SIZES,
  POPPINS_FONT,
  COMPONENT_FONT_SIZES,
} from "@/constants/fontSizes";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Check if it's a small screen (like Nexus 4)
const isSmallScreen = screenWidth <= 384 && screenHeight <= 1280;

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

  const responsiveStyles = getResponsiveStyles();

  return (
    <View style={responsiveStyles.container}>
      <Text style={responsiveStyles.title}>Quick Phrases:</Text>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        style={responsiveStyles.categoryScrollView}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setActiveCategory(category)}
            style={[
              responsiveStyles.categoryTab,
              activeCategory === category
                ? responsiveStyles.activeTab
                : responsiveStyles.inactiveTab,
            ]}
          >
            <Text
              style={[
                responsiveStyles.categoryText,
                activeCategory === category
                  ? responsiveStyles.activeTabText
                  : responsiveStyles.inactiveTabText,
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
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        style={responsiveStyles.phrasesScrollView}
      >
        {currentPhrases.map((phrase, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onSelectPhrase(phrase.text)}
            style={responsiveStyles.phraseButton}
          >
            <Text style={responsiveStyles.phraseText}>{phrase.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const getResponsiveStyles = () => {
  return StyleSheet.create({
    container: {
      width: "100%",
    },
    title: {
      color: BASE_COLORS.blue,
      fontFamily: POPPINS_FONT.medium,
      marginBottom: isSmallScreen ? 6 : 8,
      fontSize: COMPONENT_FONT_SIZES.translation.language,
    },
    categoryScrollView: {
      marginBottom: isSmallScreen ? 6 : 8,
    },
    categoryTab: {
      paddingHorizontal: isSmallScreen ? 10 : 12,
      paddingVertical: isSmallScreen ? 2 : 3,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: isSmallScreen ? 6 : 8,
      borderRadius: isSmallScreen ? 16 : 20,
    },
    activeTab: {
      backgroundColor: BASE_COLORS.blue,
    },
    inactiveTab: {
      borderWidth: 2,
      borderColor: BASE_COLORS.lightBlue,
    },
    categoryText: {
      fontFamily: POPPINS_FONT.regular,
      fontSize: COMPONENT_FONT_SIZES.translation.pronunciation,
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
      paddingHorizontal: isSmallScreen ? 8 : 10,
      paddingVertical: isSmallScreen ? 4 : 5,
      borderRadius: isSmallScreen ? 16 : 20,
      marginRight: isSmallScreen ? 4 : 6,
      flexDirection: "row",
      alignItems: "center",
    },
    phraseText: {
      color: BASE_COLORS.blue,
      fontSize: COMPONENT_FONT_SIZES.translation.pronunciation,
      fontFamily: POPPINS_FONT.regular,
    },
  });
};

export default QuickPhrases;
