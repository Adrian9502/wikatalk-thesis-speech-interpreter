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
    stopTutorial,
    currentStepIndex,
    currentTutorial,
    // NEW: Language state and toggle
    isTagalog,
    toggleLanguage,
  } = useTutorial();

  const defaultLabels = {
    skip: "Skip",
    previous: "Previous",
    next: "Next",
    finish: "Finish",
    ...labels,
  };

  // NEW: Get the appropriate text based on language selection
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

        {/* NEW: Language toggle button */}
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
          <TouchableOpacity
            onPress={stopTutorial}
            style={[styles.button, styles.skipButton]}
          >
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
              if (isLastStep) {
                stopTutorial();
              } else {
                nextStep();
              }
            }}
            style={[
              styles.button,
              styles.primaryButton,
              isFirstStep && styles.singleButton,
            ]}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>
              {isLastStep ? defaultLabels.finish : defaultLabels.next}
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
  // NEW: Header container for step indicator and language toggle
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  stepIndicator: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  stepText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.darkText,
    textAlign: "center",
  },
  // NEW: Language toggle button styles
  languageToggle: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
    lineHeight: FONT_SIZES.lg * 1.3, // Better line spacing for readability
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
    backgroundColor: "#f8f9fa",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 20,
    minWidth: 70,
    maxWidth: 80,
  },
  skipButton: {
    backgroundColor: BASE_COLORS.white,
  },
  primaryButton: {
    backgroundColor: "#FFF",
  },
  buttonText: {
    fontSize: COMPONENT_FONT_SIZES.button.small,
    fontFamily: POPPINS_FONT.medium,
    color: "#495057",
    textAlign: "center",
  },
  skipButtonText: {
    color: "#333",
  },
  primaryButtonText: {
    color: BASE_COLORS.darkText,
  },
});

export default CustomTooltip;
