import React from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { levelStyles as styles } from "@/styles/games/levels.styles";

interface LevelProgressBarProps {
  percentage: number;
}

const LevelProgressBar: React.FC<LevelProgressBarProps> = ({ percentage }) => {
  return (
    <Animatable.View
      animation="fadeIn"
      duration={800}
      delay={100}
      style={styles.progressContainer}
    >
      {/* Progress header with more game-like styling */}
      <View style={styles.progressHeader}>
        <View style={styles.progressLabelContainer}>
          <Text style={styles.progressLabel}>Level Progress</Text>
          <Animatable.View
            animation={percentage === 100 ? "pulse" : undefined}
            iterationCount="infinite"
            style={styles.percentageBadge}
          >
            <Text style={styles.progressPercentage}>
              {Math.round(percentage)}%
            </Text>
          </Animatable.View>
        </View>
      </View>

      {/* Enhanced progress bar without animations */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressBarBackground}>
            <LinearGradient
              colors={["#8BC34A", "#4CAF50"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${percentage}%` }]}
            />
          </View>
        </View>
      </View>
    </Animatable.View>
  );
};

export default LevelProgressBar;
