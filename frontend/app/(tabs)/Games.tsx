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
import { Calendar, Zap, AlignCenter, Edit3, Star } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import { usePronunciationStore } from "@/store/usePronunciationStore";
import WordOfDayModal from "@/components/Games/WordOfDayModal";
import * as Animatable from "react-native-animatable"; // You'll need to install this package

const { width } = Dimensions.get("window");

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
  const [selectedGame, setSelectedGame] = useState(null);

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

  const gameOptions = [
    {
      id: "multipleChoice",
      title: "Multiple Choice Quiz",
      icon: <Zap width={28} height={28} color={BASE_COLORS.white} />,
      color: BASE_COLORS.blue,
      description: "Test your knowledge with fun multiple-choice questions",
      route: "/(games)/MultipleChoice",
      animation: "bounceIn",
      delay: 100,
    },
    {
      id: "identification",
      title: "Word Identification",
      icon: <AlignCenter width={28} height={28} color={BASE_COLORS.white} />,
      color: BASE_COLORS.orange,
      description: "Identify the correct words in context",
      route: "/(games)/Identification",
      animation: "bounceIn",
      delay: 200,
    },
    {
      id: "fillBlanks",
      title: "Fill in the Blanks",
      icon: <Edit3 width={28} height={28} color={BASE_COLORS.white} />,
      color: BASE_COLORS.success,
      description: "Complete sentences with the right words",
      route: "/(games)/FillInTheBlank",
      animation: "bounceIn",
      delay: 300,
    },
  ];

  const handleGamePress = (route: any) => {
    // Add some haptic feedback here if desired
    router.push(route);
  };

  return (
    <View
      style={[styles.wrapper, { backgroundColor: activeTheme.backgroundColor }]}
    >
      <SafeAreaView style={[dynamicStyles.container, styles.container]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Animated Header */}
          <Animatable.View
            animation="fadeIn"
            duration={800}
            style={styles.header}
          >
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Learning Games</Text>
              <Text style={styles.headerSubtitle}>
                Master language through play
              </Text>
            </View>
          </Animatable.View>

          {/* Word of the Day Card - Top section */}
          <Animatable.View animation="fadeInUp" duration={800} delay={100}>
            <TouchableOpacity
              style={styles.wordOfDayCard}
              activeOpacity={0.8}
              onPress={() => setWordOfDayModalVisible(true)}
            >
              <View style={styles.wordOfDayGradient}>
                <View style={styles.wordOfDayContent}>
                  <View style={styles.wordOfDayIconContainer}>
                    <Calendar
                      width={28}
                      height={28}
                      color={BASE_COLORS.white}
                    />
                  </View>
                  <View style={styles.wordOfDayTextContainer}>
                    <Text style={styles.wordOfDayTitle}>Word of the Day</Text>
                    <Text style={styles.wordOfDaySubtitle}>
                      {wordOfTheDay ? wordOfTheDay.english : "Loading..."}
                    </Text>
                    <View style={styles.wordOfDayTagContainer}>
                      <Text style={styles.wordOfDayDescription}>
                        Tap to hear pronunciation
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animatable.View>

          {/* Game modes - Main section */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={300}
            style={styles.gamesContainer}
          >
            <Text style={styles.gamesSectionTitle}>Choose Your Challenge</Text>

            {gameOptions.map((game, index) => (
              <Animatable.View
                key={game.id}
                animation={game.animation}
                delay={game.delay}
              >
                <TouchableOpacity
                  style={[
                    styles.gameCard,
                    { backgroundColor: game.color + "15" },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleGamePress(game.route)}
                >
                  <View
                    style={[
                      styles.gameCardIcon,
                      { backgroundColor: game.color },
                    ]}
                  >
                    {game.icon}
                  </View>
                  <View style={styles.gameCardContent}>
                    <Text style={styles.gameCardTitle}>{game.title}</Text>
                    <Text style={styles.gameCardDescription}>
                      {game.description}
                    </Text>
                  </View>
                  <View
                    style={[styles.playButton, { backgroundColor: game.color }]}
                  >
                    <Text style={styles.playButtonText}>PLAY</Text>
                  </View>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </Animatable.View>
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

export default Games;
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.8,
  },
  wordOfDayCard: {
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  wordOfDayGradient: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: BASE_COLORS.blue,
    borderRadius: 24,
    position: "relative",
  },
  wordOfDayContent: {
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Semi-transparent overlay
  },
  wordOfDayIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  wordOfDayTextContainer: {
    flex: 1,
  },
  wordOfDayTitle: {
    fontSize: 17,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  wordOfDaySubtitle: {
    fontSize: 26,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 5,
  },
  wordOfDayTagContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  wordOfDayDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
  },
  gamesContainer: {
    marginBottom: 16,
  },
  gamesSectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 16,
  },
  gameCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  gameCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  gameCardContent: {
    flex: 1,
  },
  gameCardTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  gameCardDescription: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.7,
  },
  playButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
  },
});
