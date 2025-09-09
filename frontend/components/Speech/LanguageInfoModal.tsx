import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
} from "react-native";
import getLanguageBackground from "@/utils/getLanguageBackground";
import { LANGUAGE_INFO } from "@/constant/languages";
import useThemeStore from "@/store/useThemeStore";
import SectionRenderer from "@/components/speech/languageInfoModal/SectionRenderer";
import { createSections } from "@/utils/speech/languageInfoSection";
import CloseButton from "../games/buttons/CloseButton";
import { BASE_COLORS } from "@/constant/colors";
import { COMPONENT_FONT_SIZES, POPPINS_FONT } from "@/constant/fontSizes";

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
    background: BASE_COLORS.white,
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
          <CloseButton size={14} onPress={onClose} />
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
          </View>
          {/* Content using FlatList with the extracted renderer */}
          <FlatList
            data={sections}
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <SectionRenderer item={item} colors={colors} />
            )}
            contentContainerStyle={styles.listContent}
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContainer: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    position: "relative",
    elevation: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  titleText: {
    color: BASE_COLORS.white,
    fontFamily: POPPINS_FONT.medium,
    fontSize: COMPONENT_FONT_SIZES.card.title,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default LanguageInfoModal;
