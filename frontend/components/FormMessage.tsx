import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CloseButton from "./games/buttons/CloseButton";

interface FormMessageProps {
  message: string;
  type: "success" | "error" | "neutral";
  onDismiss?: () => void;
}

const FormMessage: React.FC<FormMessageProps> = ({
  message,
  type,
  onDismiss,
}) => {
  if (!message) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "rgba(22, 163, 74, 0.15)"; // Light green
      case "error":
        return "rgba(220, 38, 38, 0.15)"; // Light red
      default:
        return "rgba(59, 130, 246, 0.15)"; // Light blue
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "#16a34a"; // Green
      case "error":
        return "#dc2626"; // Red
      default:
        return "#3b82f6"; // Blue
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "alert-circle";
      default:
        return "information-circle";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.content}>
        <Ionicons
          name={getIcon()}
          size={20}
          color={getTextColor()}
          style={styles.icon}
        />
        <Text style={[styles.message, { color: getTextColor() }]}>
          {message}
        </Text>
      </View>
      {onDismiss && (
        <CloseButton
          size={17}
          onPress={onDismiss}
          color={getTextColor()}
          hasBackground={false}
        ></CloseButton>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 16,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  message: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    flex: 1,
  },
  closeButton: {
    padding: 1,
  },
});

export default FormMessage;
