import React from "react";
import { View, TouchableOpacity } from "react-native";
import { CornerUpLeft } from "react-native-feather";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import { levelStyles as styles } from "@/styles/games/levels.styles";

interface LevelHeaderProps {
  title: string | string[] | undefined;
  onBack: () => void;
}

const LevelHeader: React.FC<LevelHeaderProps> = ({ title, onBack }) => {
  return (
    <Animatable.View
      animation="fadeInDown"
      duration={600}
      style={styles.headerContainer}
    >
      <View style={styles.headerGradient}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <CornerUpLeft width={17} height={17} color={BASE_COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Animatable.Text
              animation="fadeIn"
              delay={400}
              style={styles.headerTitle}
            >
              {title || "Levels"}
            </Animatable.Text>
            <Animatable.Text
              animation="fadeIn"
              delay={500}
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
