import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Search, Globe } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";

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

    // Case 1: No data available for the selected language
    if (!hasData && selectedLanguage) {
      return {
        icon: <Globe width={25} height={25} color={BASE_COLORS.white} />,
        title: `No ${selectedLanguage} data available`,
        message:
          "We're still working on adding content for this language. Please try another language or check back later.",
        iconColor: BASE_COLORS.orange,
      };
    }

    // Case 2: Search term provided but no results
    if (hasSearchTerm) {
      return {
        icon: <Search width={25} height={25} color={BASE_COLORS.white} />,
        title: "No results found",
        message: `No matches found for "${trimmedSearchTerm}". Try using different keywords or check your spelling.`,
        iconColor: BASE_COLORS.orange,
      };
    }

    // Case 3: No search term but language has no data
    if (selectedLanguage) {
      return {
        icon: <Globe width={25} height={25} color={BASE_COLORS.white} />,
        title: `No ${selectedLanguage} content`,
        message:
          "This language doesn't have any pronunciation guides yet. Try selecting a different language.",
        iconColor: BASE_COLORS.blue,
      };
    }

    // Case 4: Generic fallback
    return {
      icon: <Search width={25} height={25} color={BASE_COLORS.white} />,
      title: "No content available",
      message: "Please select a language to view pronunciation guides.",
      iconColor: BASE_COLORS.placeholderText,
    };
  };

  const { icon, title, message, iconColor } = getEmptyStateContent();

  return (
    <View style={styles.emptyStateContainer}>
      <View style={[styles.iconWrapper, { backgroundColor: iconColor }]}>
        {icon}
      </View>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  iconWrapper: {
    padding: 12,
    borderRadius: 50,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    color: BASE_COLORS.white,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: BASE_COLORS.borderColor,
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 20,
  },
});

export default EmptyState;
