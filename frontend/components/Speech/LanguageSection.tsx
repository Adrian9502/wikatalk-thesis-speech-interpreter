import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_COLORS, getPositionalColors } from "@/constant/colors";
import useLanguageStore from "@/store/useLanguageStore";
import LanguageSectionHeader from "./LanguageSectionHeader";
import TextAreaSection from "./TextAreaSection";
import LanguageBottomSection from "./LanguageBottomSection";

interface LanguageSectionProps {
  position: "top" | "bottom";
  handlePress: (userId: number) => void;
  recording?: boolean;
  userId: number;
}

const LanguageSection: React.FC<LanguageSectionProps> = ({
  position,
  handlePress,
  recording,
  userId,
}) => {
  // Animation for microphone button
  const [micAnimation] = useState(new Animated.Value(1));
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Get state from Zustand store
  const {
    language1,
    language2,
    upperTextfield,
    bottomTextfield,
    setLanguage1,
    setLanguage2,
    toggleTopDropdown,
    toggleBottomDropdown,
    showLanguageDetails,
  } = useLanguageStore();

  // Determine which language and text to use based on position
  const language = position === "top" ? language2 : language1;
  const textField = position === "top" ? upperTextfield : bottomTextfield;

  // Set language based on position
  const setLanguage = (lang: string) => {
    if (position === "top") {
      setLanguage2(lang);
    } else {
      setLanguage1(lang);
    }
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

  return (
    <View
      style={[
        styles.translateContainer,
        keyboardVisible &&
          position === "bottom" &&
          styles.keyboardVisibleBottom,
        keyboardVisible && position === "top" && styles.keyboardVisibleTop,
      ]}
    >
      <LinearGradient
        colors={[COLORS.secondary, COLORS.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Header Section */}
      <LanguageSectionHeader
        position={position}
        language={language}
        setLanguage={setLanguage}
        textField={textField}
        colors={COLORS}
        setDropdownOpen={setDropdownOpen}
      />

      {/* Text Area */}
      <TextAreaSection
        textField={textField}
        colors={COLORS}
        position={position}
      />

      {/* Bottom Section - Hide when keyboard is visible */}
      {(!keyboardVisible || position === "top") && (
        <LanguageBottomSection
          language={language}
          handlePress={handlePress}
          recording={recording}
          userId={userId}
          colors={COLORS}
          showLanguageDetails={showLanguageDetails}
          micAnimation={micAnimation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  translateContainer: {
    width: "100%",
    height: "48%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: BASE_COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    position: "relative",
    padding: 20,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  keyboardVisibleBottom: {
    height: "100%", // Expand the bottom section when keyboard is visible
  },
  keyboardVisibleTop: {
    height: "70%", // Shrink the top section when keyboard is visible
  },
});

export default LanguageSection;
