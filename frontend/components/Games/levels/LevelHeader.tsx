import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { ArrowLeft } from "react-native-feather";
import * as Animatable from "react-native-animatable";
import { BASE_COLORS } from "@/constant/colors";
import { levelStyles as styles } from "@/styles/games/levels.styles";

interface LevelHeaderProps {
  title: string | string[] | undefined;
  onBack: () => void;
}

const LevelHeader: React.FC<LevelHeaderProps> = ({ title, onBack }) => {
  return (
    <Animatable.View animation="fadeIn" duration={500} style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <ArrowLeft width={24} height={24} color={BASE_COLORS.white} />
      </TouchableOpacity>
      <View>
        <Text style={styles.headerTitle}>{title || "Levels"}</Text>
        <Text style={styles.headerSubtitle}>Select a level to begin</Text>
      </View>
      <View style={{ width: 40 }} />
    </Animatable.View>
  );
};

export default LevelHeader;
