import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useTutorial } from "@/hooks/useTutorial";
import useThemeStore from "@/store/useThemeStore";

interface TutorialSettingsProps {
  tutorialName?: string;
  onTutorialStart?: () => void;
}

const TutorialSettings: React.FC<TutorialSettingsProps> = ({
  tutorialName = "homepage",
  onTutorialStart,
}) => {
  const { activeTheme } = useThemeStore();
  const { hasSeenTutorial, resetTutorial, startTutorial } =
    useTutorial(tutorialName);

  const handleRestartTutorial = useCallback(() => {
    Alert.alert(
      "Restart Tutorial",
      "Would you like to restart the app tutorial? This will guide you through the main features again.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Start Tutorial",
          onPress: async () => {
            try {
              console.log("[TutorialSettings] Restarting tutorial");
              await resetTutorial();

              if (onTutorialStart) {
                onTutorialStart();
              }

              // Give a bit more time for the reset to take effect
              setTimeout(() => {
                console.log("[TutorialSettings] Starting tutorial after reset");
                startTutorial();
              }, 1000);
            } catch (error) {
              console.error(
                "[TutorialSettings] Error restarting tutorial:",
                error
              );
            }
          },
        },
      ]
    );
  }, [resetTutorial, startTutorial, onTutorialStart]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: activeTheme.backgroundColor },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: activeTheme.tabActiveColor }]}>
          App Tutorial
        </Text>
        <Text style={[styles.subtitle, { color: activeTheme.lightColor }]}>
          {hasSeenTutorial
            ? "You have completed the tutorial"
            : "Tutorial not completed yet"}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: activeTheme.secondaryColor,
            opacity: 1, // Always make button fully opaque and clickable
          },
        ]}
        onPress={handleRestartTutorial}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText]}>
          {hasSeenTutorial ? "Restart Tutorial" : "Start Tutorial"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 2,
    marginVertical: 2,
    padding: 2,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    marginBottom: 15,
  },
  title: {
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
  },
  button: {
    paddingVertical: 4,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 12,
    color: "white",
    fontFamily: "Poppins-Medium",
  },
});

export default TutorialSettings;
