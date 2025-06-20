import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Check, AlertCircle } from "react-native-feather";

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
  isLoading: boolean;
  error: string | null;
}

const LevelDetailsSection: React.FC<LevelDetailsSectionProps> = ({
  details,
  isLoading,
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
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.questionText}>{details?.question}</Text>
          )}
        </View>
      </View>

      {/* Answer section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Correct Answer</Text>
        <View style={styles.answerContainer}>
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
            </>
          ) : (
            <View style={styles.answerSection}>
              <Text style={styles.answerText}>{details?.answer}</Text>
              <View style={styles.checkMarkContainer}>
                <Check width={16} height={16} color="#fff" />
              </View>
            </View>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 30,
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontFamily: "Poppins-Medium",
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 16,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0.2)",
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
  noDataContainer: {
    padding: 20,
    alignItems: "center",
  },
  noDataText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "Poppins-Medium",
    fontSize: 14,
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
  },
  answerContainer: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.20)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  answerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  answerText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    lineHeight: 22,
    textAlign: "center",
  },
  checkMarkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(36, 192, 57, 0.79)",
    backgroundColor: "rgba(36, 192, 57, 0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default React.memo(LevelDetailsSection);
