import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import { DIALECTS } from "@/constant/languages";
import { BASE_COLORS } from "@/constant/colors";

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
      <View style={styles.dropdownContainer}>
        <Text style={styles.languageLabel}>Translate to</Text>
        <Dropdown
          style={[
            styles.dropdown,
            {
              borderColor: BASE_COLORS.borderColor,
              backgroundColor: BASE_COLORS.lightPink,
            },
            isFocused && { borderColor: BASE_COLORS.orange },
          ]}
          placeholderStyle={[
            styles.dropdownText,
            { color: BASE_COLORS.placeholderText },
          ]}
          selectedTextStyle={[
            styles.dropdownText,
            { color: BASE_COLORS.orange, borderRadius: 8 },
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
              color={BASE_COLORS.orange}
            />
          )}
          activeColor={BASE_COLORS.lightPink}
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
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.orange,
    marginBottom: 7,
  },
  dropdownContainer: {
    flex: 1,
    zIndex: 200,
  },
  dropdown: {
    borderRadius: 8,
    borderWidth: 1,
    height: 50,
    paddingHorizontal: 12,
  },
  dropdownList: {
    borderRadius: 8,
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  dropdownText: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
  },
});

export default LanguageSelector;
