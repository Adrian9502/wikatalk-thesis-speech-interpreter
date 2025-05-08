import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";

// Import game components
import MultipleChoice from "@/app/(games)/MultipleChoice";
import Identification from "@/app/(games)/Identification";
import FillInTheBlank from "@/app/(games)/FillInTheBlank";

const Questions = () => {
  const params = useLocalSearchParams();
  const gameMode = params.gameMode as string;
  const levelId = params.levelId as string;
  const gameTitle = params.gameTitle as string;

  const { activeTheme } = useThemeStore();

  // Render the appropriate game component based on the mode
  const renderGameComponent = () => {
    switch (gameMode) {
      case "multipleChoice":
        return <MultipleChoice levelId={levelId} />;
      case "identification":
        return <Identification levelId={levelId} />;
      case "fillBlanks":
        return <FillInTheBlank levelId={levelId} />;
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unknown game mode: {gameMode}</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: activeTheme.backgroundColor },
      ]}
    >
      {renderGameComponent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 20,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: BASE_COLORS.blue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: BASE_COLORS.white,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
  },
});

export default Questions;
