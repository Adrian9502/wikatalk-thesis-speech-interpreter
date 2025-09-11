import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowLeft } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import { useNavigation } from "expo-router";
import StatsContainer from "@/components/games/StatsContainer";
import {
  COMPONENT_FONT_SIZES,
  FONT_SIZES,
  POPPINS_FONT,
} from "@/constant/fontSizes";

interface RewardInfo {
  coins: number;
  label: string;
  difficulty: string;
  timeSpent: number;
  tier?: any;
}

type HeaderProps = {
  title: string;
  disableBack?: boolean;
  hideBack?: boolean;
  onBackPress?: () => void;

  showStats?: boolean;
  difficulty?: string;
  focusArea?: string;
  showTimer?: boolean;
  timerRunning?: boolean;
  initialTime?: number;
  isStarted?: boolean;
  variant?: "playing" | "completed";
  finalTime?: number;
  isCorrectAnswer?: boolean;
  currentRewardInfo?: RewardInfo | null;
};

const GameHeader = ({
  title,
  disableBack = false,
  hideBack = false,
  onBackPress,

  // Stats props
  showStats = false,
  difficulty,
  showTimer,
  timerRunning,
  initialTime,
  isStarted,
  variant,
}: HeaderProps & { levelId?: number | string; onTimerReset?: () => void }) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (disableBack) return;

    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <>
      {/* Main Header Row */}
      <View style={styles.headerRow}>
        {/* Left section - Back button */}
        {!hideBack ? (
          <TouchableOpacity
            style={[styles.backButton, disableBack && styles.disabledButton]}
            onPress={handleBackPress}
            disabled={disableBack}
            activeOpacity={0.7}
          >
            <ArrowLeft width={15} height={15} color={BASE_COLORS.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        {/* Center section - Title with game styling */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Right section - Placeholder for balance */}
        <View style={styles.placeholder} />
      </View>

      {/* Stats Section */}
      {showStats && difficulty && (
        <StatsContainer
          difficulty={difficulty}
          showTimer={showTimer}
          timerRunning={timerRunning}
          initialTime={initialTime}
          isStarted={isStarted}
          animationDelay={200}
          variant={variant}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  disabledButton: {
    opacity: 0.5,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: FONT_SIZES["3xl"],
    fontFamily: POPPINS_FONT.semiBold,
    color: BASE_COLORS.white,
    letterSpacing: 0.7,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});

export default GameHeader;
