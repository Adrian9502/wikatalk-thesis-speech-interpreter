import React, { useMemo } from "react";
import { TouchableOpacity, Text, StyleSheet, Image, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { BASE_COLORS } from "@/constant/colors";
import useHintStore from "@/store/games/useHintStore";
import useCoinsStore from "@/store/games/useCoinsStore";

// sound
import { playSound } from "@/utils/playSound";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

interface HintButtonProps {
  questionId: string;
  gameMode: string;
  options: any[];
  disabled?: boolean;
}

const HintButton: React.FC<HintButtonProps> = ({
  questionId,
  gameMode,
  options,
  disabled = false,
}) => {
  const { coins, fetchCoinsBalance } = useCoinsStore(); // ADD: fetchCoinsBalance
  const {
    purchaseHint,
    getHintCost,
    canUseHint,
    getMaxHints,
    hintsUsedCount,
    isLoading,
    error,
  } = useHintStore();

  // NEW: Get max hints for this game mode
  const maxHints = useMemo(
    () => getMaxHints(gameMode),
    [gameMode, getMaxHints]
  );

  // UPDATED: Pass game mode to getHintCost
  const hintCost = useMemo(
    () => getHintCost(hintsUsedCount, gameMode),
    [hintsUsedCount, gameMode, getHintCost]
  );

  const canAfford = useMemo(
    () => (hintCost ? coins >= hintCost : false),
    [coins, hintCost]
  );

  // UPDATED: Pass game mode to canUseHint
  const canPurchase = useMemo(
    () =>
      !disabled &&
      canUseHint(hintsUsedCount, gameMode) &&
      canAfford &&
      !isLoading,
    [disabled, canUseHint, hintsUsedCount, gameMode, canAfford, isLoading]
  );

  // Determine button state for styling
  const buttonState = useMemo(() => {
    if (isLoading) return "loading";
    if (!canUseHint(hintsUsedCount, gameMode)) return "maxReached";
    if (!canAfford) return "insufficientFunds";
    if (disabled) return "disabled";
    return "available";
  }, [isLoading, canUseHint, hintsUsedCount, gameMode, canAfford, disabled]);

  const handlePurchaseHint = async () => {
    if (!canPurchase) {
      console.log(
        `[HintButton] Cannot purchase: disabled=${disabled}, canAfford=${canAfford}, hintsUsed=${hintsUsedCount}/${maxHints}, gameMode=${gameMode}`
      );
      return;
    }

    console.log(
      `[HintButton] Purchasing hint for ${gameMode} question ${questionId}`
    );
    const success = await purchaseHint(questionId, gameMode, options);

    // Refresh coins immediately after successful purchase
    if (success) {
      console.log("[HintButton] Hint purchased successfully, refreshing coins");
      playSound("coinSpend");
      await fetchCoinsBalance(true);
    } else if (error) {
      console.error(`[HintButton] Failed to purchase hint: ${error}`);
    }
  };

  // Get gradient colors based on state
  const getGradientColors = () => {
    switch (buttonState) {
      case "available":
        return ["#4CAF50", "#66BB6A"] as const;
      case "loading":
        return ["#2196F3", "#42A5F5"] as const;
      case "insufficientFunds":
        return ["#F44336", "#EF5350"] as const;
      case "maxReached":
        return ["#9E9E9E", "#BDBDBD"] as const;
      case "disabled":
      default:
        return [
          "rgba(255, 255, 255, 0.1)",
          "rgba(255, 255, 255, 0.05)",
        ] as const;
    }
  };

  // Get button content based on state
  const getButtonContent = () => {
    switch (buttonState) {
      case "insufficientFunds":
        return {
          text: "Get Hint",
          costText: hintCost !== null ? `(-${hintCost}` : "",
          showCoin: true,
          suffix: ")",
        };
      case "maxReached":
        return {
          text: `Max Hints Used (${maxHints})`, // NEW: Show game mode specific max
          costText: "",
          showCoin: false,
          suffix: "",
        };
      case "loading":
        return {
          text: "Getting Hint...",
          costText: "",
          showCoin: false,
          suffix: "",
        };
      default:
        return {
          text: "Get Hint",
          costText: hintCost !== null ? `(-${hintCost}` : "",
          showCoin: true,
          suffix: ")",
        };
    }
  };

  // Don't render if no hint cost (max hints reached)
  if (!hintCost && buttonState !== "maxReached") {
    return null;
  }

  const buttonContent = getButtonContent();

  return (
    <View style={styles.container}>
      {/* Centered Hint Button */}
      <TouchableOpacity
        style={[styles.hintButton]}
        onPress={handlePurchaseHint}
        disabled={!canPurchase}
        activeOpacity={canPurchase ? 0.7 : 1}
      >
        <LinearGradient
          colors={getGradientColors()}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {/* Row Text Content */}
          <View style={styles.textContent}>
            <Text style={styles.buttonText}>
              {buttonContent.text}
              {buttonContent.costText && (
                <>
                  <Text style={styles.buttonText}>
                    {" "}
                    {buttonContent.costText}
                  </Text>
                  {buttonContent.showCoin && (
                    <Text style={styles.buttonText}> </Text>
                  )}
                </>
              )}
            </Text>
            {buttonContent.showCoin && (
              <Image
                source={require("@/assets/images/coin.png")}
                style={[styles.coinIcon]}
              />
            )}
            {buttonContent.suffix && (
              <Text style={styles.buttonText}>{buttonContent.suffix}</Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {hintsUsedCount > 0 && (
        <View style={styles.hintsUsedContainer}>
          <Text style={styles.hintsUsedText}>
            Hints used: {hintsUsedCount}/{maxHints}
          </Text>
          <View style={styles.hintsProgress}>
            {Array.from({ length: maxHints }, (_, i) => i + 1).map((i) => (
              <View
                key={i}
                style={[
                  styles.hintDot,
                  i <= hintsUsedCount && styles.hintDotUsed,
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* Error Message */}
      {error && buttonState === "insufficientFunds" && hintCost !== null && (
        <Text style={styles.errorText}>
          You need {hintCost - coins} more coins
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
  },

  // Hint Button
  hintButton: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  buttonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },

  textContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  buttonText: {
    fontSize: COMPONENT_FONT_SIZES.button.medium,
    fontFamily: POPPINS_FONT.medium,
    color: BASE_COLORS.white,
    textAlign: "center",
  },

  coinIcon: {
    width: 12,
    height: 12,
    marginBottom: 4,
  },

  // Hints Used Indicator
  hintsUsedContainer: {
    alignItems: "center",
    gap: 6,
  },
  hintsUsedText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    fontFamily: POPPINS_FONT.medium,
    color: "rgba(255, 255, 255, 0.7)",
  },
  hintsProgress: {
    flexDirection: "row",
    gap: 4,
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  hintDotUsed: {
    backgroundColor: "#4CAF50",
  },

  // Error Text
  errorText: {
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    color: BASE_COLORS.danger,
    fontFamily: POPPINS_FONT.medium,
    textAlign: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
    marginTop: 4,
  },
});

export default React.memo(HintButton);
