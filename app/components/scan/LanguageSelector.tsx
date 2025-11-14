import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import { DIALECTS } from "@/constants/languages";
import { BASE_COLORS } from "@/constants/colors";
import {
  FONT_SIZES,
  POPPINS_FONT,
  COMPONENT_FONT_SIZES,
} from "@/constants/fontSizes";

interface LanguageSelectorProps {
  targetLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  targetLanguage,
  onLanguageChange,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <View style={styles.languageSelectionContainer}>
      <Text style={styles.languageLabel}>Translate to</Text>
      <View style={styles.dropdownContainer}>
        <Dropdown
          style={[
            styles.dropdown,
            {
              borderColor: BASE_COLORS.borderColor,
              backgroundColor: "white",
            },
            isFocused && { borderColor: BASE_COLORS.blue },
          ]}
          itemTextStyle={{
            fontSize: FONT_SIZES.lg,
            fontFamily: POPPINS_FONT.regular,
            color: BASE_COLORS.darkText,
          }}
          placeholderStyle={[styles.dropdownText, { color: BASE_COLORS.blue }]}
          selectedTextStyle={[
            styles.dropdownText,
            { color: BASE_COLORS.blue, borderRadius: 8 },
          ]}
          data={DIALECTS}
          maxHeight={250}
          labelField="label"
          valueField="value"
          placeholder="Target Language"
          value={targetLanguage}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(item) => {
            onLanguageChange(item.value);
            setIsFocused(false);
          }}
          renderRightIcon={() => (
            <Ionicons
              name={isFocused ? "chevron-up" : "chevron-down"}
              size={18}
              color={BASE_COLORS.blue}
            />
          )}
          activeColor={BASE_COLORS.lightBlue}
          containerStyle={styles.dropdownList}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  languageSelectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    zIndex: 100,
  },
  languageLabel: {
    fontSize: COMPONENT_FONT_SIZES.translation.language, // UPDATED: Use translation language size
    fontFamily: POPPINS_FONT.medium, // UPDATED: Use font constant
    color: BASE_COLORS.blue,
    marginRight: 12,
    minWidth: 100,
  },
  dropdownContainer: {
    flex: 1,
    zIndex: 200,
  },
  dropdown: {
    borderRadius: 20,
    height: 40,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
  },
  dropdownList: {
    borderRadius: 20,
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  dropdownText: {
    fontSize: COMPONENT_FONT_SIZES.translation.language, // UPDATED: Use translation language size
    fontFamily: POPPINS_FONT.regular, // UPDATED: Use font constant
  },
});

export default LanguageSelector;
