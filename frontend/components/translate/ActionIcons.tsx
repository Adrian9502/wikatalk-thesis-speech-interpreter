import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { Trash, Copy, Check, Volume2 } from "react-native-feather";

interface ActionIconsProps {
  text: string;
  handleClearText?: () => void;
  copyToClipboard?: (
    text: string,
    key: "copiedSource" | "copiedTarget"
  ) => void;
  handleSpeech?: () => void;
  copied?: boolean;
  isSpeaking?: boolean;
  showDelete?: boolean;
  copyKey?: "copiedSource" | "copiedTarget";
  animationType?: "fade" | "zoom";
  primaryColor?: string;
}

const ActionIcons: React.FC<ActionIconsProps> = ({
  text,
  handleClearText,
  copyToClipboard,
  handleSpeech,
  copied = false,
  isSpeaking = false,
  showDelete = true,
  copyKey = "copiedSource",
  animationType = "fade",
  primaryColor = "#0038A8",
}) => {
  // Base button style function that returns different styles based on active state
  const getButtonStyle = (isActive: boolean) => ({
    ...styles.iconButton,
    backgroundColor: isActive
      ? primaryColor === "#0038A8"
        ? "#E6F0FF"
        : "#FEE2E2"
      : "#F3F4F6",
  });

  // Icon color based on active state
  const getIconColor = (isActive: boolean) =>
    isActive ? primaryColor : "#9CA3AF";

  // Select animation type
  const EnterAnimation = animationType === "fade" ? FadeIn : ZoomIn;
  const ExitAnimation = animationType === "fade" ? FadeOut : ZoomOut;

  return (
    <View style={styles.container}>
      {/* Delete Button - only show if showDelete is true */}
      {showDelete && handleClearText && (
        <TouchableOpacity
          onPress={handleClearText}
          disabled={!text}
          style={getButtonStyle(!!text)}
        >
          <Trash
            width={22}
            height={22}
            strokeWidth={2}
            stroke={getIconColor(!!text)}
          />
        </TouchableOpacity>
      )}

      {/* Copy Button */}
      {copyToClipboard && (
        <TouchableOpacity
          onPress={() => copyToClipboard(text, copyKey)}
          disabled={!text}
          style={getButtonStyle(!!text)}
        >
          <Animated.View entering={EnterAnimation} exiting={ExitAnimation}>
            {copied ? (
              <Check
                width={22}
                height={22}
                strokeWidth={2.5}
                stroke="#28A745"
              />
            ) : (
              <Copy
                width={22}
                height={22}
                strokeWidth={2}
                stroke={getIconColor(!!text)}
              />
            )}
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Speaker Button */}
      {handleSpeech && (
        <TouchableOpacity
          onPress={handleSpeech}
          disabled={!text.trim() || isSpeaking}
          style={getButtonStyle(!!text.trim() && !isSpeaking)}
        >
          <Volume2
            width={22}
            height={22}
            strokeWidth={2}
            stroke={getIconColor(!!text.trim() && !isSpeaking)}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  iconButton: {
    padding: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    marginRight: 10,
  },
});

export default ActionIcons;
