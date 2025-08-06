import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import { DIALECTS } from "@/constant/languages";
import { BASE_COLORS } from "@/constant/colors";

interface LanguageDropdownProps {
  selectedLanguage: string;
  handleLanguageChange: (language: string) => void;
}

const LanguageDropdown = ({
  selectedLanguage,
  handleLanguageChange,
}: LanguageDropdownProps) => {
  const [isDropdownFocus, setIsDropdownFocus] = useState(false);

  return (
    <View style={styles.dropdownContainer}>
      <Dropdown
        style={[
          styles.dropdown,
          isDropdownFocus && { borderColor: BASE_COLORS.blue },
        ]}
        placeholderStyle={styles.dropdownPlaceholder}
        selectedTextStyle={styles.dropdownSelectedText}
        data={DIALECTS}
        maxHeight={250}
        labelField="label"
        valueField="value"
        placeholder="Select language"
        value={selectedLanguage}
        onFocus={() => setIsDropdownFocus(true)}
        onBlur={() => setIsDropdownFocus(false)}
        onChange={(item) => {
          handleLanguageChange(item.value);
          setIsDropdownFocus(false);
        }}
        renderRightIcon={() => (
          <Ionicons
            name={isDropdownFocus ? "chevron-up" : "chevron-down"}
            size={18}
            color={BASE_COLORS.blue}
          />
        )}
        activeColor={BASE_COLORS.lightBlue}
        containerStyle={styles.dropdownList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownContainer: {
    flex: 1,
  },
  dropdown: {
    height: 48,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BASE_COLORS.borderColor,
    paddingHorizontal: 12,
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownList: {
    borderRadius: 20,
    borderWidth: 0,
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: BASE_COLORS.placeholderText,
  },
  dropdownSelectedText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: BASE_COLORS.darkText,
  },
});

export default LanguageDropdown;
