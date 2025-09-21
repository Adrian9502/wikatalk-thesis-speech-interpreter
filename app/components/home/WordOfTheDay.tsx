import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_COLORS, HOMEPAGE_COLORS } from "@/constant/colors";
import {
  COMPONENT_FONT_SIZES,
  FONT_SIZES,
  POPPINS_FONT,
} from "@/constant/fontSizes";
import { Volume2, Calendar } from "react-native-feather";
import { usePronunciationStore } from "@/store/usePronunciationStore";
import useThemeStore from "@/store/useThemeStore";

import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";

const WordOfTheDay = React.memo(() => {
  const { wordOfTheDay, isWordOfDayPlaying, isAudioLoading, playWordOfDay } =
    usePronunciationStore();

  // If no word of the day is available yet
  if (!wordOfTheDay) {
    return null;
  }

  const { english, translation, language } = wordOfTheDay;

  // Format today's date since we don't have createdAt
  const formattedDate = format(new Date(), "MMMM d, yyyy");

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Word of the Day</Text>

      <LinearGradient
        colors={HOMEPAGE_COLORS.pronounce}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header with calendar icon */}
        <View style={styles.dateContainer}>
          <Calendar width={13} height={13} color="rgba(255, 255, 255, 0.8)" />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        {/* Word content area */}
        <View style={styles.wordContainer}>
          <View style={styles.wordTextContainer}>
            {/* Original word */}
            <Text style={styles.wordTitle}>{english}</Text>

            {/* Language */}
            <Text style={styles.languageText}>{language}</Text>

            {/* Translation */}
            <View style={styles.translationContainer}>
              <Text style={styles.translationLabel}>Meaning</Text>
              <Text style={styles.translationText}>{translation}</Text>
            </View>
          </View>

          {/* Play button */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={playWordOfDay}
            disabled={isWordOfDayPlaying}
            activeOpacity={0.7}
          >
            <View style={styles.playIconContainer}>
              <Ionicons
                name="volume-high-outline"
                size={24}
                color={isWordOfDayPlaying ? "rgba(255, 255, 255, 0.5)" : "#fff"}
              />
            </View>
            <Text style={styles.playText}>
              {isAudioLoading && isWordOfDayPlaying
                ? "Loading..."
                : isWordOfDayPlaying
                ? "Playing..."
                : "Listen"}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: COMPONENT_FONT_SIZES.home.sectionTitle,
    fontFamily: POPPINS_FONT.semiBold,
    marginBottom: 16,
    color: BASE_COLORS.white,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 20,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dateText: {
    fontFamily: POPPINS_FONT.medium,
    fontSize: FONT_SIZES.sm,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 6,
  },
  wordContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  wordTitle: {
    fontFamily: POPPINS_FONT.bold,
    fontSize: FONT_SIZES["3xl"],
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  languageText: {
    fontFamily: POPPINS_FONT.medium,
    fontSize: FONT_SIZES.xl,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  translationContainer: {
    marginTop: 4,
  },
  translationLabel: {
    fontFamily: POPPINS_FONT.medium,
    fontSize: COMPONENT_FONT_SIZES.home.statsLabel,
    color: "rgba(255, 255, 255, 0.7)",
  },
  translationText: {
    fontFamily: POPPINS_FONT.semiBold,
    fontSize: FONT_SIZES["3xl"],
    color: BASE_COLORS.white,
  },
  playButton: {
    alignItems: "center",
  },
  playIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  playText: {
    fontFamily: POPPINS_FONT.medium,
    fontSize: FONT_SIZES.lg,
    color: "rgba(255, 255, 255, 0.9)",
  },
});

WordOfTheDay.displayName = "WordOfTheDay";
export default WordOfTheDay;
