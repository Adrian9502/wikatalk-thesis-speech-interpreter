import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import useThemeStore from "@/store/useThemeStore";
import { getGlobalStyles } from "@/styles/globalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Calendar,
  Volume2,
  Play,
  TrendingUp,
  Star,
  Target,
  Award,
} from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import { usePronunciationStore } from "@/store/usePronunciationStore";
import WordOfDayModal from "@/components/games/WordOfDayModal";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import gameOptions from "@/utils/games/gameOptions";
import useCoinsStore from "@/store/games/useCoinsStore";
import DailyRewardsModal from "@/components/games/rewards/DailyRewardsModal";
import CoinsDisplay from "@/components/games/rewards/CoinsDisplay";
import GameProgressModal from "@/components/games/GameProgressModal";
import { useUserProgress } from "@/hooks/useUserProgress";
import useGameStore from "@/store/games/useGameStore";
import { detectGameModeFromQuizId } from "@/utils/gameProgressUtils";
import {
  getTotalQuizCount,
  getQuizCountByMode,
  getAllQuizCounts,
  areAnyQuestionsLoaded,
} from "@/utils/quizCountUtils";

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

  // Coins store for daily rewards
  const {
    fetchCoinsBalance,
    isDailyRewardsModalVisible,
    showDailyRewardsModal,
    hideDailyRewardsModal,
    checkDailyReward,
  } = useCoinsStore();

  const [wordOfDayModalVisible, setWordOfDayModalVisible] = useState(false);
  const [progressModal, setProgressModal] = useState({
    visible: false,
    gameMode: "",
    gameTitle: "",
  });

  // MOVED: globalProgress declaration must come before useMemo that uses it
  const { progress: globalProgress } = useUserProgress("global");

  useEffect(() => {
    const loadData = async () => {
      if (pronunciationData.length === 0) {
        await fetchPronunciations();
      }
      if (!wordOfTheDay) {
        getWordOfTheDay();
      }
      await fetchCoinsBalance();
      await checkDailyReward();
    };
    loadData();
  }, []);

  useEffect(() => {
    const prefetchRewardsData = async () => {
      try {
        fetchCoinsBalance();
        checkDailyReward();
      } catch (err) {
        console.log("Background prefetch error:", err);
      }
    };
    prefetchRewardsData();
  }, []);

  // Ensure questions are loaded on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const { ensureQuestionsLoaded, questions } = useGameStore.getState();

        // Check if questions are already loaded
        const hasQuestions = Object.values(questions).some((gameMode) =>
          Object.values(gameMode).some(
            (difficulty) => Array.isArray(difficulty) && difficulty.length > 0
          )
        );

        if (!hasQuestions) {
          console.log("[Games] No questions found, forcing load...");
          await ensureQuestionsLoaded();

          // Verify questions were loaded
          const { questions: updatedQuestions } = useGameStore.getState();
          console.log("[Games] Questions after loading:", {
            multipleChoice: updatedQuestions.multipleChoice.easy?.length || 0,
            identification: updatedQuestions.identification.easy?.length || 0,
            fillBlanks: updatedQuestions.fillBlanks.easy?.length || 0,
          });
        } else {
          console.log("[Games] Questions already loaded");
        }
      } catch (error) {
        console.error("[Games] Error loading questions:", error);
      }
    };

    loadInitialData();
  }, []);

  // MEMOIZED: Game mode progress calculation
  const gameProgress = useMemo(() => {
    if (!Array.isArray(globalProgress)) {
      return {
        multipleChoice: {
          completed: 0,
          total: getQuizCountByMode("multipleChoice"),
        },
        identification: {
          completed: 0,
          total: getQuizCountByMode("identification"),
        },
        fillBlanks: {
          completed: 0,
          total: getQuizCountByMode("fillBlanks"),
        },
      };
    }

    console.log("[Games] Calculating progress for all modes...");

    // Get quiz counts from utility functions
    const totals = getAllQuizCounts();

    console.log("[Games] Quiz totals from utility:", totals);

    const results = {
      multipleChoice: {
        completed: 0,
        total: totals.multipleChoice,
      },
      identification: {
        completed: 0,
        total: totals.identification,
      },
      fillBlanks: {
        completed: 0,
        total: totals.fillBlanks,
      },
    };

    // Group progress entries by game mode
    const progressByMode: { [key: string]: any[] } = {
      multipleChoice: [],
      identification: [],
      fillBlanks: [],
    };

    globalProgress.forEach((entry: any) => {
      const detectedMode = detectGameModeFromQuizId(entry.quizId);
      if (detectedMode && progressByMode[detectedMode]) {
        progressByMode[detectedMode].push(entry);
      }
    });

    // Calculate completed count for each mode
    Object.keys(results).forEach((mode) => {
      const modeEntries = progressByMode[mode] || [];
      results[mode as keyof typeof results].completed = modeEntries.filter(
        (entry) => entry.completed
      ).length;
    });

    console.log("[Games] Progress calculated:", results);

    // If all totals are 0, questions might not be loaded - try to trigger loading
    if (!areAnyQuestionsLoaded()) {
      console.warn("[Games] No questions loaded - attempting to load");
      const { ensureQuestionsLoaded } = useGameStore.getState();
      ensureQuestionsLoaded().then(() => {
        console.log("[Games] Attempted to reload questions");
      });
    }

    return results;
  }, [globalProgress]);

  // OPTIMIZED: Get progress for specific game mode
  const getGameModeProgress = useCallback(
    (gameMode: string) => {
      return (
        gameProgress[gameMode as keyof typeof gameProgress] || {
          completed: 0,
          total: 50,
        }
      );
    },
    [gameProgress]
  );

  // MEMOIZED: Total completed count across all modes
  const totalCompletedCount = useMemo(() => {
    return Object.values(gameProgress).reduce(
      (sum, mode) => sum + mode.completed,
      0
    );
  }, [gameProgress]);

  // MEMOIZED: Total quiz count
  const totalQuizCount = useMemo(() => {
    return getTotalQuizCount();
  }, []); // No dependencies needed since function handles the logic

  const handleGamePress = (gameId: string, gameTitle: string) => {
    router.push({
      pathname: "/(games)/LevelSelection",
      params: {
        gameMode: gameId,
        gameTitle: gameTitle,
        levelId: "1",
      },
    });
  };

  const openRewardsModal = () => {
    showDailyRewardsModal();
  };

  const handleProgressPress = async (gameMode: string, gameTitle: string) => {
    try {
      const { ensureQuestionsLoaded } = useGameStore.getState();
      await ensureQuestionsLoaded();

      setProgressModal({
        visible: true,
        gameMode,
        gameTitle,
      });
    } catch (error) {
      console.error(
        "[Games] Error loading questions for progress modal:",
        error
      );
      setProgressModal({
        visible: true,
        gameMode,
        gameTitle,
      });
    }
  };

  const closeProgressModal = () => {
    setProgressModal({
      visible: false,
      gameMode: "",
      gameTitle: "",
    });
  };

  // Add this function to get completed count from all modes
  const getCompletedCount = () => {
    if (!Array.isArray(globalProgress)) return 0;
    return globalProgress.filter((p) => p.completed).length;
  };

  // DEBUGGING: Add temporary debug log to see what globalProgress contains
  useEffect(() => {
    if (globalProgress) {
      console.log("[Games] Debug - globalProgress:", {
        isArray: Array.isArray(globalProgress),
        length: Array.isArray(globalProgress) ? globalProgress.length : "N/A",
        sample: Array.isArray(globalProgress)
          ? globalProgress[0]
          : globalProgress,
      });
    }
  }, [globalProgress]);

  return (
    <View
      style={[styles.wrapper, { backgroundColor: activeTheme.backgroundColor }]}
    >
      {/* Enhanced Background with Multiple Layers */}
      <View style={styles.backgroundLayer1} />
      <View style={styles.backgroundLayer2} />
      <View style={styles.backgroundLayer3} />
      <View style={styles.backgroundLayer4} />

      {/* Floating Particles Effect */}
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={4000}
        style={styles.floatingParticle1}
      />
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={3000}
        style={styles.floatingParticle2}
      />
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={5000}
        style={styles.floatingParticle3}
      />

      <SafeAreaView style={[dynamicStyles.container, styles.container]}>
        {/* Enhanced Header with Welcome Message */}
        <Animatable.View
          animation="fadeInDown"
          duration={1000}
          style={styles.headerSection}
        >
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.mainTitle}>Game Challenges</Text>
            <Text style={styles.subtitle}>
              Choose your adventure and level up your skills
            </Text>
          </View>
          <Animatable.View animation="bounceIn" delay={500}>
            <CoinsDisplay onPress={openRewardsModal} />
          </Animatable.View>
        </Animatable.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Enhanced Word of the Day Section */}
          <Animatable.View
            animation="fadeInUp"
            duration={1000}
            delay={200}
            style={styles.featuredSection}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Star width={20} height={20} color="#FFD700" />
                <Text style={styles.sectionMainTitle}>Word of the Day</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Expand your vocabulary daily
              </Text>
            </View>

            <TouchableOpacity
              style={styles.wordOfTheDayCard}
              activeOpacity={0.9}
              onPress={() => setWordOfDayModalVisible(true)}
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.wordCardGradient}
              >
                {/* Enhanced Decorative Elements */}
                <View style={styles.wordDecoPattern1} />
                <View style={styles.wordDecoPattern2} />
                <View style={styles.wordDecoPattern3} />

                <View style={styles.wordCardHeader}>
                  <View style={styles.wordBadge}>
                    <Calendar width={14} height={14} color="#667eea" />
                    <Text style={styles.wordBadgeText}>TODAY'S WORD</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={playWordOfDayAudio}
                  >
                    {isAudioLoading && isWordOfDayPlaying ? (
                      <Animatable.View
                        animation="rotate"
                        iterationCount="infinite"
                        duration={1000}
                      >
                        <Volume2 width={16} height={16} color="#667eea" />
                      </Animatable.View>
                    ) : (
                      <Volume2 width={16} height={16} color="#667eea" />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.wordContent}>
                  <Text style={styles.wordMainText}>
                    {wordOfTheDay ? wordOfTheDay.english : "Loading..."}
                  </Text>
                  <Text style={styles.wordTranslation}>
                    {wordOfTheDay && wordOfTheDay.translation
                      ? wordOfTheDay.translation
                      : "Discovering meaning..."}
                  </Text>
                </View>

                <View style={styles.wordCardFooter}>
                  <Text style={styles.exploreText}>Tap to explore more</Text>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

          {/* Enhanced Games Grid Section */}
          <Animatable.View
            animation="fadeInUp"
            duration={1000}
            delay={400}
            style={styles.gamesSection}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Target width={20} height={20} color="#4CAF50" />
                <Text style={styles.sectionMainTitle}>Game Modes</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Master different skills through interactive challenges
              </Text>
            </View>

            <View style={styles.gamesGrid}>
              {gameOptions.map((game, index) => {
                const progress = getGameModeProgress(game.id);
                const completionPercentage =
                  progress.total > 0
                    ? Math.round((progress.completed / progress.total) * 100)
                    : 0;

                return (
                  <Animatable.View
                    key={game.id}
                    animation="fadeInUp"
                    delay={600 + index * 100}
                    duration={800}
                    style={styles.gameCardWrapper}
                  >
                    <View style={styles.gameCard}>
                      <LinearGradient
                        colors={game.gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gameCardGradient}
                      >
                        {/* Difficulty Badge */}
                        <View style={styles.difficultyBadge}>
                          <Text style={styles.difficultyText}>
                            {game.difficulty}
                          </Text>
                        </View>

                        {/* Game Header */}
                        <View style={styles.gameHeader}>
                          <View style={styles.gameIconContainer}>
                            <View style={styles.gameIconBg}>{game.icon}</View>
                          </View>
                          <View style={styles.gameInfo}>
                            <Text style={styles.gameTitle} numberOfLines={1}>
                              {game.title}
                            </Text>
                            <Text
                              style={styles.gameDescription}
                              numberOfLines={1}
                            >
                              {game.description}
                            </Text>
                          </View>
                        </View>

                        {/* Stats Row */}
                        <View style={styles.gameStatsRow}>
                          <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                              {progress.completed}
                            </Text>
                            <Text style={styles.statLabel}>Completed</Text>
                          </View>
                          <View style={styles.statDivider} />
                          <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                              {completionPercentage}%
                            </Text>
                            <Text style={styles.statLabel}>Progress</Text>
                          </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.gameActionsRow}>
                          <TouchableOpacity
                            style={styles.progressBtn}
                            onPress={() =>
                              handleProgressPress(game.id, game.title)
                            }
                          >
                            <TrendingUp width={14} height={14} color="#fff" />
                            <Text style={styles.progressBtnText}>
                              View Progress
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.playBtn,
                              { backgroundColor: game.color },
                            ]}
                            onPress={() => handleGamePress(game.id, game.title)}
                          >
                            <Play width={14} height={14} color="#fff" />
                            <Text style={styles.playBtnText}>PLAY</Text>
                          </TouchableOpacity>
                        </View>

                        <View style={styles.gameDecoShape1} />
                        <View style={styles.gameDecoShape2} />
                      </LinearGradient>
                    </View>
                  </Animatable.View>
                );
              })}
            </View>
          </Animatable.View>

          {/* Progress Summary - Optimized */}
          <Animatable.View
            animation="fadeInUp"
            duration={1000}
            delay={800}
            style={styles.quickStatsSection}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Award width={20} height={20} color="#FF6B6B" />
                <Text style={styles.sectionMainTitle}>Your Progress</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Track your completion across all game modes
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.quickStatCard}>
                <LinearGradient
                  colors={["#FF6B6B", "#FF8E8E"]}
                  style={styles.statCardGradient}
                >
                  <View style={styles.statIconContainer}>
                    <Target width={24} height={24} color="#fff" />
                  </View>
                  <Text style={styles.statNumber}>{totalCompletedCount}</Text>
                  <Text style={styles.statText}>Levels Completed</Text>
                </LinearGradient>
              </View>

              <View style={styles.quickStatCard}>
                <LinearGradient
                  colors={["#4ECDC4", "#44A08D"]}
                  style={styles.statCardGradient}
                >
                  <View style={styles.statIconContainer}>
                    <Award width={24} height={24} color="#fff" />
                  </View>
                  <Text style={styles.statNumber}>{totalQuizCount}</Text>
                  <Text style={styles.statText}>Total Quizzes</Text>
                </LinearGradient>
              </View>
            </View>

            <Animatable.View
              animation="fadeIn"
              delay={1000}
              style={styles.progressSummaryContainer}
            >
              <Text style={styles.progressSummaryText}>
                {totalCompletedCount === 0
                  ? `Start playing to track your progress! ${totalQuizCount} quizzes available`
                  : `${Math.round(
                      (totalCompletedCount / totalQuizCount) * 100
                    )}% completion rate across all game modes (${totalCompletedCount}/${totalQuizCount})`}
              </Text>
            </Animatable.View>
          </Animatable.View>
        </ScrollView>

        {/* Modals */}
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

        <DailyRewardsModal
          visible={isDailyRewardsModalVisible}
          onClose={hideDailyRewardsModal}
        />

        <GameProgressModal
          visible={progressModal.visible}
          onClose={closeProgressModal}
          gameMode={progressModal.gameMode}
          gameTitle={progressModal.gameTitle}
        />
      </SafeAreaView>
    </View>
  );
};

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: "relative",
  },

  // Enhanced Background Layers
  backgroundLayer1: {
    position: "absolute",
    top: -150,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${BASE_COLORS.blue}15`,
  },
  backgroundLayer2: {
    position: "absolute",
    top: height * 0.2,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: `${BASE_COLORS.success}10`,
  },
  backgroundLayer3: {
    position: "absolute",
    bottom: -100,
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: `${BASE_COLORS.orange}12`,
  },
  backgroundLayer4: {
    position: "absolute",
    top: height * 0.6,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${BASE_COLORS.blue}08`,
  },

  // Floating Particles
  floatingParticle1: {
    position: "absolute",
    top: height * 0.15,
    right: 50,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD700",
  },
  floatingParticle2: {
    position: "absolute",
    top: height * 0.4,
    left: 30,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
  },
  floatingParticle3: {
    position: "absolute",
    bottom: height * 0.3,
    right: 80,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF6B6B",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Enhanced Header Section
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
    marginBottom: 30,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    opacity: 0.8,
    marginBottom: 2,
  },
  mainTitle: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.7,
    lineHeight: 20,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  // Section Headers
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionMainTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.white,
    opacity: 0.7,
    lineHeight: 20,
  },

  // Featured Section (Word of Day)
  featuredSection: {
    marginBottom: 40,
  },
  wordOfTheDayCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  wordCardGradient: {
    padding: 20,
    minHeight: 160,
    position: "relative",
  },

  // Enhanced Word Card Decorations
  wordDecoPattern1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  wordDecoPattern2: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  wordDecoPattern3: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  wordCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  wordBadgeText: {
    fontSize: 11,
    fontFamily: "Poppins-Bold",
    color: "#667eea",
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  wordContent: {
    flex: 1,
    justifyContent: "center",
  },
  wordMainText: {
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    marginBottom: 8,
  },
  wordTranslation: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
  },

  wordCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  exploreText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Poppins-Bold",
  },

  // Games Section
  gamesSection: {
    marginBottom: 40,
  },
  gamesGrid: {
    gap: 16,
  },
  gameCardWrapper: {
    marginBottom: 4,
  },
  gameCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  gameCardGradient: {
    padding: 20,
    position: "relative",
    minHeight: 160, // Reduced height since content is more compact
  },

  // New Game Header Layout
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  gameIconContainer: {
    marginRight: 12,
  },
  gameIconBg: {
    width: 50, // Slightly smaller icon
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 16,
  },

  // Updated Game Actions
  gameActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBtnText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },
  playBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  playBtnText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },

  // Updated Difficulty Badge Position
  difficultyBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Quick Stats Section
  quickStatsSection: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  statCardGradient: {
    padding: 20,
    alignItems: "center",
    minHeight: 120,
    justifyContent: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    marginBottom: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },

  // Progress Summary Text
  progressSummaryContainer: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  progressSummaryText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },

  // Enhanced Stats Row (for game cards)
  gameStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#FFF",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 16,
  },

  // Game Decorative Shapes
  gameDecoShape1: {
    position: "absolute",
    top: -15,
    right: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  gameDecoShape2: {
    position: "absolute",
    bottom: -10,
    left: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
});

export default Games;
