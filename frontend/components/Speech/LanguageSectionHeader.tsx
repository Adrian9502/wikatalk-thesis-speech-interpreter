import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import { DIALECTS } from "@/constant/languages";
import { BASE_COLORS } from "@/constant/colors";
import useLanguageStore from "@/store/useLanguageStore";

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
  const {
    clearText,
    copyToClipboard,
    showLanguageDetails,
    speakText,
    stopSpeech,
    isTopSpeaking,
    isBottomSpeaking,
  } = useLanguageStore();

  // Determine if this section is currently speaking
  const isSpeaking = position === "top" ? isTopSpeaking : isBottomSpeaking;

  // Handle copy with animation
  const handleCopy = async () => {
    await copyToClipboard(textField);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Handle speaker button press
  const handleSpeakerPress = async () => {
    if (isSpeaking) {
      await stopSpeech();
    } else if (
      textField &&
      textField !==
        "Tap the microphone icon to begin recording. Tap again to stop."
    ) {
      await speakText(textField, position === "top" ? "top" : "bottom");
    }
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
              size={18}
              color={COLORS.primary}
            />
          )}
          activeColor={COLORS.secondary}
          containerStyle={styles.dropdownList}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleSpeakerPress}
          disabled={
            !textField ||
            textField ===
              "Tap the microphone icon to begin recording. Tap again to stop."
          }
        >
          <Ionicons
            name={isSpeaking ? "volume-high" : "volume-medium-outline"}
            size={22}
            color={isSpeaking ? COLORS.success : COLORS.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => showLanguageDetails(language)}
        >
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={COLORS.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleCopy}
          disabled={
            !textField ||
            textField ===
              "Tap the microphone icon to begin recording. Tap again to stop."
          }
        >
          <Ionicons
            name={copySuccess ? "checkmark-circle" : "copy-outline"}
            size={22}
            color={copySuccess ? COLORS.success : COLORS.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => clearText(position)}
          disabled={
            !textField ||
            textField ===
              "Tap the microphone icon to begin recording. Tap again to stop."
          }
        >
          <Ionicons name="trash-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
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
    borderRadius: 16,
    borderWidth: 1,
    height: 46,
    backgroundColor: BASE_COLORS.white,
    paddingHorizontal: 12,
  },
  dropdownList: {
    borderRadius: 16,
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
    fontSize: 16,
    fontFamily: "Poppins-Regular",
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
  },
});

export default LanguageSectionHeader;
