import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  Star,
  Clock,
  CheckCircle,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
} from "react-native-feather";
import { difficultyColors } from "@/constant/colors";
import {
  renderFocusIcon,
  getFocusAreaText,
  getGameModeName,
} from "@/utils/games/renderFocusIcon";
import { formatDifficulty, getStarCount } from "@/utils/games/difficultyUtils";
import modalSharedStyles from "@/styles/games/modalSharedStyles";
import { useUserProgress } from "@/hooks/useUserProgress";
import { formatTime, formatTimeDecimal } from "@/utils/gameUtils";
import useCoinsStore from "@/store/games/useCoinsStore";

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
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [showResetConfirmation, setShowResetConfirmation] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [resetMessage, setResetMessage] = useState<{
      type: "success" | "error";
      title: string;
      description: string;
    } | null>(null);

    // NEW: Track if we've fetched fresh data for this modal session
    const [hasFetchedFresh, setHasFetchedFresh] = useState(false);
    const fetchInProgressRef = useRef(false);
    const modalSessionRef = useRef<string | null>(null);

    // ADD: Missing Animated.Value declarations
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const modalTranslateY = useRef(new Animated.Value(300)).current;
    const progressOpacity = useRef(new Animated.Value(1)).current;
    const confirmationOpacity = useRef(new Animated.Value(0)).current;
    const confirmationScale = useRef(new Animated.Value(0.8)).current;
    const resetMessageOpacity = useRef(new Animated.Value(0)).current;
    const resetMessageScale = useRef(new Animated.Value(0.8)).current;

    const {
      progress,
      isLoading: progressLoading,
      fetchProgress,
      resetTimer,
    } = useUserProgress(levelData?.questionId || levelData?.id);

    // Get coins from store
    const { coins, fetchCoinsBalance } = useCoinsStore();

    // FIXED: Prevent multiple fetches with session tracking
    useEffect(() => {
      if (visible && !fetchInProgressRef.current) {
        // Create a unique session ID for this modal open
        const sessionId = Date.now().toString();
        modalSessionRef.current = sessionId;

        console.log(`[LevelInfoModal] Modal opened (session: ${sessionId})`);

        // Always force refresh coins immediately (this is fast)
        fetchCoinsBalance(true);

        // Only fetch if we haven't already fetched for this session
        if (!hasFetchedFresh) {
          fetchInProgressRef.current = true;

          const fetchTimer = setTimeout(() => {
            // Check if this session is still active
            if (modalSessionRef.current === sessionId) {
              console.log(
                `[LevelInfoModal] Fetching fresh progress data (session: ${sessionId})`
              );

              fetchProgress(true).finally(() => {
                // Only update state if this session is still active
                if (modalSessionRef.current === sessionId) {
                  setHasFetchedFresh(true);
                  fetchInProgressRef.current = false;
                }
              });
            }
          }, 300);

          return () => {
            clearTimeout(fetchTimer);
            fetchInProgressRef.current = false;
          };
        }
      } else if (!visible) {
        // Reset when modal closes
        console.log(`[LevelInfoModal] Modal closed, resetting state`);
        setHasFetchedFresh(false);
        fetchInProgressRef.current = false;
        modalSessionRef.current = null;
      }
    }, [visible]); // CHANGED: Remove fetchCoinsBalance and fetchProgress from dependencies

    // FIXED: Update progress info calculation to handle the double loading issue
    const progressInfo = React.useMemo(() => {
      console.log("[LevelInfoModal] Calculating progress info:", {
        progress,
        progressLoading,
        hasFetchedFresh,
        fetchInProgress: fetchInProgressRef.current,
        isArray: Array.isArray(progress),
        progressType: typeof progress,
      });

      // Show loading if we're fetching OR if we haven't fetched fresh data yet OR if fetch is in progress
      if (progressLoading || !hasFetchedFresh || fetchInProgressRef.current) {
        return {
          hasProgress: false,
          timeSpent: 0,
          attempts: 0,
          isCompleted: false,
          isLoading: true,
        };
      }

      if (!progress || Array.isArray(progress)) {
        console.log("[LevelInfoModal] No valid progress data");
        return {
          hasProgress: false,
          timeSpent: 0,
          attempts: 0,
          isCompleted: false,
          isLoading: false,
        };
      }

      const attempts = progress.attempts?.length || 0;
      const timeSpent = progress.totalTimeSpent || 0;
      const isCompleted = progress.completed || false;

      console.log("[LevelInfoModal] Progress info calculated:", {
        attempts,
        timeSpent: Number(timeSpent.toFixed(2)), // Format to 2 decimal places
        isCompleted,
        hasProgress: timeSpent > 0 || attempts > 0,
      });

      return {
        hasProgress: timeSpent > 0 || attempts > 0,
        timeSpent: Number(timeSpent.toFixed(2)), // NEW: Format to 2 decimal places
        attempts,
        isCompleted,
        isLoading: false,
      };
    }, [progress, progressLoading, hasFetchedFresh]);

    // Reset state when modal visibility changes
    useEffect(() => {
      if (visible) {
        setIsAnimating(true);
        setHasStarted(false);
        progressOpacity.setValue(1); // Set to 1 immediately instead of 0
        confirmationOpacity.setValue(0);
        confirmationScale.setValue(0.8);
        resetMessageOpacity.setValue(0);
        resetMessageScale.setValue(0.8);
        setShowResetConfirmation(false);
        setResetMessage(null);

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
        progressOpacity.setValue(1);
        confirmationOpacity.setValue(0);
        confirmationScale.setValue(0.8);
        resetMessageOpacity.setValue(0);
        resetMessageScale.setValue(0.8);
        setIsAnimating(false);
        setHasStarted(false);
        setShowResetConfirmation(false);
        setIsResetting(false);
        setResetMessage(null);
      }
    }, [
      visible,
      overlayOpacity,
      modalTranslateY,
      progressOpacity,
      confirmationOpacity,
      confirmationScale,
      resetMessageOpacity,
      resetMessageScale,
    ]);

    const showResetMessage = useCallback(
      (type: "success" | "error", title: string) => {
        console.log(
          `[LevelInfoModal] Showing reset message: ${type} - ${title}`
        );

        // STEP 1: First animate out the confirmation if it's showing
        if (showResetConfirmation) {
          Animated.parallel([
            Animated.timing(confirmationOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.spring(confirmationScale, {
              toValue: 0.8,
              tension: 120,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // STEP 2: After confirmation is hidden, set the message and animate it in
            setShowResetConfirmation(false);
            // Simplified message - just use title, ignore description
            setResetMessage({ type, title, description: "" });

            // Small delay to ensure state is updated
            setTimeout(() => {
              Animated.parallel([
                Animated.timing(resetMessageOpacity, {
                  toValue: 1,
                  duration: 400,
                  useNativeDriver: true,
                }),
                Animated.spring(resetMessageScale, {
                  toValue: 1,
                  tension: 80,
                  friction: 8,
                  useNativeDriver: true,
                }),
              ]).start(() => {
                console.log(
                  `[LevelInfoModal] Reset message animation completed`
                );
              });
            }, 50);
          });
        } else {
          // If no confirmation showing, directly show the message
          // Simplified message - just use title, ignore description
          setResetMessage({ type, title, description: "" });

          setTimeout(() => {
            Animated.parallel([
              Animated.timing(resetMessageOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.spring(resetMessageScale, {
                toValue: 1,
                tension: 80,
                friction: 8,
                useNativeDriver: true,
              }),
            ]).start(() => {
              console.log(`[LevelInfoModal] Reset message animation completed`);
            });
          }, 50);
        }

        // Auto-hide after 2.5 seconds (shorter since message is simpler)
        setTimeout(() => {
          console.log(`[LevelInfoModal] Hiding reset message`);
          Animated.parallel([
            Animated.timing(resetMessageOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.spring(resetMessageScale, {
              toValue: 0.8,
              tension: 120,
              friction: 8,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setResetMessage(null);
            console.log(`[LevelInfoModal] Reset message cleared`);
          });
        }, 2500);
      },
      [
        showResetConfirmation,
        confirmationOpacity,
        confirmationScale,
        resetMessageOpacity,
        resetMessageScale,
      ]
    );

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

    const handleShowResetConfirmation = useCallback(() => {
      setShowResetConfirmation(true);

      // Animate confirmation in
      Animated.parallel([
        Animated.timing(confirmationOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(confirmationScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, [confirmationOpacity, confirmationScale]);

    const handleHideResetConfirmation = useCallback(() => {
      // Animate confirmation out
      Animated.parallel([
        Animated.timing(confirmationOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(confirmationScale, {
          toValue: 0.8,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowResetConfirmation(false);
      });
    }, [confirmationOpacity, confirmationScale]);

    const handleResetTimer = useCallback(async () => {
      try {
        setIsResetting(true);

        const result = await resetTimer(levelData?.questionId || levelData?.id);

        if (result.success) {
          // Show simple success message
          showResetMessage("success", "Timer Reset Successfully!");

          // CHANGED: Force refresh progress immediately after reset
          console.log(
            "[LevelInfoModal] Timer reset successful, refreshing progress"
          );
          await fetchProgress(true); // Force refresh to get updated data
          fetchCoinsBalance(true); // Also refresh coins
        } else {
          // Show simple error message
          showResetMessage("error", "Timer Reset Failed. Try again later.");
        }
      } catch (error) {
        // Show simple error message
        showResetMessage("error", "Timer Reset Failed. Try again later.");
      } finally {
        setIsResetting(false);
      }
    }, [
      resetTimer,
      levelData,
      fetchProgress, // Keep this dependency
      fetchCoinsBalance,
      showResetMessage,
    ]);

    // Calculate derived values AFTER all hooks
    const starCount = getStarCount(difficulty);

    // progress badge component
    const ProgressBadge = React.useCallback(() => {
      const canAfford = coins >= 50;

      return (
        <View style={[styles.progressBadge]}>
          {progressInfo.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : (
            <>
              {/* Check if we have progress */}
              {progressInfo.hasProgress ? (
                <>
                  {/* Main Progress Content - Show when no reset states are active */}
                  {!showResetConfirmation && !resetMessage && (
                    <View style={styles.progressBadgeContent}>
                      <View style={styles.progressLeftContent}>
                        <View style={styles.progressIcon}>
                          {progressInfo.isCompleted ? (
                            <CheckCircle
                              width={14}
                              height={14}
                              color="#22C216"
                            />
                          ) : (
                            <Clock width={15} height={15} color="#fbff26ff" />
                          )}
                        </View>
                        <Text style={styles.progressBadgeText}>
                          {progressInfo.isCompleted
                            ? "Completed"
                            : "In Progress"}
                        </Text>
                        <Text style={styles.progressTime}>
                          {formatTime(progressInfo.timeSpent)}
                        </Text>
                        {progressInfo.attempts > 0 && (
                          <View style={styles.attemptContainer}>
                            <RotateCcw
                              width={15}
                              height={15}
                              color="#fbff26ff"
                            />
                            <Text style={styles.progressAttempts}>
                              {progressInfo.attempts}x
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Reset Timer Button */}
                      {progressInfo.hasProgress &&
                        !progressInfo.isCompleted && (
                          <TouchableOpacity
                            style={styles.resetButton}
                            onPress={handleShowResetConfirmation}
                            disabled={isResetting}
                          >
                            <RefreshCw width={14} height={14} color="#fff" />
                            <Text style={styles.resetButtonText}>Reset</Text>
                            <Image
                              source={require("@/assets/images/coin.png")}
                              style={styles.coinImage}
                            />
                            <Text style={styles.resetButtonCost}>50</Text>
                          </TouchableOpacity>
                        )}
                    </View>
                  )}

                  {/* Reset Confirmation */}
                  {showResetConfirmation && !resetMessage && (
                    <Animated.View
                      style={[
                        styles.resetConfirmationContent,
                        {
                          opacity: confirmationOpacity,
                          transform: [{ scale: confirmationScale }],
                        },
                      ]}
                    >
                      <View style={styles.resetConfirmationHeader}>
                        <Text style={styles.resetConfirmationTitle}>
                          Reset Timer?
                        </Text>
                      </View>

                      <View style={styles.resetConfirmationTextContainer}>
                        <View style={styles.costContainer}>
                          <Text style={styles.resetConfirmationText}>
                            Cost:
                          </Text>
                          <Image
                            source={require("@/assets/images/coin.png")}
                            style={styles.coinImage}
                          />
                          <Text style={styles.resetConfirmationText}>50</Text>
                        </View>

                        <Text style={styles.resetConfirmationSeparator}>•</Text>

                        <View style={styles.balanceContainer}>
                          <Text style={styles.resetConfirmationText}>
                            Balance:
                          </Text>
                          <Image
                            source={require("@/assets/images/coin.png")}
                            style={styles.coinImage}
                          />
                          <Text style={styles.resetConfirmationText}>
                            {coins}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.resetConfirmationButtons}>
                        <TouchableOpacity
                          style={styles.resetCancelButton}
                          onPress={handleHideResetConfirmation}
                          disabled={isResetting}
                        >
                          <Text style={styles.resetCancelButtonText}>
                            Cancel
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.resetConfirmButton,
                            (!canAfford || isResetting) &&
                              styles.resetConfirmButtonDisabled,
                          ]}
                          onPress={handleResetTimer}
                          disabled={!canAfford || isResetting}
                        >
                          {isResetting ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text style={styles.resetConfirmButtonText}>
                              {canAfford ? "Reset" : "Can't Reset"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  )}
                </>
              ) : (
                /* No progress - Show placeholder when no reset states are active */
                !showResetConfirmation &&
                !resetMessage && (
                  <View style={styles.noProgressContainer}>
                    <Text style={styles.noProgressText}>No progress yet</Text>
                  </View>
                )
              )}

              {/* Reset Message - Always show when present */}
              {resetMessage && (
                <Animated.View
                  style={[
                    styles.resetMessageContent,
                    {
                      opacity: resetMessageOpacity,
                      transform: [{ scale: resetMessageScale }],
                    },
                  ]}
                >
                  <View style={styles.resetMessageHeader}>
                    <View style={styles.resetMessageIcon}>
                      {resetMessage.type === "success" ? (
                        <CheckCircle width={18} height={18} color="#22C216" />
                      ) : (
                        <AlertTriangle width={18} height={18} color="#FF6B6B" />
                      )}
                    </View>
                    <Text style={styles.resetMessageTitle}>
                      {resetMessage.title}
                    </Text>
                  </View>
                </Animated.View>
              )}
            </>
          )}
        </View>
      );
    }, [
      progressInfo,
      isResetting,
      coins,
      showResetConfirmation,
      resetMessage,
      confirmationOpacity,
      confirmationScale,
      resetMessageOpacity,
      resetMessageScale,
      handleShowResetConfirmation,
      handleHideResetConfirmation,
      handleResetTimer,
    ]);

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

              {/* Enhanced Progress Badge */}
              <ProgressBadge />

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
                    ? "Select the correct answer from the options provided. The timer will continue from where you left off. Be quick but accurate!"
                    : gameMode === "identification"
                    ? "Identify the correct word in the sentence. Tap on it to select. The timer continues from your last attempt. Read carefully!"
                    : "Fill in the blank with the correct word. Type your answer and tap Check. Your timer continues from where you left off. Choose wisely!"}
                </Text>
              </View>

              {/* Start/Continue button */}
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
                      {progressInfo.hasProgress && !progressInfo.isCompleted
                        ? "CONTINUE LEVEL"
                        : progressInfo.isCompleted
                        ? "PLAY AGAIN"
                        : "START LEVEL"}
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
  progressIcon: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBadgeText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#fff",
  },
  progressTime: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#fbff26ff",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  attemptContainer: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  progressAttempts: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#fff",
  },
  progressBadgeContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  progressLeftContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    flex: 1,
    flexWrap: "wrap",
  },
  resetButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(245, 47, 47, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 4,
    marginRight: 8,
    flexShrink: 0,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  resetButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },
  coinImage: {
    width: 16,
    height: 16,
    alignSelf: "center",
  },
  resetButtonCost: {
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    color: "#fbff26ff",
  },
  progressBadge: {
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  resetConfirmationContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: "100%",
  },
  resetConfirmationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    gap: 6,
  },
  resetConfirmationTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
  },
  resetConfirmationText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  resetConfirmationButtons: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  resetCancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    minWidth: 60,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  resetCancelButtonText: {
    fontSize: 11,
    fontFamily: "Poppins-Medium",
    color: "#fff",
    textAlign: "center",
  },
  resetConfirmButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    minWidth: 60,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  resetConfirmButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    opacity: 0.6,
  },
  resetConfirmButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    textAlign: "center",
  },
  resetConfirmationTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    gap: 8,
  },
  costContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  resetConfirmationSeparator: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
  },
  resetMessageContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    width: "100%",
    borderRadius: 16,
  },
  resetMessageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  resetMessageIcon: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 11,
    marginRight: 8,
  },
  resetMessageTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#fff",
  },

  // Existing styles
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
  noProgressContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  noProgressText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});

export default LevelInfoModal;
