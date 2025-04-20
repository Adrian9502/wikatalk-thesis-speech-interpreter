import React from "react";
import {
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { X } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";

interface ProfilePictureModalProps {
  visible: boolean;
  imageUrl: string;
  onClose: () => void;
  isLoading?: boolean;
}

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  visible,
  imageUrl,
  onClose,
  isLoading = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X width={24} height={24} color="white" />
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={BASE_COLORS.blue} />
          ) : (
            <Image
              source={{ uri: imageUrl }}
              style={styles.profileImage}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: "90%",
    height: "70%",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});

export default ProfilePictureModal;
