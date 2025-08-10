import React, { useCallback } from "react";
import { Modal, View, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { difficultyColors } from "@/constant/colors";
import { getStarCount } from "@/utils/games/difficultyUtils";
import modalSharedStyles from "@/styles/games/modalSharedStyles";
import ResetCostInfoModal from "@/components/games/levels/ResetCostInfoModal";
import { useLevelInfoModal } from "@/hooks/useLevelInfoModal";
import { useLevelInfoModalAnimations } from "@/hooks/useLevelInfoModalAnimations";
import ProgressBadge from "./modal/ProgressBadge";
import LevelHeader from "./modal/LevelHeader";
import LevelContent from "./modal/LevelContent";
import ActionButton from "./modal/ActionButton";
import { styles } from "@/styles/games/levels/levelInfoModal.style";

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
    // Custom hooks
    const {
      isAnimating,
      hasStarted,
      showResetConfirmation,
      isResetting,
      resetMessage,
      showCostInfoModal,
      progressInfo,
      resetCostInfo,
      coins,
      setIsAnimating,
      setHasStarted,
      setShowResetConfirmation,
      setIsResetting,
      setResetMessage,
      setShowCostInfoModal,
      overlayOpacity,
      modalTranslateY,
      confirmationOpacity,
      confirmationScale,
      resetMessageOpacity,
      resetMessageScale,
      fetchProgress,
      fetchCoinsBalance,
      resetTimer,
    } = useLevelInfoModal(visible, levelData);

    const {
      handleStart: animateStart,
      handleClose: animateClose,
      handleShowResetConfirmation,
      handleHideResetConfirmation,
      showResetMessage,
    } = useLevelInfoModalAnimations(
      overlayOpacity,
      confirmationOpacity,
      confirmationScale,
      resetMessageOpacity,
      resetMessageScale,
      showResetConfirmation,
      setShowResetConfirmation,
      setResetMessage
    );

    // Handlers
    const handleStart = useCallback(() => {
      // SIMPLIFIED: Only check critical loading states, not progress loading
      const isAnyLoading = isLoading || isAnimating || hasStarted;

      console.log(`[LevelInfoModal] Start button pressed - Loading checks:`, {
        isLoading,
        isAnimating,
        hasStarted,
        isAnyLoading,
      });

      if (isAnyLoading) {
        console.log(`[LevelInfoModal] Start button disabled - still loading`);
        return;
      }

      animateStart(onStart, isLoading, isAnimating, hasStarted, setHasStarted);
    }, [
      animateStart,
      onStart,
      isLoading,
      isAnimating,
      hasStarted,
      setHasStarted,
    ]);

    const handleClose = useCallback(() => {
      animateClose(onClose, isAnimating, setIsAnimating);
    }, [animateClose, onClose, isAnimating, setIsAnimating]);

    const handleResetTimer = useCallback(async () => {
      try {
        setIsResetting(true);

        const result = await resetTimer(levelData?.questionId || levelData?.id);

        if (result.success) {
          const costInfo = result.costBreakdown;
          const message = costInfo
            ? `Timer Reset! ${result.coinsDeducted} coins deducted.`
            : "Timer Reset Successfully!";

          showResetMessage("success", message);

          console.log(
            "[LevelInfoModal] Timer reset successful, refreshing progress"
          );
          await fetchProgress(true);
          fetchCoinsBalance(true);
        } else {
          const message =
            result.message || "Timer Reset Failed. Try again later.";
          showResetMessage("error", message);
        }
      } catch (error) {
        showResetMessage("error", "Timer Reset Failed. Try again later.");
      } finally {
        setIsResetting(false);
      }
    }, [
      resetTimer,
      levelData,
      fetchProgress,
      fetchCoinsBalance,
      showResetMessage,
      setIsResetting,
    ]);

    // Calculate derived values
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

    // FIXED: Don't block modal rendering while progress is loading
    if (!visible || !levelData) {
      return null;
    }

    // FIXED: Allow modal to show even if hasStarted is true (for smooth transitions)
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
              style={[modalSharedStyles.modalContent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Decorative background elements */}
              <View style={modalSharedStyles.decorativeShape1} />
              <View style={modalSharedStyles.decorativeShape2} />
              <View style={styles.decorativeShape3} />

              {/* Header Section */}
              <LevelHeader
                levelData={levelData}
                difficulty={difficulty}
                starCount={starCount}
                onClose={handleClose}
                onShowCostInfo={() => setShowCostInfoModal(true)}
                isAnimating={isAnimating}
                styles={styles}
              />

              {/* Progress Badge - This will handle its own loading state */}
              <ProgressBadge
                progressInfo={progressInfo}
                isResetting={isResetting}
                coins={coins}
                resetCostInfo={resetCostInfo}
                showResetConfirmation={showResetConfirmation}
                resetMessage={resetMessage}
                confirmationOpacity={confirmationOpacity}
                confirmationScale={confirmationScale}
                resetMessageOpacity={resetMessageOpacity}
                resetMessageScale={resetMessageScale}
                onShowResetConfirmation={handleShowResetConfirmation}
                onHideResetConfirmation={handleHideResetConfirmation}
                onResetTimer={handleResetTimer}
                styles={styles}
              />

              {/* Content Section */}
              <LevelContent
                levelData={levelData}
                gameMode={gameMode}
                styles={styles}
              />

              {/* Action Button */}
              <ActionButton
                onStart={handleStart}
                isLoading={isLoading}
                isAnimating={isAnimating}
                hasStarted={hasStarted}
                hasProgress={progressInfo.hasProgress}
                progressIsLoading={progressInfo.isLoading}
                styles={styles}
              />
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        {/* Cost Info Modal */}
        <ResetCostInfoModal
          visible={showCostInfoModal}
          onClose={() => setShowCostInfoModal(false)}
        />
      </Modal>
    );
  }
);

export default LevelInfoModal;
