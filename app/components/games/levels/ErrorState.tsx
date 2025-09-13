import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AlertTriangle, RefreshCw } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import { levelStyles as styles } from "@/styles/games/levels.styles";

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <View style={styles.errorContainer}>
      <AlertTriangle width={40} height={40} color={BASE_COLORS.error} />
      <Text style={styles.errorTitle}>Unable to Load Levels</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <RefreshCw width={20} height={20} color={BASE_COLORS.white} />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ErrorState;
