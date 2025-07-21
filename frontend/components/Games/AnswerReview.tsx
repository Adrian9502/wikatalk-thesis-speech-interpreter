import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { Check, X } from "react-native-feather";
import { BASE_COLORS, difficultyColors } from "@/constant/colors";
import { getGameModeGradient } from "@/utils/gameUtils";
import { safeTextRender } from "@/utils/textUtils";
import { NAVIGATION_COLORS } from "@/constant/gameConstants";

interface AnswerReviewProps {
  question: string | any;
  userAnswer: string | any;
  isCorrect: boolean;
  timeElapsed?: number;
  difficulty?: string;
  focusArea?: string;
  gameMode?: string;
  animation?: string;
  duration?: number;
  delay?: number;
  questionLabel?: string;
  answerLabel?: string;
}

const AnswerReview: React.FC<AnswerReviewProps> = ({
  question,
  userAnswer,
  isCorrect,
  gameMode = "multipleChoice",
  animation = "fadeInUp",
  duration = 800,
  delay = 300,
  questionLabel = "Question:",
  answerLabel = "Your Answer:",
}) => {
  // Get game mode gradient for consistency
  const gameGradientColors = useMemo(
    () => getGameModeGradient(gameMode as any),
    [gameMode]
  );

  // Result colors based on correctness
  const resultColors = useMemo(() => {
    return isCorrect ? NAVIGATION_COLORS.green : difficultyColors.Hard;
  }, [isCorrect]);

  return (
    <Animatable.View
      animation={animation}
      duration={duration}
      delay={delay}
      style={styles.container}
    >
      {/* Main Result Card */}
      <Animatable.View
        animation="bounceIn"
        duration={1000}
        delay={delay + 200}
        style={styles.resultCardContainer}
      >
        <LinearGradient
          colors={resultColors}
          style={styles.resultCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Result Icon */}
          <View style={styles.resultIcon}>
            {isCorrect ? (
              <Check width={32} height={32} color={BASE_COLORS.white} />
            ) : (
              <X width={32} height={32} color={BASE_COLORS.white} />
            )}
          </View>

          {/* Result Title */}
          <Text style={styles.resultTitle}>
            {isCorrect ? "Excellent!" : "Oops! Try again."}
          </Text>

          {/* Result Message */}
          <Text style={styles.resultMessage}>
            {isCorrect
              ? "You got it right! Well done."
              : "Keep practicing to improve your skills."}
          </Text>

          {/* Decorative Elements */}
          <View style={styles.cardDecoration1} />
          <View style={styles.cardDecoration2} />
        </LinearGradient>
      </Animatable.View>
      {/* Divider */}
      <View style={styles.divider} />

      {/* Review Details Card */}
      <Animatable.View
        animation="slideInUp"
        duration={700}
        delay={delay + 600}
        style={styles.reviewCardContainer}
      >
        <LinearGradient
          colors={gameGradientColors}
          style={styles.reviewCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Question Section */}
          <View style={styles.reviewSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Text style={styles.sectionIcon}>❓</Text>
              </View>
              <Text style={styles.sectionTitle}>{questionLabel}</Text>
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.questionText}>
                {safeTextRender(question)}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Answer Section */}
          <View style={styles.reviewSection}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIconContainer,
                  isCorrect ? styles.correctIcon : styles.incorrectIcon,
                ]}
              >
                {isCorrect ? (
                  <Check width={16} height={16} color={BASE_COLORS.white} />
                ) : (
                  <X width={16} height={16} color={BASE_COLORS.white} />
                )}
              </View>
              <Text style={styles.sectionTitle}>{answerLabel}</Text>
            </View>
            <View style={styles.contentContainer}>
              <Text
                style={[
                  styles.answerText,
                  isCorrect ? styles.correctText : styles.incorrectText,
                ]}
              >
                {safeTextRender(userAnswer) || "(No answer provided)"}
              </Text>
            </View>
          </View>

          {/* Card Decorations */}
          <View style={styles.reviewCardDecoration1} />
          <View style={styles.reviewCardDecoration2} />
        </LinearGradient>
      </Animatable.View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    position: "relative",
  },

  // Result Card
  resultCardContainer: {
    marginBottom: 12,
    zIndex: 2,
  },
  resultCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    minHeight: 100,
    justifyContent: "center",
  },
  resultIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 8,
    textAlign: "center",
  },
  resultMessage: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 22,
  },
  cardDecoration1: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  cardDecoration2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  reviewCardContainer: {
    zIndex: 2,
    marginVertical: 12,
  },
  reviewCard: {
    borderRadius: 16,
    padding: 20,
    position: "relative",
    overflow: "hidden",
  },
  reviewSection: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  correctIcon: {
    backgroundColor: "rgba(0, 255, 8, 0.3)",
  },
  incorrectIcon: {
    backgroundColor: "rgba(255, 17, 0, 0.3)",
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  contentContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  questionText: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
  },
  answerText: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Poppins-Medium",
    lineHeight: 22,
  },
  correctText: {
    color: "#81C784",
  },
  incorrectText: {
    color: "#E57373",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 8,
  },
  reviewCardDecoration1: {
    position: "absolute",
    top: -15,
    left: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  reviewCardDecoration2: {
    position: "absolute",
    bottom: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
});

export default AnswerReview;
