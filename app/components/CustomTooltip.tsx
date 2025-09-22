import { BASE_COLORS } from "@/constant/colors";
import {
  COMPONENT_FONT_SIZES,
  FONT_SIZES,
  POPPINS_FONT,
} from "@/constant/fontSizes";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTutorial } from "@/context/TutorialContext";

const { width: screenWidth } = Dimensions.get("window");

interface CustomTooltipProps {
  labels?: {
    skip?: string;
    previous?: string;
    next?: string;
    finish?: string;
  };
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ labels = {} }) => {
  const {
    isFirstStep,
    isLastStep,
    currentStep,
    nextStep,
    previousStep,
    currentStepIndex,
    currentTutorial,
    // Language state and toggle
    isTagalog,
    toggleLanguage,
    // NEW: Skip all tutorials function
    skipAllTutorials,
  } = useTutorial();

  const defaultLabels = {
    skip: "Skip All", // CHANGED: Make it clear this skips everything
    previous: "Previous",
    next: "Next",
    finish: "Finish",
    ...labels,
  };

  // Check if current step has navigation action
  const hasNavigationAction =
    currentStep?.navigationAction?.type === "navigate_tab";

  // Get appropriate button text based on navigation action
  const getActionButtonText = () => {
    if (hasNavigationAction && currentStep?.navigationAction) {
      const tabName = currentStep.navigationAction.tabName;
      return `Go to ${tabName}`;
    }
    return isLastStep ? defaultLabels.finish : defaultLabels.next;
  };

  // Get the appropriate text based on language selection
  const tooltipText = isTagalog
    ? currentStep?.tagalogText || currentStep?.text || "Tutorial step"
    : currentStep?.text || "Tutorial step";

  const stepOrder = currentStepIndex + 1;
  const totalSteps = currentTutorial?.steps.length || 1;

  return (
    <View style={styles.tooltipContainer}>
      {/* Header with step indicator and language toggle */}
      <View style={styles.headerContainer}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>
            Step {stepOrder} of {totalSteps}
          </Text>
        </View>

        {/* Language toggle button */}
        <TouchableOpacity
          onPress={toggleLanguage}
          style={styles.languageToggle}
          activeOpacity={0.7}
        >
          <Ionicons
            name="language-outline"
            size={16}
            color={BASE_COLORS.darkText}
          />
          <Text style={styles.languageToggleText}>
            {isTagalog ? "English" : "Tagalog"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tooltipText}>{tooltipText}</Text>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          {/* ENHANCED: Skip All button with better styling and clearer text */}
          <TouchableOpacity
            onPress={skipAllTutorials} // CHANGED: Use skipAllTutorials instead of stopTutorial
            style={[styles.button, styles.skipButton]}
          >
            <Ionicons
              name="close-circle-outline"
              size={14}
              color={BASE_COLORS.white}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.buttonText, styles.skipButtonText]}>
              {defaultLabels.skip}
            </Text>
          </TouchableOpacity>

          {!isFirstStep && (
            <TouchableOpacity onPress={previousStep} style={styles.button}>
              <Text style={styles.buttonText}>{defaultLabels.previous}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              if (isLastStep || hasNavigationAction) {
                nextStep(); // This will handle navigation or stopping
              } else {
                nextStep();
              }
            }}
            style={[
              styles.button,
              styles.primaryButton,
              isFirstStep && styles.singleButton,
              hasNavigationAction && styles.navigationButton,
            ]}
          >
            {hasNavigationAction && (
              <Ionicons
                name="arrow-forward"
                size={14}
                color={BASE_COLORS.darkText}
                style={{ marginRight: 4 }}
              />
            )}
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              {getActionButtonText()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltipContainer: {
    backgroundColor: "#3B6FE5",
    borderRadius: 20,
    maxWidth: screenWidth - 40,
    minWidth: 250,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    alignSelf: "center",
    position: "relative",
  },
  // Header container for step indicator and language toggle
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  stepIndicator: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    // flex: 1,
    // marginRight: 8,
  },
  stepText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.darkText,
    textAlign: "center",
  },
  // Language toggle button styles
  languageToggle: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 50,
    justifyContent: "center",
  },
  languageToggleText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.darkText,
  },
  tooltipText: {
    fontSize: FONT_SIZES.lg,
    color: BASE_COLORS.white,
    fontFamily: POPPINS_FONT.medium,
    marginBottom: 8,
    textAlign: "center",
    lineHeight: FONT_SIZES.lg * 1.3,
  },
  buttonContainer: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 12,
  },
  singleButton: {
    flex: 1,
  },
  button: {
    backgroundColor: BASE_COLORS.white,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 20,
    maxWidth: 110,
    minWidth: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  // ENHANCED: Better styling for skip button
  skipButton: {
    backgroundColor: BASE_COLORS.danger, // Red background to indicate "stop all"
    minWidth: 85, // Slightly wider for "Skip All" text
  },
  primaryButton: {
    backgroundColor: "#FFF",
  },
  navigationButton: {
    backgroundColor: BASE_COLORS.white,
    minWidth: 100,
  },
  buttonText: {
    fontSize: COMPONENT_FONT_SIZES.button.small,
    fontFamily: POPPINS_FONT.medium,
    color: "#495057",
    textAlign: "center",
  },
  // ENHANCED: White text for red skip button
  skipButtonText: {
    color: BASE_COLORS.white, // White text on red background
    fontFamily: POPPINS_FONT.semiBold, // Make it bold to emphasize
  },
  primaryButtonText: {
    color: BASE_COLORS.darkText,
  },
});

export default CustomTooltip;
