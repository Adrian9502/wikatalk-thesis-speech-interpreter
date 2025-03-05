import React from "react";
import { Snackbar, Text } from "react-native-paper";
interface CustomSnackbarProps {
  visible: boolean;
  message: string;
  type: "error" | "success" | "neutral";
  onDismiss: () => void;
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({
  visible,
  message,
  type,
  onDismiss,
}) => {
  // Define text colors based on type
  const getTextColor = () => {
    switch (type) {
      case "success":
        return "#008000"; // Green
      case "error":
        return "#FF0000"; // Red
      case "neutral":
      default:
        return "#10b981"; // Emerald
    }
  };

  const textColor = getTextColor();

  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={3000}
      style={{
        backgroundColor: "#fff", // White background
      }}
      action={{
        label: "Close",
        onPress: onDismiss,
        labelStyle: { color: "#10b981" },
      }}
    >
      <Text style={{ color: textColor }}>{message}</Text>
    </Snackbar>
  );
};

export default CustomSnackbar;
