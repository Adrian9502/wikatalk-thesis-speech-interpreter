import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Animatable from "react-native-animatable";
import { AlertCircle, RefreshCw } from "react-native-feather";
import { BASE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";

interface ErrorDisplayProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorDisplay = React.memo(
  ({
    message = "Something went wrong. Please try again.",
    onRetry,
  }: ErrorDisplayProps) => {
    return (
      <Animatable.View
        animation="fadeIn"
        style={styles.container}
        useNativeDriver
      >
        <AlertCircle width={48} height={48} color={BASE_COLORS.error} />
        <Text style={styles.text}>{message}</Text>

        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <RefreshCw width={18} height={18} color={BASE_COLORS.white} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </Animatable.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    margin: 16,
  },
  text: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BASE_COLORS.blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  retryText: {
    fontSize: COMPONENT_FONT_SIZES.button.medium,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
  },
});

ErrorDisplay.displayName = "ErrorDisplay";
export default ErrorDisplay;
