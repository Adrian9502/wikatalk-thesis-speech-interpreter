import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LevelData } from "@/types/gameTypes";
import modalSharedStyles from "@/styles/games/modalSharedStyles";
import { useLevelDetails } from "@/hooks/useLevelDetails";
import LevelHeader from "@/components/games/levelReviewModal/LevelHeader";
import LevelDetailsSection from "@/components/games/levelReviewModal/LevelDetailsSection";
import LevelStatsSection from "@/components/games/levelReviewModal/LevelStatsSection";
import ModalLoading from "@/components/ModalLoading";

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
  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(300)).current;

  const { details, isLoading, error } = useLevelDetails(
    level,
    visible && !!level
  );

  // Handle modal entrance animation
  useEffect(() => {
    if (visible && level) {
      setIsAnimating(true);
      setIsClosing(false);

      // Start entrance animation
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(modalTranslateY, {
          toValue: 0,
          tension: 120,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
      });
    } else {
      // Reset values when modal is hidden
      overlayOpacity.setValue(0);
      modalTranslateY.setValue(300);
      setIsAnimating(false);
      setIsClosing(false);
    }
  }, [visible, level]);

  // Handle modal exit animation
  const handleClose = useCallback(() => {
    if (isAnimating || isClosing) return;

    setIsClosing(true);

    // Only fade out using opacity
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      setIsClosing(false);
      onClose();
    });
  }, [isAnimating, isClosing]);

  if (!level) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
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
            styles.modalContainer,
            {
              transform: [{ translateY: modalTranslateY }],
            },
          ]}
        >
          {/* Show unified loader while loading */}
          {isLoading ? (
            <LinearGradient
              colors={gradientColors}
              style={styles.loaderContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <ModalLoading />
            </LinearGradient>
          ) : (
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalContent}
            >
              {/* Decorative elements */}
              <View style={modalSharedStyles.decorativeShape1} />
              <View style={modalSharedStyles.decorativeShape2} />

              {/* Content */}
              <LevelHeader level={level} />

              <LevelDetailsSection details={details} error={error} />

              <LevelStatsSection details={details} />

              <TouchableOpacity
                style={[
                  modalSharedStyles.startAndCloseButton,
                  (isAnimating || isClosing) && styles.disabledButton,
                ]}
                onPress={handleClose}
                disabled={isAnimating || isClosing}
                activeOpacity={0.7}
              >
                <Text style={modalSharedStyles.startAndCloseText}>CLOSE</Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalContent: {
    padding: 20,
    minHeight: 500,
  },
  loaderContainer: {
    padding: 20,
    minHeight: 500,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default React.memo(LevelReviewModal);
