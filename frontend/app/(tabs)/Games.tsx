import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Calendar, Volume2 } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import { usePronunciationStore } from "@/store/usePronunciationStore";
import WordOfDayModal from "@/components/Games/WordOfDayModal";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { GameRoute } from "@/types/gamesTypes";
import gameOptions from "@/utils/Games/gameOptions";

const Games = () => {
  // Theme store
  const { activeTheme } = useThemeStore();
  const dynamicStyles = getGlobalStyles(activeTheme.backgroundColor);

  // Word of the Day state and functions
  const {
    wordOfTheDay,
    isWordOfDayPlaying,
    isAudioLoading,
    getWordOfTheDay,
    playWordOfDayAudio,
    fetchPronunciations,
    pronunciationData,
  } = usePronunciationStore();
  const [wordOfDayModalVisible, setWordOfDayModalVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      // Check if we need to fetch the pronunciation data
      if (pronunciationData.length === 0) {
        await fetchPronunciations();
      }
      // After making sure data is loaded, get word of the day
      if (!wordOfTheDay) {
        getWordOfTheDay();
      }
    };

    loadData();
  }, []);

  const handleGamePress = (route: GameRoute) => {
    // Add some haptic feedback here if desired
    router.push(route);
  };

  return (
    <View
      style={[styles.wrapper, { backgroundColor: activeTheme.backgroundColor }]}
    >
      {/* Decorative Background Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      <SafeAreaView style={[dynamicStyles.container, styles.container]}>
        {/* Page Header */}
        <Animatable.View
          animation="fadeIn"
          duration={800}
          style={styles.pageHeader}
        >
          <View>
            <Text style={styles.pageTitle}>Game Challenges</Text>
            <Text style={styles.pageSubtitle}>
              Select a game to improve your skills
            </Text>
          </View>
        </Animatable.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Word of the Day Card - Moved to Top */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={100}
            style={styles.wordOfDayContainer}
          >
            <View style={styles.wordOfDaySectionHeader}>
              <Text style={styles.wordOfDaySectionTitle}>Word of the Day</Text>
              <Text style={styles.wordOfDaySectionSubtitle}>
                Learn something new every day
              </Text>
            </View>
            <TouchableOpacity
              style={styles.wordOfDayCard}
              activeOpacity={0.8}
              onPress={() => setWordOfDayModalVisible(true)}
            >
              <LinearGradient
                colors={["#3B82F6", "#1D4ED8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.wordGradient}
              >
                {/* Decorative Elements */}
                <View style={styles.decorativeShape1} />
                <View style={styles.decorativeShape2} />

                <View style={styles.wordHeader}>
                  <View style={styles.calendarContainer}>
                    <Calendar
                      width={18}
                      height={18}
                      color={BASE_COLORS.white}
                    />
                    <Text style={styles.wordLabel}>WORD OF THE DAY</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.soundButton}
                    onPress={playWordOfDayAudio}
                  >
                    <Volume2 width={18} height={18} color={BASE_COLORS.white} />
                  </TouchableOpacity>
                </View>

                <View style={styles.wordContent}>
                  <Text style={styles.wordText}>
                    {wordOfTheDay ? wordOfTheDay.english : "Loading..."}
                  </Text>
                  <Text style={styles.wordDefinition}>
                    {wordOfTheDay && wordOfTheDay.translation
                      ? wordOfTheDay.translation
                      : "No Translation available"}
                  </Text>
                </View>

                <View style={styles.wordFooter}>
                  <Text style={styles.tapToExplore}>Tap to explore →</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

          {/* Games Section Header */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={150}
            style={styles.gamesSectionHeader}
          >
            <Text style={styles.gamesSectionTitle}>Games</Text>
            <Text style={styles.gamesSectionSubtitle}>
              Challenge yourself with these games
            </Text>
          </Animatable.View>

          {/* Game cards - Redesigned to be more compact but not too small */}
          <View style={styles.gamesContainer}>
            {gameOptions.map((game) => (
              <Animatable.View
                key={game.id}
                animation={game.animation}
                delay={game.delay}
                duration={800}
              >
                <TouchableOpacity
                  style={styles.gameCard}
                  activeOpacity={0.7}
                  onPress={() => handleGamePress(game.route)}
                >
                  <LinearGradient
                    colors={game.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gameCardGradient}
                  >
                    <View style={styles.gameCardContent}>
                      <View style={styles.gameIconContainer}>{game.icon}</View>
                      <View style={styles.gameTextContainer}>
                        <Text style={styles.gameCardTitle}>{game.title}</Text>
                        <Text
                          style={styles.gameCardDescription}
                          numberOfLines={2}
                        >
                          {game.description}
                        </Text>

                        {/* Difficulty and Play button */}
                        <View style={styles.gameCardActions}>
                          <View style={styles.difficultyBadge}>
                            <Text style={styles.difficultyText}>
                              {game.difficulty}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.playButton,
                              { backgroundColor: game.color },
                            ]}
                            onPress={() => handleGamePress(game.route)}
                          >
                            <Text style={styles.playButtonText}>PLAY</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        </ScrollView>

        {/* Word of the Day Modal */}
        {wordOfTheDay && (
          <WordOfDayModal
            visible={wordOfDayModalVisible}
            onClose={() => setWordOfDayModalVisible(false)}
            word={wordOfTheDay}
            onPlayPress={playWordOfDayAudio}
            isPlaying={isWordOfDayPlaying}
            isLoading={isAudioLoading && isWordOfDayPlaying}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: "relative",
  },
  decorativeCircle1: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${BASE_COLORS.blue}20`,
  },
  decorativeCircle2: {
    position: "absolute",
    top: height * 0.3,
    left: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${BASE_COLORS.orange}15`,
  },
  decorativeCircle3: {
    position: "absolute",
    bottom: -80,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: `${BASE_COLORS.success}15`,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.8,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Word of the Day Styles
  wordOfDayContainer: {
    marginBottom: 25,
  },
  wordOfDaySectionHeader: {
    marginBottom: 12,
  },
  wordOfDaySectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  wordOfDaySectionSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.7,
  },
  wordOfDayCard: {
    borderRadius: 16,
    overflow: "hidden",
    height: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  wordGradient: {
    padding: 16,
    height: "100%",
    justifyContent: "space-between",
    position: "relative",
  },
  decorativeShape1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  decorativeShape2: {
    position: "absolute",
    bottom: -30,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  wordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calendarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  wordLabel: {
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  soundButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  wordContent: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 6,
  },
  wordText: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  wordDefinition: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.9,
  },
  wordFooter: {
    alignItems: "flex-end",
  },
  tapToExplore: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    opacity: 0.9,
  },

  // Games Section Styles
  gamesSectionHeader: {
    marginBottom: 16,
  },
  gamesSectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  gamesSectionSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.7,
  },

  // Game Cards
  gamesContainer: {
    gap: 16,
  },
  gameCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  gameCardGradient: {
    borderRadius: 16,
  },
  gameCardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  gameIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  gameTextContainer: {
    flex: 1,
  },
  gameCardTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  gameCardDescription: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.9,
    marginBottom: 12,
  },
  gameCardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficultyBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
  },
  playButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
  },
});

export default Games;
