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

  // Performance tracking
  const renderStartTime = useMemo(() => Date.now(), []);

  // Use preloaded data if available, or load it
  useEffect(() => {
    // If we already have data, skip loading
    if (preloadedData) {
      setProgressData(preloadedData);
      setIsDataLoading(false);
      return;
    }

    // Performance logging
    console.log(`[GameProgressModalContent] Loading data for ${gameMode}`);

    // Load data
    const loadData = async () => {
      try {
        // First check if we have cached data
        const cachedData =
          useProgressStore.getState().enhancedProgress[gameMode];

        if (cachedData) {
          setProgressData(cachedData);
          setIsDataLoading(false);
          return;
        }

        // Load fresh data
        const data = await useProgressStore
          .getState()
          .getEnhancedGameProgress(gameMode);
        setProgressData(data);
        setIsDataLoading(false);
      } catch (error) {
        console.error("[GameProgressModalContent] Error loading data:", error);
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [gameMode, preloadedData]);

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
      {/* Header - Always render this immediately */}
      <View style={styles.header}>
        <Text style={styles.title}>{gameTitle} Progress</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          activeOpacity={0.7}
        >
          <X width={20} height={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Content - Show loading indicator or actual content */}
      {isDataLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
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
  closeButton: {
    position: "absolute",
    right: 0,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 16,
  },
});

export default React.memo(GameProgressModalContent);
