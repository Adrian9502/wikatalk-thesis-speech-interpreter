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
import { useCopilot } from "react-native-copilot";

const { width: screenWidth } = Dimensions.get("window");

// Updated interface to match TooltipProps from react-native-copilot
interface CustomTooltipProps {
  labels?: Partial<Record<"skip" | "previous" | "next" | "finish", string>>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = (props) => {
  console.log("CustomTooltip props:", props);

  // Use the useCopilot hook to get step data and navigation functions
  const { isFirstStep, isLastStep, currentStep, goToNext, goToPrev, stop } =
    useCopilot();

  const { labels = {} } = props;

  // Default labels
  const defaultLabels = {
    skip: "Skip",
    previous: "Previous",
    next: "Next",
    finish: "Finish",
    ...labels,
  };

  // Get tooltip text from currentStep
  const tooltipText = currentStep?.text || "Tutorial step";

  console.log("Current step from useCopilot:", currentStep);
  console.log("Tooltip text:", tooltipText);

  // Handle button actions using useCopilot functions
  const onSkip = () => {
    console.log("Skip button pressed");
    stop();
  };

  const onPrevious = () => {
    console.log("Previous button pressed");
    goToPrev();
  };

  const onNext = () => {
    console.log("Next button pressed");
    if (isLastStep) {
      stop();
    } else {
      goToNext();
    }
  };

  return (
    <View style={styles.tooltipContainer}>
      {/* Step indicator */}
      {currentStep?.order && (
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step {currentStep.order}</Text>
        </View>
      )}

      {/* Tooltip content */}
      <Text style={styles.tooltipText}>{tooltipText}</Text>

      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        {/* Skip/Previous/Next button row */}
        <View style={styles.buttonRow}>
          {/* Skip button  */}
          <TouchableOpacity
            onPress={onSkip}
            style={[styles.button, styles.skipButton]}
          >
            <Text style={[styles.buttonText, styles.skipButtonText]}>
              {defaultLabels.skip}
            </Text>
          </TouchableOpacity>
          {/* Previous button - only show if not first step */}
          {!isFirstStep && (
            <TouchableOpacity onPress={onPrevious} style={styles.button}>
              <Text style={styles.buttonText}>{defaultLabels.previous}</Text>
            </TouchableOpacity>
          )}

          {/* Next/Finish button */}
          <TouchableOpacity
            onPress={onNext}
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
    // backgroundColor: "#3B6FE5",
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
    // borderWidth: 1,
    // borderColor: "#f0f0f0",
    // These are key additions to prevent the default wrapper styling
    alignSelf: "center",
    position: "relative",
  },
  stepIndicator: {
    alignSelf: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  stepText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.darkText,
    textAlign: "center",
  },
  tooltipText: {
    fontSize: FONT_SIZES.lg,
    color: BASE_COLORS.white,
    fontFamily: POPPINS_FONT.medium,
    marginBottom: 8,
    textAlign: "center",
  },
  buttonContainer: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
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
