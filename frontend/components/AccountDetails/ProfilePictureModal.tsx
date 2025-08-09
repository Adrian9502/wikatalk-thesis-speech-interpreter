import React from "react";
import {
  Modal,
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import CloseButton from "../games/buttons/CloseButton";

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
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.imageContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={BASE_COLORS.blue} />
          ) : (
            <>
              <Image
                source={{ uri: imageUrl }}
                resizeMode="contain"
                style={styles.profileImage}
              />
              <CloseButton onPress={onClose} />
            </>
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
    width: "70%",
    height: 300,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
});

export default ProfilePictureModal;
