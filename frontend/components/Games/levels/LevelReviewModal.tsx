import React, { useEffect, useState } from "react";
import { Modal, View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { LevelData } from "@/types/gameTypes";
import modalSharedStyles from "@/styles/games/modalSharedStyles";
import { useLevelDetails } from "@/hooks/useLevelDetails";
import LevelHeader from "@/components/games/levelReviewModal/LevelHeader";
import LevelDetailsSection from "@/components/games/levelReviewModal/LevelDetailsSection";
import LevelStatsSection from "@/components/games/levelReviewModal/LevelStatsSection";

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
  const [isAnimating, setIsAnimating] = useState(false);

  const { details, isLoading, error } = useLevelDetails(
    level,
    visible && !!level
  );

  // Handle animation state
  useEffect(() => {
    if (visible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 400); // Longer delay for review modal
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [visible]);

  if (!level) {
    return null;
  }

  const handleClose = () => {
    if (isAnimating) return;
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none" // Use custom animation
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animatable.View
        animation="fadeIn"
        duration={250}
        style={modalSharedStyles.overlay}
      >
        <Animatable.View
          animation="bounceInUp"
          duration={1000}
          style={styles.modalContainer}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalContent}
          >
            {/* Decorative elements */}
            <View style={modalSharedStyles.decorativeShape1} />
            <View style={modalSharedStyles.decorativeShape2} />

            {/* Fixed Header Section */}
            <LevelHeader level={level} />

            <LevelDetailsSection
              details={details}
              isLoading={isLoading}
              error={error}
            />

            <LevelStatsSection details={details} isLoading={isLoading} />

            <TouchableOpacity
              style={[
                modalSharedStyles.startAndCloseButton,
                isAnimating && styles.disabledButton,
              ]}
              onPress={handleClose}
              disabled={isAnimating}
              activeOpacity={0.7}
            >
              <Text style={modalSharedStyles.startAndCloseText}>CLOSE</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animatable.View>
      </Animatable.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    overflow: "hidden",
  },
  modalContent: {
    padding: 20,
    minHeight: 500,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default React.memo(LevelReviewModal);
