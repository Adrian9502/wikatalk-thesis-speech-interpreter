import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";
import { AlertTriangle, RefreshCw } from "react-native-feather";

interface ErrorStateProps {
  onRetry: () => void;
}

const ErrorState = ({ onRetry }: ErrorStateProps) => {
  return (
    <View style={styles.errorContainer}>
      <View style={styles.iconContainer}>
        <AlertTriangle width={25} height={25} color={BASE_COLORS.white} />
      </View>
      <Text style={styles.errorTitle}>Oops!</Text>
      <Text style={styles.errorText}>
        We couldn't load the pronunciation data
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <RefreshCw width={18} height={18} color={BASE_COLORS.white} />
        <Text style={styles.retryButtonText}>Refresh Data</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    backgroundColor: BASE_COLORS.orange,
    padding: 10,
    borderRadius: 50,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginTop: 16,
  },
  errorText: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  retryButton: {
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: BASE_COLORS.blue,
    paddingHorizontal: 20,
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
    fontSize: 12,
    color: BASE_COLORS.white,
  },
});

export default ErrorState;
