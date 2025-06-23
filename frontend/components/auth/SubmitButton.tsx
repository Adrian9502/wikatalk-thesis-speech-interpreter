import React from "react";
import {
  View,
  Text,
  Animated,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { TITLE_COLORS } from "@/constant/colors";

interface SubmitButtonProps {
  activeTab: "signin" | "signup";
  isLoading: boolean;
  buttonScale: Animated.Value;
  onPress: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  activeTab,
  isLoading,
  buttonScale,
  onPress,
}) => (
  <Animated.View
    style={{
      transform: [{ scale: buttonScale }],
      width: "100%",
      borderRadius: 16,
      overflow: "hidden",
      marginVertical: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    }}
  >
    <Pressable
      style={[styles.submitButton, { backgroundColor: TITLE_COLORS.customRed }]}
      disabled={isLoading}
      onPress={onPress}
    >
      <View style={styles.submitButtonContent}>
        {isLoading && (
          <ActivityIndicator
            style={{ marginRight: 10 }}
            size={20}
            color={TITLE_COLORS.customWhite}
          />
        )}
        <Text style={styles.submitButtonText}>
          {activeTab === "signin" ? "Sign In" : "Sign Up"}
        </Text>
      </View>
    </Pressable>
  </Animated.View>
);

const styles = StyleSheet.create({
  submitButton: {
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins-Medium",
  },
});

export default SubmitButton;
