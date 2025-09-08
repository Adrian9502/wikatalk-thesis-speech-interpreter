import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import {
  Clock,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from "react-native-feather";
import { formatTime } from "@/utils/gameUtils";
import ResetButton from "@/components/games/buttons/ResetButton";
import { BASE_COLORS } from "@/constant/colors";

interface ProgressBadgeProps {
  progressInfo: {
    hasProgress: boolean;
    timeSpent: number;
    attempts: number;
    isCompleted: boolean;
    isLoading: boolean;
  };
  isResetting: boolean;
  coins: number;
  resetCostInfo: {
    cost: number;
    description: string;
    timeRange: string;
    timeSpent: number;
  };
  showResetConfirmation: boolean;
  resetMessage: {
    type: "success" | "error";
    title: string;
    description: string;
  } | null;
  confirmationOpacity: Animated.Value;
  confirmationScale: Animated.Value;
  resetMessageOpacity: Animated.Value;
  resetMessageScale: Animated.Value;
  onShowResetConfirmation: () => void;
  onHideResetConfirmation: () => void;
  onResetTimer: () => void;
  styles: any;
}

const ProgressBadge: React.FC<ProgressBadgeProps> = ({
  progressInfo,
  isResetting,
  coins,
  resetCostInfo,
  showResetConfirmation,
  resetMessage,
  confirmationOpacity,
  confirmationScale,
  resetMessageOpacity,
  resetMessageScale,
  onShowResetConfirmation,
  onHideResetConfirmation,
  onResetTimer,
  styles,
}) => {
  const canAfford = coins >= resetCostInfo.cost;

  if (progressInfo.isLoading) {
    return (
      <View style={[styles.progressBadge]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={BASE_COLORS.white} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.progressBadge]}>
      {progressInfo.hasProgress ? (
        <>
          {/* Main Progress Content */}
          {!showResetConfirmation && !resetMessage && (
            <View style={styles.progressBadgeContent}>
              <View style={styles.progressItemsContainer}>
                {/* Status Item */}
                <View style={styles.progressItem}>
                  <Text style={styles.progressItemText}>In Progress</Text>
                </View>

                {/* Time Item */}
                <View style={styles.progressItem}>
                  <View style={styles.progressItemIcon}>
                    <Clock width={14} height={14} color={BASE_COLORS.white} />
                  </View>
                  <Text style={styles.progressItemText}>
                    {formatTime(progressInfo.timeSpent)}
                  </Text>
                </View>

                {/* Attempts Item (only show if attempts > 0) */}
                {progressInfo.attempts > 0 && (
                  <View style={styles.progressItem}>
                    <View style={styles.progressItemIcon}>
                      <RefreshCw
                        width={14}
                        height={14}
                        color={BASE_COLORS.white}
                      />
                    </View>
                    <Text style={styles.progressItemText}>
                      {progressInfo.attempts}x
                    </Text>
                  </View>
                )}
              </View>

              {/* Reset Button (only if in progress) */}
              <ResetButton
                onPress={onShowResetConfirmation}
                disabled={isResetting}
                isLoading={isResetting}
                cost={resetCostInfo.cost}
                variant="expanded"
                size="small"
                showCostLabel={true}
                costLabel="Reset"
                showOnlyWhen={
                  progressInfo.hasProgress && !progressInfo.isCompleted
                }
              />
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
                <Text style={styles.resetConfirmationTitle}>Reset Timer?</Text>
              </View>

              <View style={styles.resetConfirmationTextContainer}>
                <View style={styles.costContainer}>
                  <Text style={styles.resetConfirmationText}>Cost:</Text>
                  <Image
                    source={require("@/assets/images/coin.png")}
                    style={styles.coinImage}
                  />
                  <Text style={styles.resetConfirmationText}>
                    {resetCostInfo.cost}
                  </Text>
                </View>

                <Text style={styles.resetConfirmationSeparator}>•</Text>

                <View style={styles.balanceContainer}>
                  <Text style={styles.resetConfirmationText}>Balance:</Text>
                  <Image
                    source={require("@/assets/images/coin.png")}
                    style={styles.coinImage}
                  />
                  <Text style={styles.resetConfirmationText}>{coins}</Text>
                </View>
              </View>

              <View style={styles.resetConfirmationButtons}>
                <TouchableOpacity
                  style={styles.resetCancelButton}
                  onPress={onHideResetConfirmation}
                  disabled={isResetting}
                >
                  <Text style={styles.resetCancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.resetConfirmButton,
                    (!canAfford || isResetting) &&
                      styles.resetConfirmButtonDisabled,
                  ]}
                  onPress={onResetTimer}
                  disabled={!canAfford || isResetting}
                >
                  {isResetting ? (
                    <ActivityIndicator size="small" color={BASE_COLORS.white} />
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
        /* No progress - Show placeholder */
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
                <CheckCircle width={18} height={18} color={BASE_COLORS.white} />
              ) : (
                <AlertTriangle width={18} height={18} color="#FF6B6B" />
              )}
            </View>
            <Text style={styles.resetMessageTitle}>{resetMessage.title}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default React.memo(ProgressBadge);
