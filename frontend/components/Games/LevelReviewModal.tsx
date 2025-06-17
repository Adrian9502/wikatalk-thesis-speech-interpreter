import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { X, Clock, Check, Calendar, Award, Star } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import { formatTime } from "@/utils/gameUtils";
import { getToken } from "@/lib/authTokenManager";
import { LevelData } from "@/types/gameTypes";
import axios from "axios";
import { getStarCount, formatDifficulty } from "@/utils/games/difficultyUtils";
import { renderFocusIcon } from "@/utils/games/renderFocusIcon";
import modalSharedStyles from "@/styles/games/modalSharedStyles";

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface CompletedLevelDetails {
  question: string;
  answer: string;
  timeSpent: number;
  completedDate: string;
  isCorrect: boolean;
}

interface LevelReviewModalProps {
  visible: boolean;
  onClose: () => void;
  level: LevelData | null;
  gradientColors: readonly [string, string];
}

const LevelReviewModal: React.FC<LevelReviewModalProps> = ({
  visible,
  onClose,
  level,
  gradientColors,
}) => {
  const [details, setDetails] = useState<CompletedLevelDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible && level) {
      fetchLevelProgress();
    } else {
      setDetails(null);
    }
  }, [visible, level]);

  const fetchLevelProgress = async () => {
    if (!level) return;

    setIsLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const formattedId = `n-${level.id}`;
      const response = await axios({
        method: "get",
        url: `${API_URL}/api/userprogress/${formattedId}`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        const progressData = response.data.progress;

        // Find the last successful attempt
        const lastCorrectAttempt =
          [...progressData.attempts].reverse().find((a) => a.isCorrect) ||
          progressData.attempts[progressData.attempts.length - 1];

        // Format date as Month Day, Year
        const completedDate = new Date(
          lastCorrectAttempt?.attemptDate || progressData.lastAttemptDate
        );
        const formattedDate = completedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // Create details object
        setDetails({
          question: level.questionData?.question || "Question not available",
          answer:
            level.questionData?.options?.find((o) => o.isCorrect)?.text ||
            "Answer not available",
          timeSpent: progressData.totalTimeSpent || 0,
          completedDate: formattedDate,
          isCorrect: true, // It's completed so it must be correct
        });
      }
    } catch (error) {
      console.error("Error fetching level progress:", error);
      setError("Failed to load level details");
    } finally {
      setIsLoading(false);
    }
  };

  // Get star count based on difficulty
  const starCount = level ? getStarCount(level.difficulty) : 1;

  if (!level) return null;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalSharedStyles.overlay}>
        <Animatable.View
          animation="zoomIn"
          duration={300}
          style={modalSharedStyles.modalContainer}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[modalSharedStyles.modalContent, styles.compactContent]}
          >
            {/* Decorative elements */}
            <View style={modalSharedStyles.decorativeShape1} />
            <View style={modalSharedStyles.decorativeShape2} />

            {/* Close button */}
            <TouchableOpacity
              onPress={onClose}
              style={modalSharedStyles.closeButton}
            >
              <X width={20} height={20} color="#fff" />
            </TouchableOpacity>
            {/* Level number pill */}
            <View style={modalSharedStyles.levelHeader}>
              <View style={modalSharedStyles.levelNumberContainer}>
                <Text style={modalSharedStyles.levelNumber}>
                  Level {level.number}
                </Text>
              </View>
            </View>

            {/* Level title */}
            <Text style={modalSharedStyles.levelTitle}>{level.title}</Text>

            {/* Badges row */}
            <View style={styles.badgesRow}>
              {/* Difficulty with stars */}
              <View style={modalSharedStyles.difficultyBadge}>
                <View style={modalSharedStyles.starContainer}>
                  {[1, 2, 3].map((_, index) => (
                    <Star
                      key={index}
                      width={14}
                      height={14}
                      fill={index < starCount ? "#FFC107" : "transparent"}
                      stroke={
                        index < starCount
                          ? "#FFC107"
                          : "rgba(255, 255, 255, 0.4)"
                      }
                    />
                  ))}
                </View>
                <Text style={styles.badgeText}>
                  {formatDifficulty(level.difficulty)}
                </Text>
              </View>

              {/* Focus area badge */}
              <View style={modalSharedStyles.focusAreaBadge}>
                {renderFocusIcon(level.focusArea)}
                <Text style={styles.badgeText}>{level.focusArea}</Text>
              </View>
            </View>
            {/* Completed badge */}
            <View style={styles.completedBadgeContainer}>
              <View style={styles.completedBadge}>
                <Check width={18} height={18} color="#fff" />
                <Text style={styles.completedText}>Level Completed!</Text>
              </View>
            </View>
            {/* Content area */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.loadingText}>Loading details...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : (
                <>
                  {/* Question section */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionLabel}>Question</Text>
                    <View style={styles.questionContainer}>
                      <Text style={styles.questionText}>
                        {details?.question}
                      </Text>
                    </View>
                  </View>

                  {/* Answer section */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionLabel}>Correct Answer</Text>
                    <View style={styles.answerContainer}>
                      <Text style={styles.answerText}>{details?.answer}</Text>
                      <View style={styles.checkMarkContainer}>
                        <Check width={16} height={16} color="#fff" />
                      </View>
                    </View>
                  </View>

                  {/* Stats grid */}
                  <View style={styles.statsGrid}>
                    {/* Time spent */}
                    <View style={styles.statBox}>
                      <Clock
                        width={18}
                        height={18}
                        color="#fff"
                        strokeWidth={2}
                      />
                      <Text style={styles.statLabel}>Time Spent</Text>
                      <Text style={styles.statValue}>
                        {formatTime(details?.timeSpent || 0)}
                      </Text>
                    </View>

                    {/* Completion date */}
                    <View style={styles.statBox}>
                      <Calendar
                        width={18}
                        height={18}
                        color="#fff"
                        strokeWidth={2}
                      />
                      <Text style={styles.statLabel}>Completed</Text>
                      <Text style={styles.statValue}>
                        {details?.completedDate
                          .split(" ")
                          .slice(0, 3)
                          .join(" ")}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            {/* Continue learning button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.continueButtonText}>Continue Learning</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animatable.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  completedBadgeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  completedText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    marginLeft: 4,
  },
  badgesRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 10,
  },
  badgeText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    marginLeft: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontFamily: "Poppins-Medium",
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderRadius: 16,
    marginBottom: 10,
  },
  errorText: {
    color: "#fff",
    fontFamily: "Poppins-Medium",
    textAlign: "center",
    fontSize: 14,
  },
  sectionContainer: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    marginBottom: 6,
  },
  questionContainer: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 14,
  },
  questionText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    lineHeight: 20,
  },
  answerContainer: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  answerText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    flex: 1,
    marginRight: 10,
  },
  checkMarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 10,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
  },
  statValue: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },
  continueButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  continueButtonText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
  },
});

export default LevelReviewModal;
