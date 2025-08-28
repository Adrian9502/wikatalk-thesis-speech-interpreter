import React from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, FileText } from "react-native-feather";
import { BASE_COLORS } from "@/constant/colors";
import useThemeStore from "@/store/useThemeStore";
import { TERMS_OF_USE_CONTENT, TERMS_OF_USE_DATE } from "@/utils/termsOfUse";

interface TermsOfUseModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
  title?: string;
}

const TermsOfUseModal: React.FC<TermsOfUseModalProps> = ({
  visible,
  onClose,
  onAccept,
  showAcceptButton = false,
  title = "Terms of Use",
}) => {
  const { activeTheme } = useThemeStore();

  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    }
    onClose();
  };

  const formatContent = (content: string) => {
    // Split content by double line breaks to create paragraphs
    const paragraphs = content.split("\n\n");

    return paragraphs.map((paragraph, index) => {
      // Check if it's a header (starts with **)
      if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
        const headerText = paragraph.replace(/\*\*/g, "");
        return (
          <Text key={index} style={styles.headerText}>
            {headerText}
          </Text>
        );
      }

      // Regular paragraph
      return (
        <Text key={index} style={styles.contentText}>
          {paragraph.replace(/\*\*/g, "")}
        </Text>
      );
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      statusBarTranslucent={true}
    >
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: activeTheme.backgroundColor },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { borderBottomColor: "rgba(255, 255, 255, 0.1)" },
          ]}
        >
          <View style={styles.headerLeft}>
            <FileText width={20} height={20} color={BASE_COLORS.white} />
            <Text style={styles.headerTitle}>{title}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X width={20} height={20} color={BASE_COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Last Updated */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>Last updated: {TERMS_OF_USE_DATE}</Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.contentContainer}>
            {formatContent(TERMS_OF_USE_CONTENT)}
          </View>
        </ScrollView>

        {/* Accept Button (for registration flow) */}
        {showAcceptButton && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.acceptButton,
                { backgroundColor: activeTheme.secondaryColor },
              ]}
              onPress={handleAccept}
              activeOpacity={0.8}
            >
              <Text style={styles.acceptButtonText}>
                I Accept the Terms of Use
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.declineButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
    marginLeft: 10,
  },
  closeButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  dateContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  dateText: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerText: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: BASE_COLORS.white,
    marginBottom: 12,
    marginTop: 20,
    lineHeight: 24,
  },
  contentText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 20,
    marginBottom: 16,
    textAlign: "justify",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  acceptButton: {
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: BASE_COLORS.white,
  },
  declineButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  declineButtonText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "rgba(255, 255, 255, 0.7)",
  },
});

export default TermsOfUseModal;
