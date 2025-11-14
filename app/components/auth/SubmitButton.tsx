import React from "react";
import {
  View,
  Text,
  Animated,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { BASE_COLORS, TITLE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";

interface SubmitButtonProps {
  activeTab: "signin" | "signup";
  isLoading: boolean;
  onPress: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  activeTab,
  isLoading,
  onPress,
}) => (
  <Animated.View
    style={{
      width: "100%",
      borderRadius: 20,
      overflow: "hidden",
      marginVertical: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    }}
  >
    <TouchableOpacity
      activeOpacity={0.7}
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
    </TouchableOpacity>
  </Animated.View>
);

const styles = StyleSheet.create({
  submitButton: {
    paddingVertical: 7,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: BASE_COLORS.white,
    fontSize: COMPONENT_FONT_SIZES.button.medium,
    fontFamily: POPPINS_FONT.medium,
  },
});

export default SubmitButton;
