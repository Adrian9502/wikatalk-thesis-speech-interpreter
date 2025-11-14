import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Search, Globe } from "react-native-feather";
import { BASE_COLORS } from "@/constants/colors";
import {
  FONT_SIZES,
  POPPINS_FONT,
  COMPONENT_FONT_SIZES,
} from "@/constants/fontSizes"; // ADDED: Import font constants

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Check for different screen sizes
const isSmallScreen = screenWidth <= 384 && screenHeight <= 1280; // Nexus 4 and similar
const isMediumScreen = screenWidth <= 414 && screenHeight <= 896; // iPhone X/11 and similar

interface EmptyStateProps {
  searchTerm?: string;
  selectedLanguage?: string;
  hasData?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  searchTerm = "",
  selectedLanguage = "",
  hasData = true,
}) => {
  // Determine the appropriate message and icon based on the state
  const getEmptyStateContent = () => {
    const trimmedSearchTerm = searchTerm.trim();
    const hasSearchTerm = trimmedSearchTerm.length > 0;

    // Get responsive icon size
    const iconSize = isSmallScreen ? 20 : isMediumScreen ? 23 : 25;

    // Case 1: No data available for the selected language
    if (!hasData && selectedLanguage) {
      return {
        icon: (
          <Globe width={iconSize} height={iconSize} color={BASE_COLORS.white} />
        ),
        title: `No ${selectedLanguage} data available`,
        message:
          "We're still working on adding content for this language. Please try another language or check back later.",
        iconColor: BASE_COLORS.orange,
      };
    }

    // Case 2: Search term provided but no results
    if (hasSearchTerm) {
      return {
        icon: (
          <Search
            width={iconSize}
            height={iconSize}
            color={BASE_COLORS.white}
          />
        ),
        title: "No results found",
        message: `No matches found for "${trimmedSearchTerm}". Try using different keywords or check your spelling.`,
        iconColor: BASE_COLORS.orange,
      };
    }

    // Case 3: No search term but language has no data
    if (selectedLanguage) {
      return {
        icon: (
          <Globe width={iconSize} height={iconSize} color={BASE_COLORS.white} />
        ),
        title: `No ${selectedLanguage} content`,
        message:
          "This language doesn't have any pronunciation guides yet. Try selecting a different language.",
        iconColor: BASE_COLORS.blue,
      };
    }

    // Case 4: Generic fallback
    return {
      icon: (
        <Search width={iconSize} height={iconSize} color={BASE_COLORS.white} />
      ),
      title: "No content available",
      message: "Please select a language to view pronunciation guides.",
      iconColor: BASE_COLORS.placeholderText,
    };
  };

  const { icon, title, message, iconColor } = getEmptyStateContent();

  // Get responsive dimensions
  const getResponsiveDimensions = () => {
    return {
      paddingVertical: isSmallScreen ? 60 : isMediumScreen ? 70 : 80,
      paddingHorizontal: isSmallScreen ? 16 : 20,
      iconPadding: isSmallScreen ? 10 : 12,
      borderRadius: isSmallScreen ? 40 : 50,
      marginBottom: isSmallScreen ? 16 : 20,
      titleMarginBottom: isSmallScreen ? 8 : 12,
      maxWidth: isSmallScreen ? 280 : 300,
      lineHeight: isSmallScreen ? 18 : 20,
    };
  };

  const dimensions = getResponsiveDimensions();

  return (
    <View
      style={[
        styles.emptyStateContainer,
        {
          paddingVertical: dimensions.paddingVertical,
          paddingHorizontal: dimensions.paddingHorizontal,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: iconColor,
            padding: dimensions.iconPadding,
            borderRadius: dimensions.borderRadius,
            marginBottom: dimensions.marginBottom,
          },
        ]}
      >
        {icon}
      </View>
      <Text
        style={[
          styles.emptyStateTitle,
          { marginBottom: dimensions.titleMarginBottom },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.emptyStateText,
          {
            maxWidth: dimensions.maxWidth,
            lineHeight: dimensions.lineHeight,
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    // paddingVertical and paddingHorizontal are set dynamically via style prop
  },
  iconWrapper: {
    // padding, borderRadius, and marginBottom are set dynamically via style prop
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontFamily: POPPINS_FONT.medium, // UPDATED: Use font constant
    fontSize: COMPONENT_FONT_SIZES.navigation.title, // UPDATED: Use navigation title size
    color: BASE_COLORS.white,
    // marginBottom is set dynamically via style prop
    textAlign: "center",
  },
  emptyStateText: {
    fontFamily: POPPINS_FONT.regular, // UPDATED: Use font constant
    fontSize: COMPONENT_FONT_SIZES.card.description, // UPDATED: Use card description size
    color: BASE_COLORS.borderColor,
    textAlign: "center",
    // maxWidth and lineHeight are set dynamically via style prop
  },
});

export default EmptyState;
