import React, { useEffect } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { X } from "react-native-feather";
import { LevelData } from "@/types/gameTypes";
import modalSharedStyles from "@/styles/games/modalSharedStyles";
import { useLevelDetails } from "@/hooks/useLevelDetails";
import LevelHeader from "@/components/games/levelReviewModal/LevelHeader";
import LevelDetailsSection from "@/components/games/levelReviewModal/LevelDetailsSection";
import LevelStatsSection from "@/components/games/levelReviewModal/LevelStatsSection";

const { height: screenHeight } = Dimensions.get("window");

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
  const { details, isLoading, error } = useLevelDetails(
    level,
    visible && !!level
  );

  if (!level) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalSharedStyles.overlay}>
        <Animatable.View
          animation="zoomIn"
          duration={300}
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

            {/* Close button */}
            <TouchableOpacity
              onPress={onClose}
              style={modalSharedStyles.closeButton}
            >
              <X width={20} height={20} color="#fff" />
            </TouchableOpacity>

            {/* Fixed Header Section */}
            <LevelHeader level={level} />

            <LevelDetailsSection
              details={details}
              isLoading={isLoading}
              error={error}
            />
            <LevelStatsSection details={details} />

            {/* Fixed Continue Button */}
            <TouchableOpacity
              style={modalSharedStyles.startAndCloseButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={modalSharedStyles.startAndCloseText}>CLOSE</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animatable.View>
      </View>
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
    minHeight: 200,
  },
});

export default React.memo(LevelReviewModal);
