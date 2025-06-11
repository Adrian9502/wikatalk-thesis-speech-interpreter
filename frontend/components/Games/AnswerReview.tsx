import React from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Animatable from "react-native-animatable";
import { Check, X } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import gameSharedStyles from "@/styles/gamesSharedStyles";
import { formatTime } from "@/utils/gameUtils";

interface AnswerReviewProps {
  question: string;
  userAnswer: string;
  isCorrect: boolean;
  timeElapsed?: number;
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
  timeElapsed,
  animation = "fadeInUp",
  duration = 700,
  delay = 300,
  questionLabel = "Question:",
  answerLabel = "Your Answer:",
}) => {
  return (
    <Animatable.View
      animation={animation}
      duration={duration}
      delay={delay}
      style={styles.reviewContainer}
    >
      <Text style={styles.reviewTitle}>Answer Review</Text>

      <View style={styles.reviewCard}>
        {/* Question Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>{questionLabel}</Text>
          <Text style={styles.reviewQuestionText}>{question}</Text>
        </View>

        {/* Answer Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>{answerLabel}</Text>
          <View style={styles.reviewAnswer}>
            <View
              style={[
                styles.reviewAnswerBadge,
                isCorrect ? styles.correctBadge : styles.incorrectBadge,
              ]}
            >
              {isCorrect ? (
                <Check width={14} height={14} color={BASE_COLORS.white} />
              ) : (
                <X width={14} height={14} color={BASE_COLORS.white} />
              )}
            </View>
            <Text
              style={[
                styles.reviewAnswerText,
                isCorrect
                  ? styles.correctAnswerText
                  : styles.incorrectAnswerText,
              ]}
            >
              {userAnswer || "(No answer provided)"}
            </Text>
          </View>
        </View>

        {/* Time Taken Section  */}
        {timeElapsed !== undefined && (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewSectionTitle}>Time Taken:</Text>
            <Text style={styles.reviewTimeText}>{formatTime(timeElapsed)}</Text>
          </View>
        )}
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  ...gameSharedStyles,
  reviewTimeText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.white,
    marginTop: 4,
  },
});

export default AnswerReview;
