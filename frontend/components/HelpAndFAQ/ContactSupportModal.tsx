import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
} from "react-native";
import { X, Mail, Github } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";
import { Feather } from "@expo/vector-icons";
import CloseButton from "../games/buttons/CloseButton";

interface ContactSupportModalProps {
  visible: boolean;
  onClose: () => void;
}

const ContactSupportModal = ({
  visible,
  onClose,
}: ContactSupportModalProps) => {
  // Get the dynamic styles based on the current theme
  const { activeTheme } = useThemeStore();

  // Contact link handlers
  const handleEmailPress = () => {
    Linking.openURL("mailto:bontojohnadrian@gmail.com");
  };

  const handleFacebookPress = () => {
    Linking.openURL("https://www.facebook.com/john.adrian.bonto");
  };

  const handleGitHubPress = () => {
    Linking.openURL("https://github.com/Adrian9502");
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={onClose}
        >
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <CloseButton size={17} onPress={onClose}></CloseButton>
            <View
              style={[
                styles.modalHeader,
                { backgroundColor: activeTheme.backgroundColor },
              ]}
            >
              {/* Centered title */}
              <Text style={styles.modalTitle}>Contact Support</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.contactText}>
                Connect with us through any of these platforms:
              </Text>

              <View style={styles.socialIconsContainer}>
                {/* Gmail */}
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: "#DB4437" }]}
                  onPress={handleEmailPress}
                >
                  <Mail width={26} height={26} color={BASE_COLORS.white} />
                  <Text style={styles.iconText}>Email</Text>
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: "#4267B2" }]}
                  onPress={handleFacebookPress}
                >
                  <Feather
                    name="facebook"
                    size={26}
                    color={BASE_COLORS.white}
                  />
                  <Text style={styles.iconText}>Facebook</Text>
                </TouchableOpacity>

                {/* GitHub */}
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: "#333" }]}
                  onPress={handleGitHubPress}
                >
                  <Github width={26} height={26} color={BASE_COLORS.white} />
                  <Text style={styles.iconText}>GitHub</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 500,
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },

  modalTitle: {
    color: BASE_COLORS.white,
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    textAlign: "center",
  },

  modalBody: {
    padding: 26,
    alignItems: "center",
  },
  contactText: {
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: BASE_COLORS.darkText,
    textAlign: "center",
    marginBottom: 26,
  },
  socialIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 26,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 20,
    width: 90,
    height: 90,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconText: {
    color: "#fff",
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    marginTop: 8,
  },
});

export default ContactSupportModal;
