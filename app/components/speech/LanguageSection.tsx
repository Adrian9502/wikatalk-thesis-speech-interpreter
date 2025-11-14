import React, { useState, useEffect } from "react";
import { View, StyleSheet, Animated, Keyboard, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_COLORS, getPositionalColors } from "@/constants/colors";
import useLanguageStore from "@/store/useLanguageStore";
import LanguageSectionHeader from "./LanguageSectionHeader";
import TextAreaSection from "./TextAreaSection";
import LanguageBottomSection from "./LanguageBottomSection";

interface LanguageSectionProps {
  position: "top" | "bottom";
  handlePress: (userId: number) => void;
  recording?: boolean;
  userId: number;
  onTextAreaFocus?: (position: "top" | "bottom") => void;
  recordingDuration?: number;
}

const LanguageSection: React.FC<LanguageSectionProps> = ({
  position,
  handlePress,
  recording,
  userId,
  onTextAreaFocus,
  recordingDuration = 0,
}) => {
  // Animation for microphone button
  const [micAnimation] = useState(new Animated.Value(1));
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get("window"));

  // Get state from Zustand store
  const {
    language1,
    language2,
    upperTextfield,
    bottomTextfield,
    toggleTopDropdown,
    toggleBottomDropdown,
    showLanguageDetails,
    handleLanguageChange,
  } = useLanguageStore();

  // Determine which language and text to use based on position
  const language = position === "top" ? language2 : language1;
  const textField = position === "top" ? upperTextfield : bottomTextfield;

  // Set language based on position
  const setLanguage = (lang: string) => {
    const prevLang = position === "top" ? language2 : language1;

    // Use the enhanced language change handler
    handleLanguageChange(lang, position, prevLang);
  };

  // Open dropdown and close the other
  const setDropdownOpen = (isOpen: boolean) => {
    if (position === "top") {
      toggleTopDropdown(isOpen);
    } else {
      toggleBottomDropdown(isOpen);
    }
  };

  // Get colors based on position using the utility function
  const COLORS = getPositionalColors(position);

  // Track screen dimensions changes
  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };

    const subscription = Dimensions.addEventListener("change", onChange);
    return () => subscription?.remove();
  }, []);

  // Track keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Animation for recording
  useEffect(() => {
    if (recording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micAnimation, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(micAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(micAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [recording]);

  // FIXED: Calculate responsive dimensions with better height allocation
  const getResponsiveStyles = () => {
    const { height, width } = screenData;
    const isSmallScreen = height < 700; // Nexus 4 height is 640
    const isVerySmallScreen = height < 650; // Extra small screens like Nexus 4
    const isKeyboardShowing = keyboardVisible;

    // FIXED: Better height calculations for small screens
    let sectionHeight, minHeight, padding;

    if (isKeyboardShowing) {
      if (position === "bottom") {
        // Bottom section when keyboard is visible - give more space
        sectionHeight = isVerySmallScreen ? height * 0.55 : height * 0.5;
        minHeight = height * 0.45;
        padding = 12;
      } else {
        // FIXED: Top section when keyboard is visible - maintain reasonable minimum height
        sectionHeight = isVerySmallScreen ? height * 0.35 : height * 0.38; // Increased from 0.25/0.28
        minHeight = isVerySmallScreen ? height * 0.32 : height * 0.35; // Increased from 0.22
        padding = 12; // Increased padding slightly
      }
    } else {
      // FIXED: Normal state - better distribution for small screens
      if (isVerySmallScreen) {
        // Nexus 4 and similar small screens
        sectionHeight = height * 0.46; // Increased from 0.42
        minHeight = height * 0.42;
        padding = 12; // Reduced padding to save space
      } else if (isSmallScreen) {
        sectionHeight = height * 0.45;
        minHeight = height * 0.4;
        padding = 14;
      } else {
        sectionHeight = height * 0.45;
        minHeight = height * 0.4;
        padding = 20;
      }
    }

    return {
      height: sectionHeight,
      minHeight,
      padding,
      borderRadius: isVerySmallScreen ? 14 : isSmallScreen ? 16 : 20, // Smaller radius for very small screens
    };
  };

  const responsiveStyles = getResponsiveStyles();

  return (
    <View
      style={[
        styles.translateContainer,
        {
          height: responsiveStyles.height,
          minHeight: responsiveStyles.minHeight,
          padding: responsiveStyles.padding,
          borderRadius: responsiveStyles.borderRadius,
        },
      ]}
    >
      <LinearGradient
        colors={[COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Header  */}
      <LanguageSectionHeader
        position={position}
        language={language}
        setLanguage={setLanguage}
        textField={textField}
        colors={COLORS}
        setDropdownOpen={setDropdownOpen}
      />

      {/* Text Area */}
      <View style={styles.textAreaContainer}>
        <TextAreaSection
          textField={textField}
          colors={COLORS}
          position={position}
          onTextAreaFocus={onTextAreaFocus}
        />
      </View>

      {/* Bottom Section  */}
      {(!keyboardVisible || position === "top") && (
        <LanguageBottomSection
          language={language}
          handlePress={handlePress}
          recording={recording}
          userId={userId}
          colors={COLORS}
          showLanguageDetails={showLanguageDetails}
          micAnimation={micAnimation}
          recordingDuration={recordingDuration}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  translateContainer: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    position: "relative",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  textAreaContainer: {
    flex: 1,
    marginVertical: 4,
  },
});

export default LanguageSection;
