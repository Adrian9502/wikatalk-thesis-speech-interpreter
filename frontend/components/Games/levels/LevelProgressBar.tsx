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
      <View style={styles.progressBarContainer}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Course Progress</Text>
          <Text style={styles.progressPercentage}>
            {Math.round(percentage)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <LinearGradient
            colors={["#8BC34A", "#4CAF50"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${percentage}%` }]}
          />
        </View>
      </View>
    </Animatable.View>
  );
};

export default LevelProgressBar;
