import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { X, Star } from "react-native-feather";
import { difficultyColors } from "@/constant/colors";
import {
  renderFocusIcon,
  getFocusAreaText,
  getGameModeName,
} from "@/utils/games/renderFocusIcon";

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

const GameInfoModal: React.FC<GameInfoModalProps> = React.memo(
  ({
    visible,
    onClose,
    onStart,
    levelData,
    gameMode,
    isLoading = false,
    difficulty = "Easy",
  }) => {
    // Simplified state management - remove the internal visible state
    const [hasBeenStarted, setHasBeenStarted] = useState(false);

    // Reset the hasBeenStarted state when modal is closed
    useEffect(() => {
      if (!visible) {
        setHasBeenStarted(false);
      }
    }, [visible]);

    // Get gradient colors for the current difficulty
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

    // Determine number of stars based on difficulty
    const getStarCount = () => {
      switch (difficulty) {
        case "Hard":
          return 3;
        case "Medium":
          return 2;
        default:
          return 1;
      }
    };

    const starCount = getStarCount();

    // Enhanced start button handler
    const handleStart = useCallback(() => {
      if (isLoading) return;

      // Set started flag and call the onStart handler
      setHasBeenStarted(true);
      onStart();
    }, [isLoading, onStart]);

    // If modal shouldn't be visible or we don't have level data, return null
    if (!visible || !levelData || hasBeenStarted) {
      return null;
    }

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade" // Change to "fade" for faster appearance
        statusBarTranslucent={true}
        onRequestClose={onClose}
      >
        <Animatable.View
          animation="fadeIn"
          duration={150} // Reduce animation duration
          style={styles.overlay}
        >
          <Animatable.View
            animation="zoomIn"
            duration={200} // Reduce animation duration
            style={styles.modalContainer}
          >
            <LinearGradient
              colors={getGradientColors()}
              style={styles.modalContent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Decorative background elements */}
              <View style={styles.decorativeShape1} />
              <View style={styles.decorativeShape2} />
              <View style={styles.decorativeShape3} />

              {/* Close button */}
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X width={20} height={20} color="#fff" />
              </TouchableOpacity>

              {/* Level header */}
              <Animatable.View
                animation="fadeInDown"
                duration={600}
                delay={100}
                style={styles.levelHeader}
              >
                <View style={styles.levelNumberContainer}>
                  <Text style={styles.levelNumber}>
                    {levelData.level || `Level ${levelData.id}`}
                  </Text>
                </View>
                <Text style={styles.levelTitle}>{levelData.title}</Text>
              </Animatable.View>

              {/* Level badges with stars for difficulty */}
              <Animatable.View
                animation="fadeIn"
                duration={600}
                delay={200}
                style={styles.badgesContainer}
              >
                <View style={styles.difficultyBadge}>
                  <View style={styles.starContainer}>
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
                  <Text style={styles.difficultyText}>{difficulty}</Text>
                </View>

                <View style={styles.focusAreaBadge}>
                  {renderFocusIcon(levelData.focusArea)}
                  <Text style={styles.focusAreaText}>
                    {getFocusAreaText(levelData.focusArea)}
                  </Text>
                </View>
              </Animatable.View>

              {/* Level description */}
              <Animatable.View
                animation="fadeIn"
                duration={600}
                delay={250}
                style={styles.descriptionContainer}
              >
                <Text style={styles.levelDescription}>
                  {levelData.description}
                </Text>
              </Animatable.View>

              {/* Game mode info */}
              <Animatable.View
                animation="fadeIn"
                duration={600}
                delay={300}
                style={styles.gameModeContainer}
              >
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Game Mode:</Text>
                  <Text style={styles.infoValue}>
                    {getGameModeName(gameMode)}
                  </Text>
                </View>
              </Animatable.View>

              {/* How to play */}
              <Animatable.View
                animation="fadeIn"
                duration={600}
                delay={350}
                style={styles.rulesContainer}
              >
                <Text style={styles.rulesTitle}>How to Play:</Text>
                <Text style={styles.rulesText}>
                  {gameMode === "multipleChoice"
                    ? "Select the correct answer from the options provided. The timer will stop when you answer. Be quick but accurate!"
                    : gameMode === "identification"
                    ? "Identify the correct word in the sentence. Tap on it to select. Read carefully before making your choice."
                    : "Fill in the blank with the correct word from the options. Choose wisely as you only get one chance!"}
                </Text>
              </Animatable.View>

              {/* Start button */}
              <Animatable.View
                animation="fadeInUp"
                duration={200} // Reduce animation duration
                delay={100} // Reduce delay
                style={styles.buttonContainer}
              >
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={handleStart}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.startButtonText}>START LEVEL</Text>
                  )}
                </TouchableOpacity>
              </Animatable.View>
            </LinearGradient>
          </Animatable.View>
        </Animatable.View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  modalContent: {
    padding: 24,
    paddingBottom: 28,
    minHeight: 400,
    position: "relative",
    overflow: "hidden",
  },
  decorativeShape1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  decorativeShape2: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
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
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  levelHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  levelNumberContainer: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  levelNumber: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },
  levelTitle: {
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    textAlign: "center",
  },
  badgesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 14,
  },
  starContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginRight: 6,
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },
  focusAreaBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  focusAreaText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    marginLeft: 6,
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
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
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
  startButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#000",
  },
});

export default GameInfoModal;
