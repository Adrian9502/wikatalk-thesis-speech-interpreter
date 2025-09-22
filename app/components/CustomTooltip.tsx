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

interface CustomTooltipProps {
  labels?: {
    skip?: string;
    previous?: string;
    next?: string;
    finish?: string;
  };
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ labels = {} }) => {
  const { isFirstStep, isLastStep, currentStep, goToNext, goToPrev, stop } =
    useCopilot();

  const defaultLabels = {
    skip: "Skip",
    previous: "Previous",
    next: "Next",
    finish: "Finish",
    ...labels,
  };

  const tooltipText = currentStep?.text || "Tutorial step";

  return (
    <View style={styles.tooltipContainer}>
      {currentStep?.order && (
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step {currentStep.order}</Text>
        </View>
      )}

      <Text style={styles.tooltipText}>{tooltipText}</Text>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={stop}
            style={[styles.button, styles.skipButton]}
          >
            <Text style={[styles.buttonText, styles.skipButtonText]}>
              {defaultLabels.skip}
            </Text>
          </TouchableOpacity>

          {!isFirstStep && (
            <TouchableOpacity onPress={goToPrev} style={styles.button}>
              <Text style={styles.buttonText}>{defaultLabels.previous}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => {
              if (isLastStep) {
                stop();
              } else {
                goToNext();
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
