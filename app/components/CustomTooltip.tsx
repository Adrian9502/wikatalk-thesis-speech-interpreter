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
  stepIndicator: {
    alignSelf: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  stepText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#333",
    textAlign: "center",
  },
  tooltipText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontFamily: "Poppins-Medium",
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 70,
  },
  skipButton: {
    backgroundColor: "#FFFFFF",
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
  },
  buttonText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#495057",
    textAlign: "center",
  },
  skipButtonText: {
    color: "#333",
  },
  primaryButtonText: {
    color: "#333",
  },
});

export default CustomTooltip;
