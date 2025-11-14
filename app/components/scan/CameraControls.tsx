import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constants/colors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Check if it's a small screen (like Nexus 4)
const isSmallScreen = screenWidth <= 384 && screenHeight <= 1280;
const isMediumScreen = screenWidth <= 414 && screenHeight <= 896;

interface CameraControlsProps {
  takePicture: () => void;
  pickImage: () => void;
  isProcessing: boolean;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  takePicture,
  pickImage,
  isProcessing,
}) => {
  // Get responsive dimensions
  const getResponsiveDimensions = () => {
    return {
      cameraButtonSize: isSmallScreen ? 50 : isMediumScreen ? 55 : 60,
      galleryButtonSize: isSmallScreen ? 36 : isMediumScreen ? 40 : 44,
      cameraIconSize: isSmallScreen ? 20 : isMediumScreen ? 22 : 24,
      galleryIconSize: isSmallScreen ? 16 : isMediumScreen ? 18 : 20,
      bottomOffset: isSmallScreen ? 10 : 15,
      marginHorizontal: isSmallScreen ? 8 : 10,
    };
  };

  const dimensions = getResponsiveDimensions();

  return (
    <View
      style={[styles.controlsContainer, { bottom: dimensions.bottomOffset }]}
    >
      <TouchableOpacity
        style={[
          styles.cameraButton,
          {
            width: dimensions.cameraButtonSize,
            height: dimensions.cameraButtonSize,
            borderRadius: dimensions.cameraButtonSize / 2,
            marginHorizontal: dimensions.marginHorizontal,
          },
        ]}
        onPress={takePicture}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color={BASE_COLORS.white} />
        ) : (
          <Ionicons
            name="camera"
            size={dimensions.cameraIconSize}
            color={BASE_COLORS.white}
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.galleryButton,
          {
            width: dimensions.galleryButtonSize,
            height: dimensions.galleryButtonSize,
            borderRadius: dimensions.galleryButtonSize / 2,
          },
        ]}
        onPress={pickImage}
        disabled={isProcessing}
      >
        <Ionicons
          name="images"
          size={dimensions.galleryIconSize}
          color={BASE_COLORS.white}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    position: "absolute",
    // bottom is set dynamically via style prop
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    // width, height, borderRadius, and marginHorizontal are set dynamically via style prop
    backgroundColor: BASE_COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
  },
  galleryButton: {
    // width, height, and borderRadius are set dynamically via style prop
    backgroundColor: BASE_COLORS.orange,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CameraControls;
