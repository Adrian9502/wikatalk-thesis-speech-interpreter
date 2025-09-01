import React, { useState, useCallback } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import { Search, X } from "react-native-feather";
import CloseButton from "../games/buttons/CloseButton";

interface SearchBarProps {
  searchInput: string;
  setSearchInput: (text: string) => void;
  setSearchTerm: (term: string) => void;
}

const SearchBar = React.memo(
  ({ searchInput, setSearchInput, setSearchTerm }: SearchBarProps) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = useCallback(() => {
      setSearchInput("");
      setSearchTerm("");
    }, [setSearchInput, setSearchTerm]);

    const handleTextChange = useCallback(
      (text: string) => {
        setSearchInput(text);
        // Let the parent handle debounced search term setting
      },
      [setSearchInput]
    );

    return (
      <View
        style={[
          styles.searchContainer,
          isFocused && styles.searchContainerFocused,
        ]}
      >
        {/* Search Icon Container */}
        <View style={styles.iconContainer}>
          <Search width={14} height={14} color={BASE_COLORS.white} />
        </View>

        {/* Text Input */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search phrases or words..."
          placeholderTextColor={BASE_COLORS.placeholderText}
          value={searchInput}
          onChangeText={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />

        {/* Clear Button */}
        {searchInput.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.clearButtonWrapper}>
              <X width={13} height={13} color={BASE_COLORS.darkText} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: BASE_COLORS.white,
    borderColor: BASE_COLORS.borderColor,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchContainerFocused: {
    borderColor: BASE_COLORS.blue,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  // Icon Container
  iconContainer: {
    width: 26,
    backgroundColor: BASE_COLORS.blue,
    height: 26,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  // Text Input
  searchInput: {
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    color: BASE_COLORS.darkText,
    paddingVertical: 0,
  },

  // Clear Button
  clearButton: {
    marginLeft: 8,
  },
  clearButtonWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SearchBar;
