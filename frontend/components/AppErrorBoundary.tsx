import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useThemeStore from "@/store/useThemeStore";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error Boundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryUI error={this.state.error} onRetry={this.handleRetry} />
      );
    }

    return this.props.children;
  }
}

// Separate functional component to use hooks
interface ErrorBoundaryUIProps {
  error?: Error;
  onRetry: () => void;
}

const ErrorBoundaryUI: React.FC<ErrorBoundaryUIProps> = ({
  error,
  onRetry,
}) => {
  const { activeTheme } = useThemeStore();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: activeTheme.backgroundColor,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorTitle: {
      fontSize: COMPONENT_FONT_SIZES.card.title,
      fontFamily: POPPINS_FONT.medium,
      color: BASE_COLORS.white,
      marginBottom: 16,
      textAlign: "center",
    },
    errorMessage: {
      fontSize: COMPONENT_FONT_SIZES.card.subtitle,
      fontFamily: POPPINS_FONT.regular,
      color: BASE_COLORS.white,
      textAlign: "center",
      marginBottom: 24,
    },
    retryButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    retryButtonText: {
      fontSize: COMPONENT_FONT_SIZES.button.medium,
      fontFamily: POPPINS_FONT.medium,
      color: "#3B6FE5",
      textDecorationLine: "underline",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>
          {error?.message || "An unexpected error occurred"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
