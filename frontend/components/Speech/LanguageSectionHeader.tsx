import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, AppState } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import { DIALECTS } from "@/constant/languages";
import { BASE_COLORS } from "@/constant/colors";
import useLanguageStore from "@/store/useLanguageStore";
import ConfidenceModal from "@/components/ConfidenceModal";
import {
  FONT_SIZES,
  POPPINS_FONT,
  COMPONENT_FONT_SIZES,
} from "@/constant/fontSizes";

interface LanguageSectionHeaderProps {
  position: "top" | "bottom";
  language: string;
  setLanguage: (lang: string) => void;
  textField: string;
  colors: any;
  setDropdownOpen: (isOpen: boolean) => void;
}

const LanguageSectionHeader: React.FC<LanguageSectionHeaderProps> = ({
  position,
  language,
  setLanguage,
  textField,
  colors: COLORS,
  setDropdownOpen,
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [confidenceModalVisible, setConfidenceModalVisible] = useState(false);
  const {
    clearText,
    copyToClipboard,
    speakText,
    stopSpeech,
    isTopSpeaking,
    isBottomSpeaking,
  } = useLanguageStore();

  const defaultMessage: string =
    "Tap the microphone icon to begin recording. Tap again to stop.";

  // Determine if this section is currently speaking
  const isSpeaking = position === "top" ? isTopSpeaking : isBottomSpeaking;

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        console.log(
          `[LanguageSectionHeader] App state changed to ${nextAppState}, stopping speech`
        );
        stopSpeech();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [stopSpeech]);

  // Handle copy with animation
  const handleCopy = async () => {
    await copyToClipboard(textField);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // UPDATED: Enhanced speaker button press handler with better section handling
  const handleSpeakerPress = async () => {
    console.log(
      `[LanguageSectionHeader] Speaker pressed - isSpeaking: ${isSpeaking}, position: ${position}`
    );

    if (isSpeaking) {
      // If currently speaking, stop the speech
      console.log(`[LanguageSectionHeader] Stopping speech for ${position}`);
      await stopSpeech();
    } else if (textField && textField !== defaultMessage) {
      // If not speaking and has valid text, start speaking
      console.log(
        `[LanguageSectionHeader] Starting speech for ${position}: "${textField.substring(
          0,
          50
        )}..."`
      );

      // NEW: Stop any ongoing speech before starting new one
      await stopSpeech();

      // NEW: Add small delay to ensure previous speech is fully stopped
      setTimeout(async () => {
        await speakText(textField, position, false); // Mark as manual trigger
      }, 100);
    }
  };

  // NEW: Enhanced clear text handler that stops speech
  const handleClearText = async () => {
    console.log(`[LanguageSectionHeader] Clearing text for ${position}`);

    // Stop speech immediately when clearing text
    if (isSpeaking) {
      console.log(
        `[LanguageSectionHeader] Stopping speech due to text clear for ${position}`
      );
      await stopSpeech();
    }

    // Clear the text
    clearText(position);
  };

  // handler for show confidence modal
  const handleShowConfidence = () => {
    console.log(
      `[LanguageSectionHeader] Opening confidence modal for ${language}`
    );
    setConfidenceModalVisible(true);
  };

  return (
    <View style={styles.header}>
      <View style={styles.dropdownContainer}>
        <Dropdown
          style={[
            styles.dropdown,
            { borderColor: COLORS.border },
            isFocus && { borderColor: COLORS.primary },
          ]}
          placeholderStyle={[
            styles.dropdownText,
            { color: COLORS.placeholder },
          ]}
          selectedTextStyle={[
            styles.dropdownText,
            { color: COLORS.text, borderRadius: 8 },
          ]}
          data={DIALECTS}
          maxHeight={250}
          labelField="label"
          valueField="value"
          placeholder="Tagalog"
          value={language}
          onFocus={() => {
            setIsFocus(true);
            setDropdownOpen(true);
          }}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            setLanguage(item.value);
            setIsFocus(false);
            setDropdownOpen(false);
          }}
          renderRightIcon={() => (
            <Ionicons
              name={isFocus ? "chevron-up" : "chevron-down"}
              size={20}
              color={COLORS.primary}
            />
          )}
          activeColor={COLORS.secondary}
          containerStyle={styles.dropdownList}
        />
      </View>

      <View style={styles.controls}>
        {/* UPDATED: Enhanced speaker button with visual feedback */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            isSpeaking && styles.controlButtonActive, // NEW: Active state styling
          ]}
          onPress={handleSpeakerPress}
          disabled={!textField || textField === defaultMessage}
        >
          <Ionicons
            name={isSpeaking ? "volume-high" : "volume-medium-outline"}
            size={20}
            color={isSpeaking ? COLORS.success : COLORS.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleShowConfidence}
        >
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleCopy}
          disabled={!textField || textField === defaultMessage}
        >
          <Ionicons
            name={copySuccess ? "checkmark-circle" : "copy-outline"}
            size={20}
            color={copySuccess ? COLORS.success : COLORS.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleClearText}
          disabled={!textField || textField === defaultMessage}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ConfidenceModal
        visible={confidenceModalVisible}
        language={language}
        onClose={() => setConfidenceModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    zIndex: 1000,
  },
  dropdownContainer: {
    zIndex: 2000,
    flex: 1,
    maxWidth: 160,
  },
  dropdown: {
    borderRadius: 20,
    borderWidth: 1,
    height: 46,
    backgroundColor: BASE_COLORS.white,
    paddingHorizontal: 12,
  },
  dropdownList: {
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderColor: BASE_COLORS.borderColor,
  },
  dropdownText: {
    fontSize: COMPONENT_FONT_SIZES.translation.language, // UPDATED: Use component font sizing
    fontFamily: POPPINS_FONT.regular, // UPDATED: Use font constant
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    width: 37,
    height: 37,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    borderRadius: 18,
  },
  controlButtonActive: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
});

export default LanguageSectionHeader;
