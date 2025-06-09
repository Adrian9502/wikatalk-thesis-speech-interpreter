import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
} from "react-native";
import { X } from "react-native-feather";
import getLanguageBackground from "@/utils/getLanguageBackground";
import { LANGUAGE_INFO } from "@/constant/languages";
import useThemeStore from "@/store/useThemeStore";
import SectionRenderer from "@/components/speech/languageInfoModal/SectionRenderer";
import { createSections } from "@/utils/Speech/LanguageInfoModal/languageInfoSection";

interface LanguageInfoModalProps {
  visible: boolean;
  languageName: string;
  onClose: () => void;
}

const LanguageInfoModal: React.FC<LanguageInfoModalProps> = ({
  visible,
  languageName,
  onClose,
}) => {
  if (!languageName || !LANGUAGE_INFO[languageName]) {
    return null;
  }

  // Get the dynamic styles based on the current theme
  const { activeTheme } = useThemeStore();
  const languageInfo = LANGUAGE_INFO[languageName];
  const windowHeight = Dimensions.get("window").height;
  const windowWidth = Dimensions.get("window").width;
  const backgroundImage = getLanguageBackground(languageName);

  // Modern color scheme
  const colors = {
    primary: activeTheme.secondaryColor,
    secondary: "#FF6F4A",
    background: "#FFFFFF",
    cardBg: "#F9FAFF",
    text: "#212132",
    textLight: "#9E9EA7",
    accent: "#10B981",
    border: "#E8E8ED",
  };

  // Create sections data for FlatList
  const sections = createSections({
    languageName,
    languageInfo,
    backgroundImage,
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.background,
              maxHeight: windowHeight * 0.8,
              width: windowWidth > 500 ? 500 : windowWidth * 0.9,
            },
          ]}
        >
          {/* Fixed Header */}
          <View
            style={[
              styles.header,
              { backgroundColor: activeTheme.backgroundColor },
            ]}
          >
            <Text style={[styles.titleText, { color: colors.background }]}>
              {languageName} Dialect
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
            >
              <X
                width={18}
                height={18}
                strokeWidth={2}
                stroke={colors.background}
              />
            </TouchableOpacity>
          </View>

          {/* Content using FlatList with the extracted renderer */}
          <FlatList
            data={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SectionRenderer item={item} colors={colors} />
            )}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={<View style={{ height: 20 }} />}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 24,
  },
  header: {
    height: 56,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    position: "relative",
  },
  titleText: {
    fontSize: 18,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default LanguageInfoModal;
