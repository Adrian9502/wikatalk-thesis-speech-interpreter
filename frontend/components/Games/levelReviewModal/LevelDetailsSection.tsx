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
    borderRadius: 16,
    marginBottom: 20,
    marginTop: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255,0.2)",
  },
  errorText: {
    color: "#ff6b6b",
    fontFamily: "Poppins-Medium",
    textAlign: "center",
    fontSize: 16,
    marginTop: 8,
  },
  errorHint: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    fontSize: 13,
    marginTop: 4,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    marginBottom: 8,
  },
  questionContainer: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.20)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    minHeight: 50,
  },
  questionText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    lineHeight: 22,
    textAlign: "center",
  },
  answerContainer: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.20)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    padding: 16,
  },
  answerText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    lineHeight: 22,
    textAlign: "center",
  },
});

export default React.memo(LevelDetailsSection);
