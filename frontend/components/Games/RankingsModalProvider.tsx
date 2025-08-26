import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { Modal, StyleSheet, View, Text } from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import RankingCategorySelector from "@/components/games/rankings/RankingCategorySelector";
import RankingContent from "@/components/games/rankings/RankingContent";
import CloseButton from "@/components/games/buttons/CloseButton";
import { NAVIGATION_COLORS, RANKING_COLORS } from "@/constant/colors";
import { InteractionManager } from "react-native";
import ModalLoading from "../ModalLoading";

// Create context for modal control
const RankingsModalContext = createContext<{
  showRankingsModal: () => void;
  hideRankingsModal: () => void;
}>({
  showRankingsModal: () => {},
  hideRankingsModal: () => {},
});

// Hook to use the modal
export const useRankingsModal = () => useContext(RankingsModalContext);

// Provider component that wraps your app
export const RankingsModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // State for modal control
  const [visible, setVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("quizChampions");

  // New state to handle content rendering in phases
  const [contentReady, setContentReady] = useState(false);

  // Animation refs
  const modalRef = useRef<Animatable.View>(null);

  // Reset content ready state when modal closes
  useEffect(() => {
    if (!visible) {
      setContentReady(false);
      // Reset to default category when modal closes
      setSelectedCategory("quizChampions");
    }
  }, [visible]);

  // Show modal function with optimized animation timing
  const showRankingsModal = useCallback(() => {
    // Start tracking performance
    const startTime = Date.now();
    console.log(`[RankingsModalProvider] Opening rankings modal`);

    // Reset states before showing modal
    setContentReady(false);
    setSelectedCategory("quizChampions");

    // Show modal immediately
    setVisible(true);

    // IMPORTANT: Defer heavy content rendering until after animation completes
    InteractionManager.runAfterInteractions(() => {
      const interactionDelay = Date.now() - startTime;
      console.log(
        `[RankingsModal] Interactions completed in ${interactionDelay}ms`
      );

      // Add a small timeout to ensure animation has completed
      setTimeout(() => {
        setContentReady(true);
      }, 100);
    });
  }, []);

  // Hide modal function
  const hideRankingsModal = useCallback(() => {
    console.log(`[RankingsModalProvider] Closing rankings modal`);
    // Hide immediately - animate out using Modal's built-in animation
    setVisible(false);
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      if (categoryId !== selectedCategory) {
        console.log(`[RankingsModal] Switching to category: ${categoryId}`);
        setSelectedCategory(categoryId);
      }
    },
    [selectedCategory]
  );

  return (
    <RankingsModalContext.Provider
      value={{ showRankingsModal, hideRankingsModal }}
    >
      {children}

      {/* Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        hardwareAccelerated={true}
        onRequestClose={hideRankingsModal}
      >
        <View style={styles.overlay}>
          <Animatable.View
            ref={modalRef}
            animation="zoomIn"
            duration={300}
            useNativeDriver
            style={styles.container}
          >
            {!contentReady && (
              <LinearGradient
                colors={RANKING_COLORS}
                style={styles.loadingContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <CloseButton size={17} onPress={hideRankingsModal} />
                <View style={styles.headerContent}>
                  <Text style={styles.title}>Rankings</Text>
                </View>
                <ModalLoading />
              </LinearGradient>
            )}

            {contentReady && (
              <View style={styles.contentContainer}>
                <LinearGradient
                  colors={RANKING_COLORS}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientBackground}
                >
                  <CloseButton size={17} onPress={hideRankingsModal} />

                  <View style={styles.headerContent}>
                    <Text style={styles.title}>Rankings</Text>
                  </View>

                  <RankingCategorySelector
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                  />

                  {/* Rankings Content */}
                  <RankingContent
                    selectedCategory={selectedCategory}
                    visible={visible && contentReady}
                  />
                </LinearGradient>
              </View>
            )}
          </Animatable.View>
        </View>
      </Modal>
    </RankingsModalContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  container: {
    width: "95%",
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
  gradientBackground: {
    flex: 1,
    padding: 20,
    position: "relative",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#FFF",
    textAlign: "center",
  },
});
