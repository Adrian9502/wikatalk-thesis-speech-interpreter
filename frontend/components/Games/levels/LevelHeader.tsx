import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ArrowLeft } from "react-native-feather";
import * as Animatable from "react-native-animatable";
import { router } from "expo-router"; // Add this import
import { BASE_COLORS } from "@/constant/colors";
import { levelStyles as styles } from "@/styles/games/levels.styles";

interface LevelHeaderProps {
  title: string;
  onBack: () => void;
}

const LevelHeader: React.FC<LevelHeaderProps> = ({ title, onBack }) => {
  // FIXED: Safe back navigation that clears the stack properly
  const handleBackPress = () => {
    try {
      console.log("[LevelHeader] Back button pressed");

      // Check if we can go back in the stack
      if (router.canGoBack()) {
        // If we have a back history, go back
        router.back();
      } else {
        // If no back history, go to main games screen
        router.replace("/(tabs)/Games");
      }
    } catch (error) {
      console.error("[LevelHeader] Navigation error:", error);
      // Fallback to replace navigation
      router.replace("/(tabs)/Games");
    }
  };

  return (
    <Animatable.View
      animation="fadeInDown"
      duration={600}
      style={styles.headerContainer}
    >
      <View style={styles.headerGradient}>
        <TouchableOpacity
          onPress={handleBackPress} // Use the fixed handler
          style={styles.backButton}
        >
          <ArrowLeft width={17} height={17} color={BASE_COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Animatable.Text
              animation="fadeIn"
              delay={300}
              style={styles.headerTitle}
            >
              {title || "Levels"}
            </Animatable.Text>
            <Animatable.Text
              animation="fadeIn"
              delay={300}
              style={styles.headerSubtitle}
            >
              Select a level to begin
            </Animatable.Text>
          </View>
        </View>

        <View style={{ width: 40 }} />
      </View>
    </Animatable.View>
  );
};

export default LevelHeader;
