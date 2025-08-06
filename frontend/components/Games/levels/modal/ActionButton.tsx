import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import modalSharedStyles from "@/styles/games/modalSharedStyles";

interface ActionButtonProps {
  onStart: () => void;
  isLoading: boolean;
  isAnimating: boolean;
  hasStarted: boolean;
  hasProgress: boolean;
  progressIsLoading?: boolean;
  styles: any;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onStart,
  isLoading,
  isAnimating,
  hasStarted,
  hasProgress,
  progressIsLoading = false,
  styles,
}) => {
  const isDisabled =
    isLoading || isAnimating || hasStarted || progressIsLoading;

  const showLoadingIndicator =
    isLoading || isAnimating || progressIsLoading || hasStarted;

  // FIXED: Better button text logic
  const getButtonText = () => {
    if (progressIsLoading) {
      return "Loading Progress...";
    }
    if (isLoading || isAnimating) {
      return "Loading...";
    }
    if (hasStarted) {
      return "Starting...";
    }
    return hasProgress ? "CONTINUE LEVEL" : "START LEVEL";
  };

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[modalSharedStyles.startAndCloseButton]}
        onPress={onStart}
        disabled={isDisabled}
        activeOpacity={isDisabled ? 1 : 0.8}
      >
        {/* NEW: Show activity indicator when loading */}
        {showLoadingIndicator ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={modalSharedStyles.startAndCloseText}>
              {getButtonText()}
            </Text>
          </View>
        ) : (
          <Text style={modalSharedStyles.startAndCloseText}>
            {getButtonText()}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(ActionButton);
