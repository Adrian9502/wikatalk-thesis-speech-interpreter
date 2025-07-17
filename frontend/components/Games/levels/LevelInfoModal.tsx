import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, Star } from "react-native-feather";
import { difficultyColors } from "@/constant/colors";
import {
  renderFocusIcon,
  getFocusAreaText,
  getGameModeName,
} from "@/utils/games/renderFocusIcon";
import { formatDifficulty, getStarCount } from "@/utils/games/difficultyUtils";
import modalSharedStyles from "@/styles/games/modalSharedStyles";

type DifficultyLevel = keyof typeof difficultyColors;

interface GameInfoModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: () => void;
  levelData: any;
  gameMode: string;
  isLoading?: boolean;
  difficulty?: string;
}

const LevelInfoModal: React.FC<GameInfoModalProps> = React.memo(
  ({
    visible,
    onClose,
    onStart,
    levelData,
    gameMode,
    isLoading = false,
    difficulty = "Easy",
  }) => {
    // IMPORTANT: ALL HOOKS MUST BE DECLARED FIRST
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    // Animation values
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const modalTranslateY = useRef(new Animated.Value(300)).current;

    // Reset state when modal visibility changes
    useEffect(() => {
      if (visible) {
        setIsAnimating(true);
        setHasStarted(false);

        // Start entrance animation
        Animated.parallel([
          Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(modalTranslateY, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setIsAnimating(false);
        });
      } else {
        // Reset values
        overlayOpacity.setValue(0);
        modalTranslateY.setValue(300);
        setIsAnimating(false);
        setHasStarted(false);
      }
    }, [visible, overlayOpacity, modalTranslateY]);

    // FIXED: Enhanced start button handler
    const handleStart = useCallback(() => {
      if (isLoading || isAnimating || hasStarted) return;

      console.log("[LevelInfoModal] Starting level...");
      setHasStarted(true);

      // Close modal first, then navigate
      const closeAndNavigate = () => {
        try {
          // Animate modal out
          Animated.timing(overlayOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            // Then trigger navigation after modal is hidden
            setTimeout(() => {
              onStart();
            }, 50);
          });
        } catch (error) {
          console.error("[LevelInfoModal] Navigation error:", error);
          // Fallback - direct navigation
          setTimeout(() => {
            onStart();
          }, 300);
        }
      };

      closeAndNavigate();
    }, [isLoading, isAnimating, hasStarted, overlayOpacity, onStart]);

    // Enhanced close handler
    const handleClose = useCallback(() => {
      if (isAnimating) return;

      setIsAnimating(true);

      // Animate fade-out
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
        onClose();
      });
    }, [isAnimating, overlayOpacity, onClose]);

    // Calculate derived values AFTER all hooks
    const starCount = getStarCount(difficulty);

    const getGradientColors = (): readonly [string, string] => {
      if (difficulty && difficulty in difficultyColors) {
        return difficultyColors[difficulty as DifficultyLevel];
      }
      const capitalized =
        difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
      if (capitalized in difficultyColors) {
        return difficultyColors[capitalized as DifficultyLevel];
      }
      return ["#2563EB", "#1E40AF"] as const;
    };

    // FIXED: Check visibility and data AFTER all hooks are called
    if (!visible || !levelData || hasStarted) {
      return null;
    }

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent={true}
        hardwareAccelerated={true}
        onRequestClose={handleClose}
      >
        <Animated.View
          style={[
            modalSharedStyles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        >
          <Animated.View
            style={[
              modalSharedStyles.modalContainer,
              {
                transform: [{ translateY: modalTranslateY }],
              },
            ]}
          >
            <LinearGradient
              colors={getGradientColors()}
              style={[modalSharedStyles.modalContent, styles.extendedContent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Decorative background elements */}
              <View style={modalSharedStyles.decorativeShape1} />
              <View style={modalSharedStyles.decorativeShape2} />
              <View style={styles.decorativeShape3} />

              {/* Close button */}
              <TouchableOpacity
                onPress={handleClose}
                style={modalSharedStyles.closeButton}
                disabled={isAnimating}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X width={20} height={20} color="#fff" />
              </TouchableOpacity>

              {/* Level header */}
              <View style={modalSharedStyles.levelHeader}>
                <View style={modalSharedStyles.levelNumberContainer}>
                  <Text style={modalSharedStyles.levelNumber}>
                    {levelData.levelString ||
                      levelData.level ||
                      `Level ${levelData.id}`}
                  </Text>
                </View>
                <Text style={modalSharedStyles.levelTitle}>
                  {levelData.title}
                </Text>
              </View>

              {/* Badges with difficulty stars and focus area */}
              <View style={modalSharedStyles.badgesContainer}>
                <View style={modalSharedStyles.difficultyBadge}>
                  <View style={modalSharedStyles.starContainer}>
                    {Array(3)
                      .fill(0)
                      .map((_, index) => (
                        <Star
                          key={index}
                          width={16}
                          height={16}
                          fill={index < starCount ? "#FFC107" : "transparent"}
                          stroke={
                            index < starCount
                              ? "#FFC107"
                              : "rgba(255, 255, 255, 0.4)"
                          }
                        />
                      ))}
                  </View>
                  <Text style={modalSharedStyles.difficultyText}>
                    {formatDifficulty(difficulty)}
                  </Text>
                </View>

                <View style={modalSharedStyles.focusAreaBadge}>
                  {renderFocusIcon(levelData.focusArea)}
                  <Text style={modalSharedStyles.focusAreaText}>
                    {getFocusAreaText(levelData.focusArea)}
                  </Text>
                </View>
              </View>

              {/* Level description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.levelDescription}>
                  {levelData.description}
                </Text>
              </View>

              {/* Game mode info */}
              <View style={styles.gameModeContainer}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Game Mode:</Text>
                  <Text style={styles.infoValue}>
                    {getGameModeName(gameMode)}
                  </Text>
                </View>
              </View>

              {/* How to play */}
              <View style={styles.rulesContainer}>
                <Text style={styles.rulesTitle}>How to Play:</Text>
                <Text style={styles.rulesText}>
                  {gameMode === "multipleChoice"
                    ? "Select the correct answer from the options provided. The timer will stop when you answer. Be quick but accurate!"
                    : gameMode === "identification"
                    ? "Identify the correct word in the sentence. Tap on it to select. Read carefully before making your choice."
                    : "Fill in the blank with the correct word. Type your answer and tap Check. Choose wisely!"}
                </Text>
              </View>

              {/* Start button */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    modalSharedStyles.startAndCloseButton,
                    (isLoading || isAnimating || hasStarted) &&
                      styles.disabledButton,
                  ]}
                  onPress={handleStart}
                  disabled={isLoading || isAnimating || hasStarted}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={modalSharedStyles.startAndCloseText}>
                      START LEVEL
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  extendedContent: {
    paddingBottom: 28,
  },
  decorativeShape3: {
    position: "absolute",
    top: 120,
    right: -70,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  descriptionContainer: {
    width: "100%",
    marginBottom: 16,
  },
  levelDescription: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
  },
  gameModeContainer: {
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },
  rulesContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  rulesTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    marginBottom: 8,
  },
  rulesText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#fff",
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 6,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default LevelInfoModal;
