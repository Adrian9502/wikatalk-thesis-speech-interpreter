import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import modalSharedStyles from "@/styles/games/modalSharedStyles";

interface ActionButtonProps {
  onStart: () => void;
  isLoading: boolean;
  isAnimating: boolean;
  hasStarted: boolean;
  hasProgress: boolean;
  styles: any;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onStart,
  isLoading,
  isAnimating,
  hasStarted,
  hasProgress,
  styles,
}) => {
  const isDisabled = isLoading || isAnimating || hasStarted;

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[
          modalSharedStyles.startAndCloseButton,
          isDisabled && styles.disabledButton,
        ]}
        onPress={onStart}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={modalSharedStyles.startAndCloseText}>
            {hasProgress ? "CONTINUE LEVEL" : "START LEVEL"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default React.memo(ActionButton);
