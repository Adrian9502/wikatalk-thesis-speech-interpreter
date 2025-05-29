import React, { useCallback } from "react";
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
import { X, Star, BookOpen, AlertTriangle } from "react-native-feather";
import { difficultyColors } from "@/constant/colors";

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
    // Get gradient colors for the current difficulty
    const getGradientColors = (): readonly [string, string] => {
      // Check if the difficulty is a valid key in difficultyColors
      if (difficulty && difficulty in difficultyColors) {
        return difficultyColors[difficulty as DifficultyLevel];
      }

      // Attempt to capitalize the difficulty to match keys
      const capitalized =
        difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
      if (capitalized in difficultyColors) {
        return difficultyColors[capitalized as DifficultyLevel];
      }

      // Default fallback - explicitly typed as readonly tuple
      return ["#2563EB", "#1E40AF"] as const;
    };

    // Get game mode display name
    const getGameModeName = () => {
      switch (gameMode) {
        case "multipleChoice":
          return "Multiple Choice";
        case "identification":
          return "Word Identification";
        case "fillBlanks":
          return "Fill in the Blanks";
        default:
          return gameMode;
      }
    };

    // Determine focus area icon based on level description
    const renderFocusIcon = () => {
      const description = levelData?.description || "";

      if (description.includes("Grammar")) {
        return <AlertTriangle width={16} height={16} color="#FFFFFF" />;
      } else if (description.includes("Pronunciation")) {
        return <Star width={16} height={16} color="#FFFFFF" />;
      } else {
        return <BookOpen width={16} height={16} color="#FFFFFF" />;
      }
    };

    // Determine focus area text
    const getFocusAreaText = () => {
      const description = levelData?.description || "";

      if (description.includes("Grammar")) {
        return "Grammar";
      } else if (description.includes("Pronunciation")) {
        return "Pronunciation";
      } else {
        return "Vocabulary";
      }
    };

    // Optimize the start button handler
    const handleStart = useCallback(() => {
      if (isLoading) return;
      onStart();
    }, [isLoading, onStart]);

    // Return null early if not visible
    if (!visible || !levelData) return null;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <Animatable.View
          animation="fadeIn"
          duration={300}
          style={styles.overlay}
        >
          <Animatable.View
            animation="zoomIn"
            duration={400}
            style={styles.modalContainer}
          >
            <LinearGradient
              colors={getGradientColors()}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalContent}
            >
              {/* Decorative elements */}
              <View style={styles.decorativeShape1} />
              <View style={styles.decorativeShape2} />

              {/* Close button */}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.8}
              >
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
                  <Text style={styles.levelNumber}>Level {levelData.id}</Text>
                </View>
                <Text style={styles.levelTitle}>{levelData.title}</Text>
              </Animatable.View>

              {/* Level badges */}
              <Animatable.View
                animation="fadeIn"
                duration={600}
                delay={200}
                style={styles.badgesContainer}
              >
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{difficulty}</Text>
                </View>

                <View style={styles.focusAreaBadge}>
                  {renderFocusIcon()}
                  <Text style={styles.focusAreaText}>{getFocusAreaText()}</Text>
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
                  <Text style={styles.infoValue}>{getGameModeName()}</Text>
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
                duration={600}
                delay={400}
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  modalContent: {
    padding: 24,
    paddingBottom: 28,
    minHeight: 380,
    position: "relative",
    overflow: "hidden",
  },
  decorativeShape1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  decorativeShape2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  levelHeader: {
    alignItems: "center",
    marginBottom: 14,
  },
  levelNumberContainer: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  levelNumber: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#fff",
  },
  levelTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#fff",
    textAlign: "center",
  },
  badgesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 14,
    gap: 12,
  },
  difficultyBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 14,
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
    marginBottom: 12,
  },
  levelDescription: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
    lineHeight: 22,
  },
  gameModeContainer: {
    marginBottom: 12,
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
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  rulesTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    marginBottom: 6,
  },
  rulesText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#fff",
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 4,
  },
  startButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#000",
  },
});

export default GameInfoModal;
