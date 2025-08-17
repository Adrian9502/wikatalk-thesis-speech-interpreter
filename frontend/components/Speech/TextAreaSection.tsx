import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Text,
} from "react-native";
import { BASE_COLORS } from "@/constant/colors";
import useLanguageStore from "@/store/useLanguageStore";
import { INITIAL_TEXT, ERROR_TEXT } from "@/store/useLanguageStore";

interface TextAreaSectionProps {
  textField: string;
  colors: any;
  position: "top" | "bottom";
  onTextAreaFocus?: (position: "top" | "bottom") => void;
}

const TextAreaSection: React.FC<TextAreaSectionProps> = ({
  textField,
  colors: COLORS,
  position,
  onTextAreaFocus,
}) => {
  const isScrolling = useRef(false);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);

  const {
    setUpperText,
    setBottomText,
    debouncedTranslate,
    isTranslating,
    translationError,
  } = useLanguageStore();

  const handleTextChange = (text: string) => {
    // Don't allow editing if there's an error or if it's a user-friendly message
    if (translationError || isUserFriendlyMessage(textField)) return;

    // Update text in store
    if (position === "top") {
      setUpperText(text);
    } else {
      setBottomText(text);
    }

    // Trigger debounced translation if text is not empty
    if (text && text.trim() !== "") {
      debouncedTranslate(text, position);
    }
  };

  const handleFocus = () => {
    // Clear initial text when user focuses
    if (textField === INITIAL_TEXT) {
      if (position === "top") {
        setUpperText("");
      } else {
        setBottomText("");
      }
    }

    // Only trigger focus callback if not currently scrolling
    if (!isScrolling.current && onTextAreaFocus) {
      onTextAreaFocus(position);
    }
  };

  const handleScroll = () => {
    // Set scrolling state to true
    isScrolling.current = true;

    // Clear any existing timer
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }

    // Set timer to reset scrolling state after scroll ends
    scrollTimer.current = setTimeout(() => {
      isScrolling.current = false;
    }, 150); // 150ms delay after scrolling stops
  };

  // Function to detect user-friendly messages
  const isUserFriendlyMessage = (text: string): boolean => {
    const userFriendlyMessages = [
      "Recording too short",
      "Recording too long",
      "No speech detected",
      "Server could not process",
      "Invalid audio format",
      "Request timed out",
      "Translation failed",
    ];

    return userFriendlyMessages.some((message) =>
      text.toLowerCase().includes(message.toLowerCase())
    );
  };

  // Determine display state
  const getDisplayState = () => {
    // Check if it's a user-friendly error message
    if (isUserFriendlyMessage(textField)) {
      return {
        isError: true,
        isEditable: false,
        displayText: textField,
        textColor: BASE_COLORS.orange,
        showAsText: true,
      };
    }

    // Check if it's the generic translation error
    if (translationError) {
      return {
        isError: true,
        isEditable: false,
        displayText: ERROR_TEXT,
        textColor: BASE_COLORS.orange,
        showAsText: true,
      };
    }

    // FIXED: Handle initial text properly
    const isInitialText = textField === INITIAL_TEXT;

    return {
      isError: false,
      isEditable: true,
      displayText: isInitialText ? "" : textField, // FIXED: Show empty value for initial text
      placeholderText: isInitialText ? INITIAL_TEXT : "Start typing...", // FIXED: Use as placeholder
      textColor: COLORS.text,
      showAsText: false,
    };
  };

  const displayState = getDisplayState();

  return (
    <View style={styles.textAreaWrapper}>
      {displayState.showAsText ? (
        // Show error message in a non-editable text area
        <View style={[styles.textArea, { borderColor: COLORS.border }]}>
          <Text style={[styles.textField, { color: displayState.textColor }]}>
            {displayState.displayText}
          </Text>
        </View>
      ) : (
        // Show normal editable text input
        <TextInput
          value={displayState.displayText}
          onChangeText={handleTextChange}
          multiline
          style={[
            styles.textArea,
            styles.textField,
            {
              borderColor: COLORS.border,
              color: displayState.textColor,
            },
          ]}
          placeholder={displayState.placeholderText} // FIXED: Use proper placeholder
          placeholderTextColor={COLORS.placeholder} // This will now work properly
          editable={displayState.isEditable}
          scrollEnabled={true}
          textAlignVertical="top"
          onFocus={handleFocus}
          onScroll={handleScroll}
          showSoftInputOnFocus={displayState.isEditable}
        />
      )}

      {/* Show loading indicator when translating */}
      {isTranslating && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  textAreaWrapper: {
    flex: 1,
    marginVertical: 8,
    position: "relative",
    minHeight: 100,
  },
  textArea: {
    backgroundColor: BASE_COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    minHeight: 120,
    flex: 1,
  },
  textField: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    lineHeight: 20,
    textAlignVertical: "top",
    minHeight: 80,
  },
  loadingContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    padding: 4,
  },
});

export default TextAreaSection;
