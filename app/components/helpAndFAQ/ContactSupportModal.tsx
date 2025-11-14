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
import { Mail, Github } from "react-native-feather";
import { BASE_COLORS } from "@/constants/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constants/fontSizes";
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
            <CloseButton size={14} onPress={onClose} />
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
                Connect with us through any of these platforms
              </Text>

              <View style={styles.socialIconsContainer}>
                {/* Gmail */}
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: "#DB4437" }]}
                  onPress={handleEmailPress}
                >
                  <Mail width={20} height={20} color={BASE_COLORS.white} />
                  <Text style={styles.iconText}>Email</Text>
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: "#4267B2" }]}
                  onPress={handleFacebookPress}
                >
                  <Feather
                    name="facebook"
                    size={20}
                    color={BASE_COLORS.white}
                  />
                  <Text style={styles.iconText}>Facebook</Text>
                </TouchableOpacity>

                {/* GitHub */}
                <TouchableOpacity
                  style={[styles.iconButton, { backgroundColor: "#333" }]}
                  onPress={handleGitHubPress}
                >
                  <Github width={20} height={20} color={BASE_COLORS.white} />
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
    padding: 15,
  },

  modalTitle: {
    color: BASE_COLORS.white,
    fontFamily: POPPINS_FONT.medium,
    fontSize: COMPONENT_FONT_SIZES.card.subtitle,
    textAlign: "center",
  },

  modalBody: {
    padding: 10,
    paddingBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  contactText: {
    fontFamily: POPPINS_FONT.regular,
    fontSize: COMPONENT_FONT_SIZES.card.description,
    color: BASE_COLORS.darkText,
    textAlign: "center",
    marginBottom: 26,
  },
  socialIconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 10,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    borderRadius: 20,
    width: 75,
    height: 75,
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
    color: BASE_COLORS.white,
    fontFamily: POPPINS_FONT.medium,
    fontSize: COMPONENT_FONT_SIZES.card.caption,
    marginTop: 4,
  },
});

export default ContactSupportModal;
