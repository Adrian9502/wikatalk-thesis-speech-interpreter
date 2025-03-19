import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_COLORS } from "@/constant/colors";

interface CameraControlsProps {
  takePicture: () => void;
  pickImage: () => void;
  isProcessing: boolean;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  takePicture,
  pickImage,
  isProcessing,
}) => (
  <View style={styles.controlsContainer}>
    <TouchableOpacity
      style={styles.cameraButton}
      onPress={takePicture}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Ionicons name="camera" size={24} color="#fff" />
      )}
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.galleryButton}
      onPress={pickImage}
      disabled={isProcessing}
    >
      <Ionicons name="images" size={20} color="#fff" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  controlsContainer: {
    position: "absolute",
    bottom: 15,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BASE_COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BASE_COLORS.orange,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CameraControls;
