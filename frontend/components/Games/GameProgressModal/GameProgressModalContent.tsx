import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X } from "react-native-feather";
import { EnhancedGameModeProgress } from "@/types/gameProgressTypes";
import ProgressContent from "./ProgressContent";
import useProgressStore from "@/store/games/useProgressStore";
// utility function
import { getGameModeGradient } from "@/utils/gameUtils";
import ModalLoading from "@/components/ModalLoading";
import CloseButton from "../buttons/CloseButton";

interface GameProgressModalContentProps {
  gameMode: string;
  gameTitle: string;
  preloadedData: EnhancedGameModeProgress | null;
  onClose: () => void;
}

const GameProgressModalContent: React.FC<GameProgressModalContentProps> = ({
  gameMode,
  gameTitle,
  preloadedData,
  onClose,
}) => {
  // Load state
  const [isDataLoading, setIsDataLoading] = useState(!preloadedData);
  const [progressData, setProgressData] =
    useState<EnhancedGameModeProgress | null>(preloadedData);

  // ADDED: Listen to progress store updates
  const { lastUpdated } = useProgressStore();

  // Performance tracking
  const renderStartTime = useMemo(() => Date.now(), []);

  // SIMPLIFIED: Single effect for data loading
  useEffect(() => {
    const loadData = async (forceRefresh = false) => {
      try {
        // If we have preloaded data and no force refresh, use it
        if (preloadedData && !forceRefresh) {
          console.log(
            `[GameProgressModalContent] Using preloaded data for ${gameMode}`
          );
          setProgressData(preloadedData);
          setIsDataLoading(false);
          return;
        }

        console.log(
          `[GameProgressModalContent] Loading data for ${gameMode} (force: ${forceRefresh})`
        );

        // Clear cache if force refresh
        if (forceRefresh) {
          useProgressStore.setState((state) => ({
            enhancedProgress: {
              ...state.enhancedProgress,
              [gameMode]: null,
            },
          }));
        }

        setIsDataLoading(true);

        // Load fresh data
        const data = await useProgressStore
          .getState()
          .getEnhancedGameProgress(gameMode);
        setProgressData(data);
        setIsDataLoading(false);

        console.log(`[GameProgressModalContent] Data loaded for ${gameMode}:`, {
          totalAttempts: data?.totalAttempts || 0,
          recentAttempts: data?.recentAttempts?.length || 0,
        });
      } catch (error) {
        console.error("[GameProgressModalContent] Error loading data:", error);
        setIsDataLoading(false);
      }
    };

    // Initial load
    loadData();
  }, [gameMode, preloadedData]);

  // ADDED: Listen for progress updates and refresh data
  useEffect(() => {
    if (!gameMode || !lastUpdated) return;

    console.log(
      `[GameProgressModalContent] Progress updated for ${gameMode}, refreshing data`
    );

    // Small delay to ensure backend has processed the update
    const timer = setTimeout(() => {
      const loadFreshData = async () => {
        try {
          // Force refresh by clearing cache first
          useProgressStore.setState((state) => ({
            enhancedProgress: {
              ...state.enhancedProgress,
              [gameMode]: null,
            },
          }));

          // Load fresh data
          const data = await useProgressStore
            .getState()
            .getEnhancedGameProgress(gameMode);
          setProgressData(data);

          console.log(
            `[GameProgressModalContent] Data refreshed for ${gameMode} after progress update`
          );
        } catch (error) {
          console.error(
            "[GameProgressModalContent] Error refreshing data:",
            error
          );
        }
      };

      loadFreshData();
    }, 500); // Small delay to ensure backend processing is complete

    return () => clearTimeout(timer);
  }, [lastUpdated, gameMode]);

  // Mark render completion
  useEffect(() => {
    const renderTime = Date.now() - renderStartTime;
    console.log(`[GameProgressModalContent] Rendered in ${renderTime}ms`);
  }, [renderStartTime]);

  // Memoized gradient colors to avoid recalculation
  const gradientColors = useMemo(
    () => getGameModeGradient(gameMode),
    [gameMode]
  );

  // Optimize close handler
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.gradientBackground}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <CloseButton size={17} onPress={handleClose}></CloseButton>
      {/* Header - Always render this immediately */}
      <View style={styles.header}>
        <Text style={styles.title}>{gameTitle} Progress</Text>
      </View>

      {/* Content - Show loading indicator or actual content */}
      {isDataLoading ? (
        <ModalLoading />
      ) : (
        <ProgressContent
          progressData={progressData}
          isLoading={isDataLoading}
          gameMode={gameMode}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative",
  },
  title: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
    textAlign: "center",
  },
});

export default React.memo(GameProgressModalContent);
