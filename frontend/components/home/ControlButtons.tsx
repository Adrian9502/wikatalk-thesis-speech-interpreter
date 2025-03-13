import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
} from "react-native";
import { Trash2, Copy, Check, Info } from "react-native-feather";
interface ControlButtonsProps {
  // Basic properties
  showInfoHandler: (language: string, section: "top" | "bottom") => void;
  copyHandler: (text: string) => Promise<void>;
  clearTextHandler: (section: "top" | "bottom") => void;

  // Data needed for handlers
  languageValue: string;
  textValue: string;
  position: "top" | "bottom";

  // Optional props with default values
  buttonBgColor?: string;
  iconColor?: string;
  successColor?: string;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  // Basic properties
  showInfoHandler,
  copyHandler,
  clearTextHandler,

  // Data needed for handlers
  languageValue,
  textValue,
  position,

  // Optional props with default values
  buttonBgColor = "rgba(56, 128, 255, 0.08)",
  iconColor = "#3880ff",
  successColor = "#28A745",
}) => {
  // State to track if content was just copied
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Animation values
  const scaleAnim = useState(new Animated.Value(1))[0];
  const tooltipOpacity = useState(new Animated.Value(0))[0];

  // Handle copy with animation feedback
  const handleCopy = async () => {
    if (textValue.trim().length === 0) return;

    await copyHandler(textValue);
    setCopied(true);

    // Animate button when copied
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Reset after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Handle tooltip display
  const showButtonTooltip = (tooltipType: string) => {
    setShowTooltip(tooltipType);
    Animated.timing(tooltipOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Auto hide after 1.5 seconds
    setTimeout(() => {
      hideButtonTooltip();
    }, 1500);
  };

  const hideButtonTooltip = () => {
    Animated.timing(tooltipOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowTooltip(null));
  };

  // Get tooltip text based on type
  const getTooltipText = () => {
    switch (showTooltip) {
      case "info":
        return "Language info";
      case "copy":
        return copied ? "Copied!" : "Copy text";
      case "clear":
        return "Clear text";
      default:
        return "";
    }
  };

  const isTextEmpty = textValue.trim().length === 0;

  return (
    <View style={styles.container}>
      {/* Tooltip */}
      {showTooltip && (
        <Animated.View style={[styles.tooltip, { opacity: tooltipOpacity }]}>
          <Text style={styles.tooltipText}>{getTooltipText()}</Text>
        </Animated.View>
      )}

      {/* Language info button */}
      <TouchableOpacity
        onPress={() => showInfoHandler(languageValue, position)}
        onLongPress={() => showButtonTooltip("info")}
        activeOpacity={0.7}
        style={[styles.iconButton, { backgroundColor: buttonBgColor }]}
      >
        <Info width={20} height={20} strokeWidth={2.2} stroke={iconColor} />
      </TouchableOpacity>

      {/* Copy Icon with success feedback */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handleCopy}
          onLongPress={() => showButtonTooltip("copy")}
          activeOpacity={0.7}
          disabled={isTextEmpty}
          style={[
            styles.iconButton,
            {
              backgroundColor: copied ? `${successColor}20` : buttonBgColor,
              opacity: isTextEmpty ? 0.5 : 1,
            },
          ]}
        >
          {copied ? (
            <Check
              width={20}
              height={20}
              strokeWidth={2.5}
              stroke={successColor}
            />
          ) : (
            <Copy width={20} height={20} strokeWidth={2.2} stroke={iconColor} />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Delete Icon */}
      <TouchableOpacity
        onPress={() => clearTextHandler(position)}
        onLongPress={() => showButtonTooltip("clear")}
        activeOpacity={0.7}
        disabled={isTextEmpty}
        style={[
          styles.iconButton,
          {
            backgroundColor: buttonBgColor,
            opacity: isTextEmpty ? 0.5 : 1,
          },
        ]}
      >
        <Trash2 width={20} height={20} strokeWidth={2.2} stroke={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 5,
    position: "relative",
  },
  iconButton: {
    padding: 12,
    borderRadius: 14,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: 44,
    height: 44,
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    top: -40,
    right: 10,
    zIndex: 1000,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default ControlButtons;
