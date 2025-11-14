import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { BASE_COLORS } from "@/constants/colors";
import { AlertTriangle, RefreshCw } from "react-native-feather";
import { POPPINS_FONT, COMPONENT_FONT_SIZES } from "@/constants/fontSizes";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Check for different screen sizes
const isSmallScreen = screenWidth <= 384 && screenHeight <= 1280; // Nexus 4 and similar
const isMediumScreen = screenWidth <= 414 && screenHeight <= 896; // iPhone X/11 and similar

interface ErrorStateProps {
  onRetry: () => void;
}

const ErrorState = ({ onRetry }: ErrorStateProps) => {
  // Get responsive dimensions
  const getResponsiveDimensions = () => {
    return {
      iconSize: isSmallScreen ? 20 : isMediumScreen ? 23 : 25,
      iconPadding: isSmallScreen ? 8 : 10,
      borderRadius: isSmallScreen ? 40 : 50,
      marginBottom: isSmallScreen ? 16 : 20,
      titleMarginTop: isSmallScreen ? 12 : 16,
      textMarginTop: isSmallScreen ? 6 : 8,
      textMarginBottom: isSmallScreen ? 20 : 24,
      buttonPaddingHorizontal: isSmallScreen ? 16 : 20,
      buttonPaddingVertical: isSmallScreen ? 10 : 12,
      buttonBorderRadius: isSmallScreen ? 16 : 20,
      buttonIconSize: isSmallScreen ? 16 : 18,
      gap: isSmallScreen ? 6 : 8,
    };
  };

  const dimensions = getResponsiveDimensions();

  return (
    <View style={styles.errorContainer}>
      <View
        style={[
          styles.iconContainer,
          {
            padding: dimensions.iconPadding,
            borderRadius: dimensions.borderRadius,
            marginBottom: dimensions.marginBottom,
          },
        ]}
      >
        <AlertTriangle
          width={dimensions.iconSize}
          height={dimensions.iconSize}
          color={BASE_COLORS.white}
        />
      </View>
      <Text
        style={[styles.errorTitle, { marginTop: dimensions.titleMarginTop }]}
      >
        Oops!
      </Text>
      <Text
        style={[
          styles.errorText,
          {
            marginTop: dimensions.textMarginTop,
            marginBottom: dimensions.textMarginBottom,
          },
        ]}
      >
        We couldn't load the pronunciation data
      </Text>
      <TouchableOpacity
        style={[
          styles.retryButton,
          {
            paddingHorizontal: dimensions.buttonPaddingHorizontal,
            paddingVertical: dimensions.buttonPaddingVertical,
            borderRadius: dimensions.buttonBorderRadius,
            gap: dimensions.gap,
          },
        ]}
        onPress={onRetry}
      >
        <RefreshCw
          width={dimensions.buttonIconSize}
          height={dimensions.buttonIconSize}
          color={BASE_COLORS.white}
        />
        <Text style={styles.retryButtonText}>Refresh Data</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    backgroundColor: BASE_COLORS.orange,
    // padding, borderRadius, and marginBottom are set dynamically via style prop
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorTitle: {
    fontSize: COMPONENT_FONT_SIZES.navigation.title, // UPDATED: Use navigation title size
    fontFamily: POPPINS_FONT.medium, // UPDATED: Use font constant
    color: BASE_COLORS.white,
    // marginTop is set dynamically via style prop
  },
  errorText: {
    // marginTop and marginBottom are set dynamically via style prop
    fontSize: COMPONENT_FONT_SIZES.card.description, // UPDATED: Use card description size
    fontFamily: POPPINS_FONT.regular, // UPDATED: Use font constant
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  retryButton: {
    justifyContent: "center",
    flexDirection: "row",
    // gap, paddingHorizontal, paddingVertical, and borderRadius are set dynamically via style prop
    alignItems: "center",
    backgroundColor: BASE_COLORS.blue,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  retryButtonText: {
    fontFamily: POPPINS_FONT.regular, // UPDATED: Use font constant
    fontSize: COMPONENT_FONT_SIZES.card.description, // UPDATED: Use card description size
    color: BASE_COLORS.white,
  },
});

export default ErrorState;
