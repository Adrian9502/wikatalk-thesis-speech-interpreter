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
import ModalLoading from "../ModalLoading";
import CloseButton from "@/components/games/buttons/CloseButton";
import { BASE_COLORS } from "@/constant/colors";

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

      // IMPORTANT: Check if progress data is preloaded, if so render immediately
      InteractionManager.runAfterInteractions(() => {
        const interactionDelay = Date.now() - startTime;
        console.log(
          `[ProgressModal] Interactions completed in ${interactionDelay}ms`
        );

        // Check if progress data is already preloaded
        const hasPreloadedData = preloadedData !== null;

        if (hasPreloadedData) {
          // If data is preloaded, show content immediately
          console.log(
            `[ProgressModal] Using preloaded data, showing content immediately`
          );
          setContentReady(true);
        } else {
          // If not preloaded, add small delay
          setTimeout(() => {
            setContentReady(true);
          }, 100);
        }
      });
    },
    []
  );

  // Hide modal function
  const hideProgressModal = useCallback(() => {
    console.log(`[ProgressModalProvider] Closing progress modal`);
    // Hide immediately - animate out using Modal's built-in animation
    setVisible(false);
  }, []);

  // Memoized gradient colors
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
            {/* First phase: show loading spinner with gradient - NO HEADER */}
            {!contentReady && (
              <LinearGradient
                colors={gradientColors}
                style={styles.loadingContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <CloseButton size={17} onPress={hideProgressModal} />
                <ModalLoading />
              </LinearGradient>
            )}

            {/* Second phase: render actual content - NO SEPARATE ANIMATION */}
            {contentReady && (
              <View style={styles.contentContainer}>
                <GameProgressModalContent
                  gameMode={gameMode}
                  gameTitle={gameTitle}
                  preloadedData={preloadedData}
                  onClose={hideProgressModal}
                />
              </View>
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
    paddingHorizontal: 16,
  },
  container: {
    width: "90%",
    height: "60%",
    borderRadius: 20,
    overflow: "hidden",
  },
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    padding: 20,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
});
