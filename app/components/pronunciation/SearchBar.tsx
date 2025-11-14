import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { BASE_COLORS } from "@/constants/colors";
import { Search, X } from "react-native-feather";
import CloseButton from "../games/buttons/CloseButton";
import {
  FONT_SIZES,
  POPPINS_FONT,
  COMPONENT_FONT_SIZES,
} from "@/constants/fontSizes"; // ADDED: Import font constants

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Check for different screen sizes
const isSmallScreen = screenWidth <= 384 && screenHeight <= 1280; // Nexus 4 and similar
const isMediumScreen = screenWidth <= 414 && screenHeight <= 896; // iPhone X/11 and similar

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

    // Get responsive dimensions
    const getResponsiveDimensions = () => {
      return {
        paddingHorizontal: isSmallScreen ? 10 : 12,
        paddingVertical: isSmallScreen ? 5 : 6,
        borderRadius: isSmallScreen ? 16 : 20,
        iconContainerSize: isSmallScreen ? 22 : 26,
        iconSize: isSmallScreen ? 12 : 14,
        clearButtonSize: isSmallScreen ? 20 : 24,
        clearIconSize: isSmallScreen ? 11 : 13,
        marginRight: isSmallScreen ? 10 : 12,
        marginLeft: isSmallScreen ? 6 : 8,
      };
    };

    const dimensions = getResponsiveDimensions();

    return (
      <View
        style={[
          styles.searchContainer,
          {
            paddingHorizontal: dimensions.paddingHorizontal,
            paddingVertical: dimensions.paddingVertical,
            borderRadius: dimensions.borderRadius,
          },
          isFocused && styles.searchContainerFocused,
        ]}
      >
        {/* Search Icon Container */}
        <View
          style={[
            styles.iconContainer,
            {
              width: dimensions.iconContainerSize,
              height: dimensions.iconContainerSize,
              borderRadius: dimensions.iconContainerSize / 2,
              marginRight: dimensions.marginRight,
            },
          ]}
        >
          <Search
            width={dimensions.iconSize}
            height={dimensions.iconSize}
            color={BASE_COLORS.white}
          />
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
            style={{ marginLeft: dimensions.marginLeft }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View
              style={[
                styles.clearButtonWrapper,
                {
                  width: dimensions.clearButtonSize,
                  height: dimensions.clearButtonSize,
                  borderRadius: dimensions.clearButtonSize / 2,
                },
              ]}
            >
              <X
                width={dimensions.clearIconSize}
                height={dimensions.clearIconSize}
                color={BASE_COLORS.darkText}
              />
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
    // paddingHorizontal, paddingVertical, and borderRadius are set dynamically via style prop
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
    backgroundColor: BASE_COLORS.blue,
    justifyContent: "center",
    alignItems: "center",
  },

  // Text Input
  searchInput: {
    flex: 1,
    fontFamily: POPPINS_FONT.medium,
    fontSize: COMPONENT_FONT_SIZES.input.text,
    color: BASE_COLORS.darkText,
    paddingVertical: 0,
  },

  clearButtonWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SearchBar;
