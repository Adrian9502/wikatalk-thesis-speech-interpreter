import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { Modal, StyleSheet, View, ActivityIndicator, Text } from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import GameProgressModalContent from "@/components/games/GameProgressModal/GameProgressModalContent";
import useProgressStore from "@/store/games/useProgressStore";
import { EnhancedGameModeProgress } from "@/types/gameProgressTypes";
import { InteractionManager } from "react-native";
import { getGameModeGradient } from "@/utils/gameUtils";

// Create context for modal control
const ProgressModalContext = createContext<{
  showProgressModal: (gameMode: string, gameTitle: string) => void;
  hideProgressModal: () => void;
}>({
  showProgressModal: () => {},
  hideProgressModal: () => {},
});

// Hook to use the modal
export const useProgressModal = () => useContext(ProgressModalContext);

// Provider component that wraps your app
export const ProgressModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State for modal control
  const [visible, setVisible] = useState(false);
  const [gameMode, setGameMode] = useState("");
  const [gameTitle, setGameTitle] = useState("");
  const [preloadedData, setPreloadedData] =
    useState<EnhancedGameModeProgress | null>(null);

  // New state to handle content rendering in phases
  const [contentReady, setContentReady] = useState(false);
  const [renderStartTime, setRenderStartTime] = useState(0);

  // Animation refs
  const modalRef = useRef<Animatable.View>(null);

  // Reset content ready state when modal closes
  useEffect(() => {
    if (!visible) {
      setContentReady(false);
    }
  }, [visible]);

  // Show modal function with optimized animation timing
  const showProgressModal = useCallback(
    (gameMode: string, gameTitle: string) => {
      // Start tracking performance
      const startTime = Date.now();
      setRenderStartTime(startTime);
      console.log(`[ProgressModalProvider] Opening modal for ${gameMode}`);

      // Get preloaded data first - before showing the modal
      const preloadedData =
        useProgressStore.getState().enhancedProgress[gameMode];

      // Set up the modal before showing it
      setGameMode(gameMode);
      setGameTitle(gameTitle);
      setPreloadedData(preloadedData);
      setContentReady(false); // Reset content ready state

      // Show modal immediately
      setVisible(true);

      // IMPORTANT: Defer heavy content rendering until after animation completes
      InteractionManager.runAfterInteractions(() => {
        const interactionDelay = Date.now() - startTime;
        console.log(
          `[ProgressModal] Interactions completed in ${interactionDelay}ms`
        );

        // Add a small timeout to ensure animation has completed
        setTimeout(() => {
          setContentReady(true);
        }, 100);
      });
    },
    []
  );

  // Hide modal function
  const hideProgressModal = useCallback(() => {
    // Hide immediately - animate out using Modal's built-in animation
    setVisible(false);
  }, []);

  // Replace the existing gradientColors code with:
  const gradientColors = React.useMemo(
    () => getGameModeGradient(gameMode),
    [gameMode]
  );

  return (
    <ProgressModalContext.Provider
      value={{ showProgressModal, hideProgressModal }}
    >
      {children}

      {/* Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        hardwareAccelerated={true}
        onRequestClose={hideProgressModal}
      >
        <View style={styles.overlay}>
          <Animatable.View
            animation="zoomIn"
            duration={300}
            useNativeDriver
            style={styles.container}
          >
            {/* First phase: show loading spinner with gradient */}
            {!contentReady && (
              <LinearGradient
                colors={gradientColors}
                style={styles.loadingContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.loadingText}>Loading progress data...</Text>
              </LinearGradient>
            )}

            {/* Second phase: render actual content */}
            {contentReady && (
              <Animatable.View
                animation="fadeIn"
                duration={300}
                useNativeDriver
                style={styles.contentContainer}
              >
                <GameProgressModalContent
                  gameMode={gameMode}
                  gameTitle={gameTitle}
                  preloadedData={preloadedData}
                  onClose={hideProgressModal}
                />
              </Animatable.View>
            )}
          </Animatable.View>
        </View>
      </Modal>
    </ProgressModalContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    height: "60%",
    borderRadius: 16,
    overflow: "hidden",
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 13,
    fontFamily: "Poppins-Regular",
    fontSize: 16,
  },
});
