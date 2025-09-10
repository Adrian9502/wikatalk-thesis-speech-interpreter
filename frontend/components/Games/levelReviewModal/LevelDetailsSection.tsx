import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";
import { trimEnd } from "lodash";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AlertCircle } from "react-native-feather";

interface CompletedLevelDetails {
  question: string;
  answer: string;
  timeSpent: number;
  completedDate: string;
  isCorrect: boolean;
  totalAttempts: number;
  correctAttempts: number;
}

interface LevelDetailsSectionProps {
  details: CompletedLevelDetails | null;
  error: string | null;
}

const LevelDetailsSection: React.FC<LevelDetailsSectionProps> = ({
  details,
  error,
}) => {
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle width={20} height={20} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>
          Level details will be available after completion
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* Question section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Question</Text>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {details?.question || "Question not available"}
          </Text>
        </View>
      </View>

      {/* Answer section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Correct Answer</Text>
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>
            {details?.answer || "Answer not available"}
          </Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    padding: 20,
    backgroundColor: "rgba(255, 255,255, 0.1)",
    borderRadius: 20,
    marginBottom: 20,
    marginTop: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255,0.2)",
  },
  errorText: {
    color: "#ff6b6b",
    fontFamily: POPPINS_FONT.medium,
    textAlign: "center",
    fontSize: 16,
    marginTop: 8,
  },
  errorHint: {
    color: BASE_COLORS.white,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    fontSize: 13,
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    marginBottom: 8,
  },
  questionContainer: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    minHeight: 50,
  },
  questionText: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    textAlign: "center",
  },
  answerContainer: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    padding: 8,
  },
  answerText: {
    fontSize: COMPONENT_FONT_SIZES.card.title,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    textAlign: "center",
  },
});

export default React.memo(LevelDetailsSection);
