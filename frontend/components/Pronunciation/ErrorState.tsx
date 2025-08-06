import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";

interface ErrorStateProps {
  onRetry: () => void;
}

const ErrorState = ({ onRetry }: ErrorStateProps) => {
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={60} color={BASE_COLORS.orange} />
      <Text style={styles.errorTitle}>Oops!</Text>
      <Text style={styles.errorText}>
        We couldn't load the pronunciation data
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginTop: 16,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: BASE_COLORS.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  retryButtonText: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: BASE_COLORS.white,
  },
});

export default ErrorState;
