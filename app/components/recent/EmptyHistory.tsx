import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BASE_COLORS, TITLE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";
import { TabType } from "@/types/types";
import { getTabIcon } from "@/utils/recent/getTabIcon";
import useThemeStore from "@/store/useThemeStore";

// Get screen height for proper centering
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface EmptyStateProps {
  tabType: TabType;
}

const EmptyHistory: React.FC<EmptyStateProps> = ({ tabType }) => {
  const { activeTheme } = useThemeStore();

  const getEmptyMessage = (type: TabType) => {
    switch (type) {
      case "Speech":
        return {
          title: "No Speech Translations",
          description: "Start translating with speech to see your history here",
        };
      case "Translate":
        return {
          title: "No Text Translations",
          description: "Start translating text to see your history here",
        };
      case "Scan":
        return {
          title: "No Scanned Translations",
          description: "Start scanning text to see your history here",
        };
      default:
        return {
          title: "No Translations",
          description: "Start translating to see your history here",
        };
    }
  };

  const { title, description } = getEmptyMessage(tabType);

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <View
          style={[
            styles.emptyIconContainer,
            { backgroundColor: activeTheme.secondaryColor },
          ]}
        >
          <Feather
            name={getTabIcon(tabType)}
            size={24}
            color={TITLE_COLORS.customWhite}
          />
        </View>
        <Text
          style={[styles.emptyTitle, { color: activeTheme.tabActiveColor }]}
        >
          {title}
        </Text>
        <Text style={styles.emptyDescription}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    minHeight: SCREEN_HEIGHT * 0.4,
  },
  emptyContent: {
    alignItems: "center",
    maxWidth: 280,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.medium,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: COMPONENT_FONT_SIZES.card.description,
    fontFamily: POPPINS_FONT.regular,
    color: BASE_COLORS.placeholderText,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default EmptyHistory;
